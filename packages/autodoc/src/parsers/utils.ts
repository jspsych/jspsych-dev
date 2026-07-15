import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { ExampleInfo, FunctionInfo, ParameterInfo, ReturnInfo } from "../types/info.js";
import { PARAMETER_TYPE_MAP } from "../renderers/utils.js";

// --- PARSE SRC FILE UTILS ---

/** thing that removes comments from nested parameter types */
export const printer = ts.createPrinter({ removeComments: true });

/** Grabs JSDoc comments from a node. */
export function extractJsDocComment(node: ts.Node, source: ts.SourceFile): string | undefined {
  const jsDoc = ts.getJSDocCommentsAndTags(node);
  const rawComment = jsDoc[0] && ts.isJSDoc(jsDoc[0]) ? jsDoc[0].comment : undefined;
  return (
    typeof rawComment === "string" ? rawComment : rawComment?.map((n) => n.getText(source)).join("")
  )
    ?.replace(/\s*\n\s*/g, " ")
    .trim();
}

/**
 * pads a backtick-surrounded string with two backticks and a space,
 * in order to ensure that the original backticks are not interpreted 
 * as markdown code delimiters.
 */
function wrapBackticks(text: string): string {
  return text.includes("`") ? `\` ${text} \`` : text;
}

/** Parses one parameter from an parameter node. */
export function parseParamGroup(
  node: ts.ObjectLiteralExpression,
  source: ts.SourceFile,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    if (!ts.isObjectLiteralExpression(prop.initializer)) continue;
    const name = prop.name.getText(source);
    const info = extractParameter(prop.initializer, source);
    const comment = extractJsDocComment(prop, source);
    if (comment) info.description = comment;
    result[name] = info;
  }
  return result;
}

/** Gathers parameter information (type, default, etc.) from a node. */
function extractParameter(node: ts.ObjectLiteralExpression, source: ts.SourceFile): ParameterInfo {
  const result: Partial<ParameterInfo> = {};

  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = prop.name.getText(source);

    switch (key) {
      case "type": {
        if (ts.isPropertyAccessExpression(prop.initializer)) {
          const raw = prop.initializer.getText(source);
          result.type = PARAMETER_TYPE_MAP[raw] ?? raw;
        }
        break;
      }
      case "default": {
        result.default = wrapBackticks(prop.initializer.getText(source));
        break;
      }
      case "array": {
        if (prop.initializer.kind === ts.SyntaxKind.TrueKeyword) {
          result.array = true;
        } else if (prop.initializer.kind === ts.SyntaxKind.FalseKeyword) {
          result.array = false;
        }
        break;
      }
      case "nested": {
        if (ts.isObjectLiteralExpression(prop.initializer)) {
          result.nested = parseParamGroup(prop.initializer, source);
        }
        break;
      }
    }
  }

  return result as ParameterInfo;
}

/** Parses the extension parameter interface signatures. */
export function parseTSParamGroup(
  node: ts.InterfaceDeclaration,
  source: ts.SourceFile,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  for (const member of node.members) {
    if (!ts.isPropertySignature(member)) continue;
    result[member.name.getText(source)] = parseTSProperty(member, source);
  }
  for (const [name, info] of Object.entries(result)) {
    const rootHasDefault = !!info.default;
    const childHasDefault = !!info.nested && Object.values(info.nested).some((n) => !!n.default);
    if (!rootHasDefault && !childHasDefault) {
      console.warn(`Warning: No @default tag found for parameter "${name}" or any of its nested children.`);
    }
  }
  return result;
}

/** Parses an inline type literal's members into ParameterInfo records. */
function parseTSTypeLiteral(
  node: ts.TypeLiteralNode,
  source: ts.SourceFile,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  for (const member of node.members) {
    if (!ts.isPropertySignature(member)) continue;
    result[member.name.getText(source)] = parseTSProperty(member, source);
  }
  return result;
}

/** Parses a single property signature into a ParameterInfo. */
function parseTSProperty(
  member: ts.PropertySignature,
  source: ts.SourceFile,
): ParameterInfo {
  const name = member.name.getText(source);
  const info: Partial<ParameterInfo> = {};

  if (member.type) {
    let typeNode: ts.TypeNode = member.type;
    if (ts.isArrayTypeNode(typeNode)) {
      info.array = true;
      typeNode = typeNode.elementType;
    }
    info.type = printer.printNode(ts.EmitHint.Unspecified, typeNode, source)
      .replace(/\s*\n\s*/g, " ")
      .replace(/; \}/g, " }") // remove end ; } -> } for complex types 
      .replace(/; /g, ", ") // replace semicolon w comma to make it JSON-like
      .trim();
    if (ts.isTypeLiteralNode(typeNode)) {
      info.nested = parseTSTypeLiteral(typeNode, source);
    }
  } else {
    console.warn(`Warning: No type annotation found for parameter "${name}".`);
    info.type = "unknown type";
  }

  const description = extractJsDocComment(member, source);
  if (description) info.description = description;

  const defaultTag = ts.getJSDocTags(member).find((t) => t.tagName.text === "default");
  if (defaultTag) {
    const raw = defaultTag.comment;
    info.default = (
      typeof raw === "string" ? raw : raw?.map((n) => n.getText(source)).join("")
    )?.trim();
  }

  return info as ParameterInfo;
}

// --- PARSE EXAMPLE FILE UTILS ---

/** Strips common leading whitespace from all lines of a multi-line string. */
export function dedent(text: string): string {
  const lines = text.split("\n");
  const minIndent = Math.min(
    ...lines.filter((l) => l.trim().length > 0).map((l) => l.match(/^( *)/)![1].length),
  );
  return lines.map((l) => l.slice(minIndent)).join("\n").trim();
}

/**
 * Gets the example code block text from a given HTML file. Looks for sentinels first and
 * orders sub-blocks via file position. Otherwise, delegates to the provided fallback or throws.
 */
export function getCodeBlock(
  sourceContent: string,
  sourcePath: string,
  inferFallback: (content: string, path: string) => string,
): string {
  const START = "// jspsych-autodoc:start";
  const END = "// jspsych-autodoc:end";

  type Marker = { type: "start" | "end"; pos: number };
  const markers: Marker[] = [];

  let i = 0;
  while (i < sourceContent.length) {
    const s = sourceContent.indexOf(START, i);
    const e = sourceContent.indexOf(END, i);
    if (s === -1 && e === -1) break;
    if (s !== -1 && (e === -1 || s < e)) {
      markers.push({ type: "start", pos: s });
      i = s + START.length;
    } else {
      markers.push({ type: "end", pos: e });
      i = e + END.length;
    }
  }

  if (markers.length === 0) {
    return inferFallback(sourceContent, sourcePath);
  }

  for (let j = 0; j < markers.length; j++) {
    const expected = j % 2 === 0 ? "start" : "end";
    if (markers[j].type !== expected)
      throw new Error(
        `${sourcePath}: mismatched jspsych-autodoc sentinels: unexpected ${markers[j].type} at marker ${j + 1}`,
      );
  }
  if (markers.length % 2 !== 0)
    throw new Error(
      `${sourcePath}: mismatched jspsych-autodoc sentinels: last start has no matching end`,
    );

  const blocks: string[] = [];
  for (let j = 0; j < markers.length; j += 2) {
    const newlineAfterStart = sourceContent.indexOf("\n", markers[j].pos);
    const blockStart =
      newlineAfterStart === -1 ? markers[j].pos + START.length : newlineAfterStart + 1;
    const blockEnd = markers[j + 1].pos;
    blocks.push(sourceContent.slice(blockStart, blockEnd).trimEnd());
  }

  return blocks.join("\n\n");
}

/** Fetch example information from a given HTML filepath. `undefined` if the file is ignored
 * via sentinel <!-- jspsych-autodoc:ignore -->. */
export function getExampleInfo(
  sourcePath: string,
  inferFallback: (content: string, path: string) => string,
): Record<string, ExampleInfo> | undefined {
  const content = fs.readFileSync(sourcePath, "utf-8");

  if (/<!--\s*jspsych-autodoc:ignore\s*-->/.test(content)) return undefined;

  let title: string;

  const sentinelMatch = content.match(/<!--\s*jspsych-autodoc:title\s+(.+?)\s*-->/);
  if (sentinelMatch) {
    title = sentinelMatch[1].trim();
  } else {
    const titleTagMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
    if (!titleTagMatch) throw new Error(`No title found in example file: ${sourcePath}`);
    title = titleTagMatch[1].trim();
  }

  return {
    [title]: { path: sourcePath, code: getCodeBlock(content, sourcePath, inferFallback) },
  };
}

/** Collects example info from a directory or single HTML file. */
export function collectExamples(
  examplePath: string,
  inferFallback: (content: string, path: string) => string,
): Record<string, ExampleInfo> {
  if (!fs.existsSync(examplePath)) {
    throw new Error(`Example path does not exist: ${examplePath}`);
  }

  const stat = fs.statSync(examplePath);
  const htmlFiles: string[] = [];

  if (stat.isDirectory()) {
    htmlFiles.push(
      ...fs
        .readdirSync(examplePath)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(examplePath, f)),
    );
  } else if (stat.isFile()) {
    if (!examplePath.endsWith(".html")) {
      throw new Error(`Example file must be an HTML file: ${examplePath}`);
    }
    htmlFiles.push(examplePath);
  } else {
    throw new Error(`Example path is neither a file nor a directory: ${examplePath}`);
  }

  const result: Record<string, ExampleInfo> = {};
  for (const file of htmlFiles) {
    const exampleInfo = getExampleInfo(file, inferFallback);
    if (exampleInfo) Object.assign(result, exampleInfo);
  }
  return result;
}

// --- SHARED FUNCTION / TYPE PARSING ---
// Turns function signatures and their TSDoc into `ParameterInfo`/`FunctionInfo`.
// Shared by the timeline parser (free `createTimeline`/`timelineUnits`/`utils`
// functions) and the plugin/extension parsers (class helper methods).

/** pairs together an interface declaration with the source file it was found in */
export type InterfaceEntry = { kind: "interface"; decl: ts.InterfaceDeclaration; source: ts.SourceFile };

/**
 * pairs together a `const x = { ... }` object value with the source file it was
 * found in, so that `typeof x` parameter types can be expanded and hoisted the
 * same way interfaces are (e.g. BART's `text_object: typeof trial_text`).
 */
export type ValueShapeEntry = {
  kind: "value";
  objLiteral: ts.ObjectLiteralExpression;
  decl: ts.VariableDeclaration;
  source: ts.SourceFile;
};

/** anything that can be hoisted into the shared Configuration Options section */
export type HoistEntry = InterfaceEntry | ValueShapeEntry;

/**
 * the hoist key for a parsed type: an interface uses its own name, while a
 * `typeof x` value-shape uses the bare value name `x` (so the shared section is
 * titled `x`, not `typeof x`). Kept in sync with the `typeof ` prefix that
 * `parseTypeNode` writes for value-shape types.
 */
export function hoistKeyForType(type: string): string {
  return type.startsWith("typeof ") ? type.slice("typeof ".length) : type;
}

/**
 * pairs together names of interface with their corresponding `ParameterInfo`s.
 * makes it so we can hoist interfaces in one pass
 */
export type UsageMap = Map<string, ParameterInfo[]>;

function recordInterfaceUsage(
  usageMap: UsageMap,
  interfaceMap: Map<string, HoistEntry>,
  info: ParameterInfo,
): void {
  const key = hoistKeyForType(info.type);
  if (!info.nested || !interfaceMap.has(key)) return;
  const sites = usageMap.get(key);
  if (sites) sites.push(info);
  else usageMap.set(key, [info]);
}

export function buildInterfaceMap(
  source: ts.SourceFile,
  program?: ts.Program,
): Map<string, HoistEntry> {
  const map = new Map<string, HoistEntry>();
  const filesToSearch = program
    ? [
        source,
        ...program
          .getSourceFiles()
          .filter((f) => f !== source && !f.fileName.includes("/node_modules/")),
      ]
    : [source];
  for (const file of filesToSearch) {
    for (const stmt of file.statements) {
      if (ts.isInterfaceDeclaration(stmt) && !map.has(stmt.name.text)) {
        map.set(stmt.name.text, { kind: "interface", decl: stmt, source: file });
      }
    }
  }
  // second pass: object-valued consts, used to expand `typeof x` parameter types.
  // interfaces win on name collisions (added first, and not overwritten here).
  for (const file of filesToSearch) {
    for (const stmt of file.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer) &&
          !map.has(decl.name.text)
        ) {
          map.set(decl.name.text, {
            kind: "value",
            objLiteral: decl.initializer,
            decl,
            source: file,
          });
        }
      }
    }
  }
  return map;
}

function resolveDefaultExpr(
  initializer: ts.Expression,
  source: ts.SourceFile,
): ts.Expression {
  if (ts.isIdentifier(initializer)) {
    for (const stmt of source.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.name.text === initializer.text &&
          decl.initializer
        ) {
          return decl.initializer;
        }
      }
    }
  }
  return initializer;
}

function getPropertyExpression(
  objLiteral: ts.ObjectLiteralExpression,
  propName: string,
): ts.Expression | undefined {
  for (const prop of objLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    let name: string;
    if (ts.isIdentifier(prop.name)) name = prop.name.text;
    else if (ts.isStringLiteral(prop.name)) name = prop.name.text;
    else continue;
    if (name === propName) return prop.initializer;
  }
  return undefined;
}

/** gathers jsdoc \@param tags to attach to regular params */
function getJsDocParamDescriptions(
  docNode: ts.Node,
  source: ts.SourceFile,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const tag of ts.getJSDocTags(docNode)) {
    if (!ts.isJSDocParameterTag(tag) || !ts.isIdentifier(tag.name)) continue;
    const raw = tag.comment;
    const desc = (
      typeof raw === "string" ? raw : raw?.map((n) => n.getText(source)).join("")
    )?.trim();
    if (desc) result[tag.name.text] = desc;
  }
  return result;
}

/** reads the description from a function's \@returns (or \@return) tag, if any */
function getJsDocReturnDescription(docNode: ts.Node, source: ts.SourceFile): string | undefined {
  for (const tag of ts.getJSDocTags(docNode)) {
    if (tag.tagName.text !== "returns" && tag.tagName.text !== "return") continue;
    const raw = tag.comment;
    const desc = (
      typeof raw === "string" ? raw : raw?.map((n) => n.getText(source)).join("")
    )
      ?.replace(/\s*\n\s*/g, " ")
      .trim();
    if (desc) return desc;
  }
  return undefined;
}

/** collects the code blocks attached to each \@example tag on a function */
function getJsDocExamples(docNode: ts.Node, source: ts.SourceFile): string[] {
  const examples: string[] = [];
  for (const tag of ts.getJSDocTags(docNode)) {
    if (tag.tagName.text !== "example") continue;
    const raw = tag.comment;
    const text = typeof raw === "string" ? raw : raw?.map((n) => n.getText(source)).join("");
    const trimmed = text?.trim();
    if (trimmed) examples.push(trimmed);
  }
  return examples;
}

function entityNameText(name: ts.EntityName): string {
  if (ts.isIdentifier(name)) return name.text;
  return entityNameText(name.left) + "." + name.right.text;
}

// typeSource: the source file where typeNode is defined.
// defaultSource: the source file where defaultExpr is defined (always the main source file).
// These are tracked explicitly because ts.createProgram does not set parent nodes,
// so node.getSourceFile() and node.getText() without arguments are unavailable.
export function parseTypeNode(
  typeNode: ts.TypeNode | undefined,
  typeSource: ts.SourceFile,
  defaultExpr: ts.Expression | undefined,
  defaultSource: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  visited: Set<string>,
  usageMap: UsageMap,
): ParameterInfo {
  const info: Partial<ParameterInfo> = {};
  if (defaultExpr) info.default = defaultExpr.getText(defaultSource);

  if (!typeNode) {
    info.type = "unknown";
    return info as ParameterInfo;
  }

  if (ts.isArrayTypeNode(typeNode)) {
    info.array = true;
    const inner = parseTypeNode(typeNode.elementType, typeSource, undefined, defaultSource, interfaceMap, visited, usageMap);
    info.type = inner.type;
    if (inner.nested) info.nested = inner.nested;
    return info as ParameterInfo;
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = entityNameText(typeNode.typeName);

    if (typeName === "Array" && typeNode.typeArguments?.length === 1) {
      info.array = true;
      const inner = parseTypeNode(typeNode.typeArguments[0], typeSource, undefined, defaultSource, interfaceMap, visited, usageMap);
      info.type = inner.type;
      if (inner.nested) info.nested = inner.nested;
      return info as ParameterInfo;
    }

    // a generic instantiation (e.g. `Promise<any>`, `Map<string, number>`): keep the full
    // type text instead of collapsing to the bare name, and don't attempt interface
    // expansion/hoisting, a generic application isn't a plain interface to expand.
    if (typeNode.typeArguments && typeNode.typeArguments.length > 0) {
      info.type = printer
        .printNode(ts.EmitHint.Unspecified, typeNode, typeSource)
        .replace(/\s*\n\s*/g, " ")
        .trim();
      return info as ParameterInfo;
    }

    info.type = typeName;

    if (!visited.has(typeName)) {
      const entry = interfaceMap.get(typeName);
      if (entry?.kind === "interface") {
        const defaultObjLiteral =
          defaultExpr && ts.isObjectLiteralExpression(defaultExpr) ? defaultExpr : undefined;
        info.nested = parseInterfaceMembers(
          entry,
          defaultObjLiteral,
          defaultSource,
          interfaceMap,
          new Set(visited).add(typeName),
          usageMap,
        );
      }
    }

    return info as ParameterInfo;
  }

  // `typeof x`: keep the readable `typeof x` label, but if `x` resolves to a known
  // object-valued const, expand its shape so the type can be hoisted (and so a
  // single use still renders its fields inline).
  if (ts.isTypeQueryNode(typeNode)) {
    const valueName = entityNameText(typeNode.exprName);
    info.type = `typeof ${valueName}`;
    if (!visited.has(valueName)) {
      const entry = interfaceMap.get(valueName);
      if (entry?.kind === "value") {
        info.nested = parseValueShapeMembers(entry.objLiteral, entry.source);
      }
    }
    return info as ParameterInfo;
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    info.type = printer
      .printNode(ts.EmitHint.Unspecified, typeNode, typeSource)
      .replace(/\s*\n\s*/g, " ")
      .replace(/; \}/g, " }")
      .replace(/; /g, ", ")
      .trim();
    const defaultObjLiteral =
      defaultExpr && ts.isObjectLiteralExpression(defaultExpr) ? defaultExpr : undefined;
    info.nested = parseTypeLiteralMembers(typeNode, typeSource, defaultObjLiteral, defaultSource, interfaceMap, visited, usageMap);
    return info as ParameterInfo;
  }

  info.type = printer.printNode(ts.EmitHint.Unspecified, typeNode, typeSource).trim();
  return info as ParameterInfo;
}

export function parseInterfaceMembers(
  entry: InterfaceEntry,
  defaultObjLiteral: ts.ObjectLiteralExpression | undefined,
  defaultSource: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  visited: Set<string>,
  usageMap: UsageMap,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  const { decl: interfaceDecl, source: memberSource } = entry;
  for (const member of interfaceDecl.members) {
    if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) continue;
    const name = member.name.text;
    const memberDefault = defaultObjLiteral
      ? getPropertyExpression(defaultObjLiteral, name)
      : undefined;
    const info = parseTypeNode(member.type, memberSource, memberDefault, defaultSource, interfaceMap, visited, usageMap);
    const desc = extractJsDocComment(member, memberSource);
    if (desc) info.description = desc;
    if (!info.default) {
      const defaultTag = ts.getJSDocTags(member).find((t) => t.tagName.text === "default");
      if (defaultTag) {
        const raw = defaultTag.comment;
        const val = (
          typeof raw === "string" ? raw : raw?.map((n) => n.getText(memberSource)).join("")
        )?.trim();
        if (val) info.default = val;
      }
    }
    // intentionally not recorded in usageMap: hoisting only applies to types used directly
    // as a function parameter (see parseFunctionParams), not to types nested inside another
    // interface's members -- otherwise an interface nested inside an already-hoisted interface
    // would appear to have 2+ usages (once per re-expansion of the outer interface) and get
    // spuriously hoisted into its own orphaned, duplicated section.
    result[name] = info;
  }
  return result;
}

function parseTypeLiteralMembers(
  typeNode: ts.TypeLiteralNode,
  typeSource: ts.SourceFile,
  defaultObjLiteral: ts.ObjectLiteralExpression | undefined,
  defaultSource: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  visited: Set<string>,
  usageMap: UsageMap,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  for (const member of typeNode.members) {
    if (!ts.isPropertySignature(member) || !ts.isIdentifier(member.name)) continue;
    const name = member.name.text;
    const memberDefault = defaultObjLiteral
      ? getPropertyExpression(defaultObjLiteral, name)
      : undefined;
    const info = parseTypeNode(member.type, typeSource, memberDefault, defaultSource, interfaceMap, visited, usageMap);
    const desc = extractJsDocComment(member, typeSource);
    if (desc) info.description = desc;
    // see comment in parseInterfaceMembers: nested member usage is intentionally not recorded
    result[name] = info;
  }
  return result;
}

/**
 * Infers a parameter type string from a value expression (an object-const's
 * property), since these are plain values with no type annotations. Resolves a
 * single level of identifier reference (e.g. `instruction_pages` -> its array)
 * and array element types one level deep.
 */
function inferValueType(expr: ts.Expression, source: ts.SourceFile, depth = 0): { type: string; array?: boolean } {
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr) || ts.isTemplateExpression(expr))
    return { type: "string" };
  if (ts.isNumericLiteral(expr)) return { type: "number" };
  if (expr.kind === ts.SyntaxKind.TrueKeyword || expr.kind === ts.SyntaxKind.FalseKeyword)
    return { type: "boolean" };
  if (ts.isPrefixUnaryExpression(expr)) return inferValueType(expr.operand, source, depth);
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) return { type: "function" };
  if (ts.isArrayLiteralExpression(expr)) {
    const first = expr.elements[0];
    const inner = first && depth < 3 ? inferValueType(first, source, depth + 1) : { type: "unknown" };
    return { type: inner.type, array: true };
  }
  if (ts.isObjectLiteralExpression(expr)) return { type: "object" };
  if (ts.isIdentifier(expr) && depth < 1) {
    const resolved = resolveDefaultExpr(expr, source);
    if (resolved !== expr) return inferValueType(resolved, source, depth + 1);
  }
  return { type: "unknown" };
}

/**
 * parses an object-const's literal into `ParameterInfo`s for a `typeof x` type.
 * field types are inferred from the values, and each value's source text is kept
 * as the "default" (these values are the defaults a researcher would override).
 */
export function parseValueShapeMembers(
  objLiteral: ts.ObjectLiteralExpression,
  source: ts.SourceFile,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  for (const prop of objLiteral.properties) {
    let name: string | undefined;
    let valueExpr: ts.Expression | undefined;
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
      name = prop.name.text;
      valueExpr = prop.initializer;
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      name = prop.name.text;
      valueExpr = prop.name;
    } else if (ts.isMethodDeclaration(prop) && ts.isIdentifier(prop.name)) {
      name = prop.name.text;
    }
    if (!name) continue;

    const info = { type: "function" } as ParameterInfo;
    if (valueExpr) {
      const inferred = inferValueType(valueExpr, source);
      info.type = inferred.type;
      info.default = valueExpr.getText(source);
      if (inferred.array) info.array = true;
    }
    const desc = extractJsDocComment(prop, source);
    if (desc) info.description = desc;
    result[name] = info;
  }
  return result;
}

/**
 * picks a display name (and JSDoc description) for a destructured parameter,
 * which has no identifier of its own in source. timeline factories conventionally
 * document the bag with a single `@param config ...` tag, so we adopt the first
 * such "leftover" tag, one that doesn't name an identifier parameter, and fall
 * back to `config` (suffixed on collision) when there is none.
 */
function resolveDestructuredName(
  paramDescs: Record<string, string>,
  identifierParamNames: Set<string>,
  existing: Record<string, ParameterInfo>,
): { name: string; description?: string } {
  for (const [tagName, desc] of Object.entries(paramDescs)) {
    if (!identifierParamNames.has(tagName) && !(tagName in existing)) {
      return { name: tagName, description: desc };
    }
  }
  let name = "config";
  for (let i = 2; name in existing; i++) name = `config${i}`;
  return { name };
}

/**
 * handles destructured object parameters (like `{ ... }: Config = {}`) as a
 * single parameter typed by annotations. per-field defaults are on binding elements,
 * not in the object literal. this also allows for shared config interfaces to be hoisted
 */
function parseDestructuredParam(
  param: ts.ParameterDeclaration,
  pattern: ts.ObjectBindingPattern,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): ParameterInfo {
  const defaultExpr =
    param.initializer && ts.isObjectLiteralExpression(param.initializer)
      ? param.initializer
      : undefined;
  const info = parseTypeNode(param.type, source, defaultExpr, source, interfaceMap, new Set(), usageMap);

  if (info.nested) {
    for (const element of pattern.elements) {
      if (!ts.isIdentifier(element.name) || !element.initializer) continue;
      const target = info.nested[element.name.text];
      if (target && !target.default) target.default = element.initializer.getText(source);
    }
  }
  return info;
}

/**
 * parses the parameter list of a function-like node into `ParameterInfo` records.
 *
 * @param signatureNode the node whose `.parameters` are read (a function/method
 * declaration, or an arrow/function expression assigned to a class property)
 * @param docNode the node the TSDoc `@param` tags are attached to -- usually the
 * same node, but for an arrow-valued property the doc lives on the property
 * declaration while the parameters live on the initializer
 */
export function parseFunctionParams(
  signatureNode: ts.SignatureDeclarationBase,
  docNode: ts.Node,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  const params = [...signatureNode.parameters];
  const paramDescs = getJsDocParamDescriptions(docNode, source);
  const identifierParamNames = new Set(
    params.filter((p) => ts.isIdentifier(p.name)).map((p) => (p.name as ts.Identifier).text),
  );
  for (const param of params) {
    if (ts.isIdentifier(param.name)) {
      const name = param.name.text;
      const defaultExpr = param.initializer
        ? resolveDefaultExpr(param.initializer, source)
        : undefined;
      const info = parseTypeNode(param.type, source, defaultExpr, source, interfaceMap, new Set(), usageMap);
      const desc = paramDescs[name];
      if (desc) info.description = desc;
      recordInterfaceUsage(usageMap, interfaceMap, info);
      result[name] = info;
    } else if (ts.isObjectBindingPattern(param.name)) {
      const info = parseDestructuredParam(param, param.name, source, interfaceMap, usageMap);
      const { name, description } = resolveDestructuredName(paramDescs, identifierParamNames, result);
      if (description && !info.description) info.description = description;
      recordInterfaceUsage(usageMap, interfaceMap, info);
      result[name] = info;
    }
    // array binding patterns and other parameter shapes are intentionally skipped
  }
  return result;
}

// --- CLASS MEMBER PARSING (plugins/extensions) ---

/** the plugin lifecycle methods that every plugin defines; excluded from helper docs */
export const PLUGIN_LIFECYCLE_METHODS = new Set(["trial", "simulate"]);

/** the extension lifecycle methods that every extension defines; excluded from helper docs */
export const EXTENSION_LIFECYCLE_METHODS = new Set([
  "initialize",
  "on_start",
  "on_load",
  "on_finish",
]);

const VOID_RETURN_TYPES = new Set(["void", "undefined", "never"]);

/** builds the return info for a function, or `undefined` for an unannotated/`void` return */
function getReturnInfo(
  signatureNode: ts.SignatureDeclarationBase,
  docNode: ts.Node,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): ReturnInfo | undefined {
  if (!signatureNode.type) return undefined;
  const parsed = parseTypeNode(signatureNode.type, source, undefined, source, interfaceMap, new Set(), usageMap);
  if (VOID_RETURN_TYPES.has(parsed.type)) return undefined;
  const info: ReturnInfo = { type: parsed.type };
  if (parsed.array) info.array = true;
  const description = getJsDocReturnDescription(docNode, source);
  if (description) info.description = description;
  return info;
}

/**
 * parses a single class member into a `FunctionInfo`, or returns `undefined` when
 * the member is not a documentable helper function. a member is documented when it
 * is a public (not `private`/`protected`) method, or a public property whose
 * initializer is an arrow/function expression. the parameters/return come from the
 * signature; the description/`@param`/`@returns`/`@example` come from the member's TSDoc.
 */
export function parseFunction(
  member: ts.MethodDeclaration | ts.PropertyDeclaration,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): { name: string; info: FunctionInfo } | undefined {
  // skip computed names and ecmascript-private (`#name`) members
  if (!member.name || !ts.isIdentifier(member.name)) return undefined;

  const modifiers = member.modifiers ?? [];
  const isPrivate = modifiers.some(
    (m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword,
  );
  if (isPrivate) return undefined;

  let signatureNode: ts.SignatureDeclarationBase | undefined;
  if (ts.isMethodDeclaration(member)) {
    signatureNode = member;
  } else if (
    ts.isPropertyDeclaration(member) &&
    member.initializer &&
    (ts.isArrowFunction(member.initializer) || ts.isFunctionExpression(member.initializer))
  ) {
    signatureNode = member.initializer;
  }
  if (!signatureNode) return undefined;

  const isStatic = modifiers.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
  const info: FunctionInfo = {
    description: extractJsDocComment(member, source) ?? "",
    isStatic,
    parameters: parseFunctionParams(signatureNode, member, source, interfaceMap, usageMap),
    returns: getReturnInfo(signatureNode, member, source, interfaceMap, usageMap),
    examples: getJsDocExamples(member, source),
  };
  return { name: member.name.text, info };
}

/**
 * Collects all documentable helper functions from a plugin/extension class,
 * excluding the required lifecycle methods named in `denyList` (and the
 * constructor, which is never a `MethodDeclaration`/`PropertyDeclaration`).
 *
 * Interface expansion is single-file: types referenced by a helper's parameters
 * are only resolved if declared in the same source file. Hoisting of shared
 * interfaces is intentionally not applied here (the usage map is discarded).
 */
export function collectClassFunctions(
  classNode: ts.ClassDeclaration,
  source: ts.SourceFile,
  denyList: Set<string>,
): Record<string, FunctionInfo> {
  const interfaceMap = buildInterfaceMap(source);
  const usageMap: UsageMap = new Map();
  const result: Record<string, FunctionInfo> = {};
  for (const member of classNode.members) {
    if (!ts.isMethodDeclaration(member) && !ts.isPropertyDeclaration(member)) continue;
    if (member.name && ts.isIdentifier(member.name) && denyList.has(member.name.text)) continue;
    const parsed = parseFunction(member, source, interfaceMap, usageMap);
    if (parsed) result[parsed.name] = parsed.info;
  }
  return result;
}
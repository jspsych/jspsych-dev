import ts from "typescript";
import { TimelineInfo, TimelineHelperInfo, ParameterInfo } from "../types/info.js";
import { collectExamples, dedent, extractJsDocComment, printer } from "./utils.js";


// --- INTERFACE MAP ---

/** pairs together an interface declaration with the source file it was found in */
type InterfaceEntry = { kind: "interface"; decl: ts.InterfaceDeclaration; source: ts.SourceFile };

/**
 * pairs together a `const x = { ... }` object value with the source file it was
 * found in, so that `typeof x` parameter types can be expanded and hoisted the
 * same way interfaces are (e.g. BART's `text_object: typeof trial_text`).
 */
type ValueShapeEntry = {
  kind: "value";
  objLiteral: ts.ObjectLiteralExpression;
  decl: ts.VariableDeclaration;
  source: ts.SourceFile;
};

/** anything that can be hoisted into the shared Configuration Options section */
type HoistEntry = InterfaceEntry | ValueShapeEntry;

/**
 * the hoist key for a parsed type: an interface uses its own name, while a
 * `typeof x` value-shape uses the bare value name `x` (so the shared section is
 * titled `x`, not `typeof x`). Kept in sync with the `typeof ` prefix that
 * `parseTypeNode` writes for value-shape types.
 */
function hoistKeyForType(type: string): string {
  return type.startsWith("typeof ") ? type.slice("typeof ".length) : type;
}

/** 
 * pairs together names of interface with their corresponding `ParameterInfo`s. 
 * makes it so we can hoist interfaces in one pass
 */
type UsageMap = Map<string, ParameterInfo[]>;

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

function buildInterfaceMap(
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

// --- DEFAULT RESOLUTION ---

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

// --- JSDOC ---

/** gathers jsdoc \@param tags to attach to regular params */
function getJsDocParamDescriptions(
  funcNode: ts.FunctionDeclaration,
  source: ts.SourceFile,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const tag of ts.getJSDocTags(funcNode)) {
    if (!ts.isJSDocParameterTag(tag) || !ts.isIdentifier(tag.name)) continue;
    const raw = tag.comment;
    const desc = (
      typeof raw === "string" ? raw : raw?.map((n) => n.getText(source)).join("")
    )?.trim();
    if (desc) result[tag.name.text] = desc;
  }
  return result;
}

// --- TYPE PARSING ---

function entityNameText(name: ts.EntityName): string {
  if (ts.isIdentifier(name)) return name.text;
  return entityNameText(name.left) + "." + name.right.text;
}

// typeSource: the source file where typeNode is defined.
// defaultSource: the source file where defaultExpr is defined (always the main source file).
// These are tracked explicitly because ts.createProgram does not set parent nodes,
// so node.getSourceFile() and node.getText() without arguments are unavailable.
function parseTypeNode(
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

function parseInterfaceMembers(
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

// --- VALUE SHAPE PARSING (for `typeof x`) ---

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
 * Parses an object-const's literal into `ParameterInfo`s for a `typeof x` type.
 * Field types are inferred from the values, and each value's source text is kept
 * as the "default" (these values are the defaults a researcher would override).
 */
function parseValueShapeMembers(
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

// --- FUNCTION PARSING ---

/**
 * Picks a display name (and JSDoc description) for a destructured parameter,
 * which has no identifier of its own in source. Timeline factories conventionally
 * document the bag with a single `@param config ...` tag, so we adopt the first
 * such "leftover" tag -- one that doesn't name an identifier parameter -- and fall
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

function parseFunctionParams(
  funcNode: ts.FunctionDeclaration,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): Record<string, ParameterInfo> {
  const result: Record<string, ParameterInfo> = {};
  const params = [...funcNode.parameters];
  const paramDescs = getJsDocParamDescriptions(funcNode, source);
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

function parseHelperFunction(
  funcNode: ts.FunctionDeclaration,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): TimelineHelperInfo {
  return {
    description: extractJsDocComment(funcNode, source) ?? "",
    helperParameters: parseFunctionParams(funcNode, source, interfaceMap, usageMap),
  };
}

// --- SOURCE TRAVERSAL ---

/** @returns a map associating names of functions with their function declarations */
function buildFunctionMap(source: ts.SourceFile): Map<string, ts.FunctionDeclaration> {
  const map = new Map<string, ts.FunctionDeclaration>();
  for (const stmt of source.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      map.set(stmt.name.text, stmt);
    }
  }
  return map;
}

/** @returns a list of function names from a given timeline object export */
function collectExportedFunctionNames(source: ts.SourceFile, exportName: string): string[] {
  for (const stmt of source.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    if (!stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== exportName) continue;
      if (!decl.initializer || !ts.isObjectLiteralExpression(decl.initializer)) continue;
      return decl.initializer.properties
        .filter((p): p is ts.ShorthandPropertyAssignment => ts.isShorthandPropertyAssignment(p))
        .map((p) => p.name.text);
    }
  }
  return [];
}

// --- EXPORTED API ---

function findCreateTimeline(source: ts.SourceFile): ts.FunctionDeclaration {
  for (const stmt of source.statements) {
    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.name?.text === "createTimeline" &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      return stmt;
    }
  }
  throw new Error(`Could not find exported createTimeline function in: ${source.fileName}`);
}

/**
 * recursively rewrites every `ParameterInfo` whose type was hoisted: its `nested`
 * expansion is dropped and replaced with an `interfaceRef`. Walking the tree (rather
 * than only the directly-recorded param sites) means a hoisted type also collapses
 * to a ref where it appears nested inside another type's fields.
 */
function refHoistedTypes(params: Record<string, ParameterInfo>, hoisted: Set<string>): void {
  for (const info of Object.values(params)) {
    if (!info.nested) continue;
    const key = hoistKeyForType(info.type);
    if (hoisted.has(key)) {
      delete info.nested;
      info.interfaceRef = key;
    } else {
      refHoistedTypes(info.nested, hoisted);
    }
  }
}

/**
 * modifies `result` to hoist interfaces (and `typeof` value-shapes) used directly as
 * a parameter in 2 or more timeline functions into the shared section, then replaces
 * every occurrence of a hoisted type -- including nested ones -- with an `interfaceRef`.
 */
function hoistSharedInterfaces(
  result: TimelineInfo,
  usageMap: UsageMap,
  interfaceMap: Map<string, HoistEntry>,
  source: ts.SourceFile,
): void {
  const hoisted = new Set<string>();
  for (const [name, sites] of usageMap) {
    if (sites.length >= 2 && interfaceMap.has(name)) hoisted.add(name);
  }

  // build each shared section first, so nested refs (applied below) resolve to it
  for (const name of hoisted) {
    const entry = interfaceMap.get(name)!;
    const interfaceParameters =
      entry.kind === "interface"
        ? parseInterfaceMembers(entry, undefined, source, interfaceMap, new Set([name]), usageMap)
        : parseValueShapeMembers(entry.objLiteral, entry.source);
    result.interfaces[name] = {
      description: extractJsDocComment(entry.decl, entry.source) ?? "",
      interfaceParameters,
    };
  }

  // rewrite every site (params and the shared sections themselves) in one tree walk
  const allParams = [
    result.createTimeline.helperParameters,
    ...Object.values(result.timelineUnits).map((u) => u.helperParameters),
    ...Object.values(result.utils).map((u) => u.helperParameters),
    ...Object.values(result.interfaces).map((i) => i.interfaceParameters),
  ];
  for (const params of allParams) refHoistedTypes(params, hoisted);
}

export function getTimelineInfo(filePath: string): TimelineInfo {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
  });
  // ts.createProgram's default host parses source files without setting parent
  // pointers; triggering the checker runs binding, which sets them. Required for
  // node.getText()/getSourceFile() and JSDoc lookups (ts.getJSDocCommentsAndTags
  // walks node.parent) to work.
  program.getTypeChecker();

  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) throw new Error(`Could not load source file: ${filePath}`);

  const result: TimelineInfo = {
    name: "",
    description: "",
    version: "",
    createTimeline: { description: "", helperParameters: {} },
    timelineUnits: {},
    utils: {},
    interfaces: {},
    examples: {},
  };

  const interfaceMap = buildInterfaceMap(sourceFile, program);
  const funcMap = buildFunctionMap(sourceFile);
  const createTimelineNode = findCreateTimeline(sourceFile);
  const usageMap: UsageMap = new Map();

  result.createTimeline = parseHelperFunction(createTimelineNode, sourceFile, interfaceMap, usageMap);

  for (const name of collectExportedFunctionNames(sourceFile, "timelineUnits")) {
    const func = funcMap.get(name);
    if (func) result.timelineUnits[name] = parseHelperFunction(func, sourceFile, interfaceMap, usageMap);
  }

  for (const name of collectExportedFunctionNames(sourceFile, "utils")) {
    const func = funcMap.get(name);
    if (func) result.utils[name] = parseHelperFunction(func, sourceFile, interfaceMap, usageMap);
  }

  hoistSharedInterfaces(result, usageMap, interfaceMap, sourceFile);
  return result;
}

/**
 * generates a `inferCodeBlock` function with existing `TimelineInfo`, used to 
 * find all usages of `<timeline>.createTimeline(...)`, alongside any exported
 * functions from `timelineUnits` and `utils`. does one level of indirection, 
 * and deduplicates in case something like a `utils` function is found stuck in
 * a config file.
 */
function makeInferCodeBlock(info: TimelineInfo) {
  const utilNames = new Set(Object.keys(info.utils));
  const unitNames = new Set(Object.keys(info.timelineUnits));

  return function inferCodeBlock(sourceContent: string, sourcePath: string): string {
    const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    const blocks: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = scriptRegex.exec(sourceContent)) !== null) blocks.push(match[1]);

    if (blocks.length === 0) throw new Error(`${sourcePath}: no inline script blocks found`);
    if (blocks.length > 1)
      throw new Error(
        `${sourcePath}: multiple inline script blocks found, use jspsych-autodoc:start/end sentinels instead`,
      );

    const scriptContent = blocks[0];
    const sourceFile = ts.createSourceFile("example.js", scriptContent, ts.ScriptTarget.Latest, true);

    // walks up to the direct child of sourceFile that contains `node`
    function topLevelStatement(node: ts.Node): ts.Node {
      let current = node;
      while (current.parent !== sourceFile) current = current.parent;
      return current;
    }

    // statements containing a createTimeline()/utils/timelineUnits call, keyed by position to dedupe
    const coreStatements = new Map<number, ts.Node>();
    const coreCalls: ts.CallExpression[] = [];

    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const access = node.expression;
        const isCreateTimeline = access.name.text === "createTimeline";
        const isCoreHelper =
          ts.isPropertyAccessExpression(access.expression) &&
          ((access.expression.name.text === "utils" && utilNames.has(access.name.text)) ||
            (access.expression.name.text === "timelineUnits" && unitNames.has(access.name.text)));

        if (isCreateTimeline || isCoreHelper) {
          const stmt = topLevelStatement(node);
          coreStatements.set(stmt.pos, stmt);
          coreCalls.push(node);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);

    if (coreStatements.size === 0)
      throw new Error(
        `${sourcePath}: no createTimeline()/utils/timelineUnits usage found — use jspsych-autodoc:start/end sentinels instead`,
      );

    // build map of all local variable declarations, excluding statements already matched above
    const localDecls = new Map<string, ts.VariableStatement>();
    function visitDecls(node: ts.Node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        const stmt = node.parent.parent;
        if (ts.isVariableStatement(stmt) && !coreStatements.has(stmt.pos)) {
          localDecls.set(node.name.text, stmt);
        }
      }
      ts.forEachChild(node, visitDecls);
    }
    visitDecls(sourceFile);

    // Collect identifier references from a node, skipping property assignment keys
    function collectIdentifiers(node: ts.Node, result: Set<string>) {
      if (ts.isPropertyAssignment(node)) {
        collectIdentifiers(node.initializer, result);
        return;
      }
      if (ts.isIdentifier(node)) {
        result.add(node.text);
        return;
      }
      ts.forEachChild(node, (child) => collectIdentifiers(child, result));
    }

    // gather matched statements and their one-level dependencies (e.g. a config object
    // passed into createTimeline), keyed by position to deduplicate
    const outputStatements = new Map<number, ts.Node>(coreStatements);
    for (const call of coreCalls) {
      const refs = new Set<string>();
      for (const arg of call.arguments) collectIdentifiers(arg, refs);
      for (const ref of refs) {
        const decl = localDecls.get(ref);
        if (decl) outputStatements.set(decl.pos, decl);
      }
    }

    return Array.from(outputStatements.values())
      .sort((a, b) => a.pos - b.pos)
      .map((node) => dedent(node.getFullText(sourceFile)))
      .join("\n\n");
  };
}

export function getTimelineInfoAndExamples(filePath: string, examplePath: string): TimelineInfo {
  const info = getTimelineInfo(filePath);
  info.examples = collectExamples(examplePath, makeInferCodeBlock(info));
  return info;
}

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { ExampleInfo, ParameterInfo } from "../types/info.js";

// --- PARSE SRC FILE UTILS ---

/** thing that removes comments from nested parameter types */
const printer = ts.createPrinter({ removeComments: true });

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
          result.type = prop.initializer.getText(source);
        }
        break;
      }
      case "default": {
        result.default = prop.initializer.getText(source);
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
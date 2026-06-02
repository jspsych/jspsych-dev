import ts from "typescript";
import { ParameterInfo } from "../types/info.js";

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
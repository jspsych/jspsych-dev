import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { ExtensionInfo } from "../types/info.js";
import { extractJsDocComment, parseParamGroup, parseTSParamGroup } from "./utils.js";

export function getExtensionInfo(
  source: ts.SourceFile,
  classNode: ts.ClassDeclaration,
): ExtensionInfo {
  let result: ExtensionInfo = {
    name: "",
    description: "",
    version: "",
    initializeParameters: {},
    onStartParameters: {},
    onLoadParameters: {},
    onFinishParameters: {},
    data: {},
    examples: {},
  };

  const comment = extractJsDocComment(classNode, source);
  if (comment) result.description = comment;
  else console.warn("No JSDoc comment found for extension class");

  let infoNode: ts.ObjectLiteralExpression | undefined;
  for (const member of classNode.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      member.name.getText(source) === "info" &&
      member.initializer &&
      ts.isObjectLiteralExpression(member.initializer)
    ) {
      infoNode = member.initializer;
      break;
    }
  }

  if (infoNode === undefined) {
    throw new Error("Could not find info object in extension file.");
  }

  const nameProp = infoNode.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === "name",
  ) as ts.PropertyAssignment | undefined;
  if (nameProp && ts.isStringLiteral(nameProp.initializer)) {
    result.name = nameProp.initializer.text;
  }

  const dataProp = infoNode.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === "data",
  ) as ts.PropertyAssignment | undefined;
  if (dataProp && ts.isObjectLiteralExpression(dataProp.initializer)) {
    result.data = parseParamGroup(dataProp.initializer, source);
  }

  const paramInterfaces: Record<string, keyof ExtensionInfo> = {
    InitializeParameters: "initializeParameters",
    OnStartParameters: "onStartParameters",
    OnLoadParameters: "onLoadParameters",
    OnFinishParameters: "onFinishParameters",
  };

  for (const statement of source.statements) {
    if (ts.isInterfaceDeclaration(statement)) {
      const field = paramInterfaces[statement.name.text];
      if (field) {
        (result[field] as Record<string, unknown>) = parseTSParamGroup(statement, source);
      }
    }
  }

  return result;
}

export function getExtensionInfoAndExamples(
  source: ts.SourceFile,
  classNode: ts.ClassDeclaration,
  examplePath: string,
): ExtensionInfo {
  const info = getExtensionInfo(source, classNode);

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

  // TODO: actually implement this
  return info;
}

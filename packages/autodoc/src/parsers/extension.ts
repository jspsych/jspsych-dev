import ts from "typescript";
import { ExtensionInfo } from "../types/info.js";
import { collectExamples, dedent, extractJsDocComment, parseParamGroup, parseTSParamGroup } from "./utils.js";

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

/**
 * Fallback code block extractor for HTML extension example files without sentinels. Requires
 * exactly one inline script block. Extracts the `initJsPsych` call and all trial variables
 * (any variable name that matches the "trial" pattern in camel/snake case) OR whose object
 * literal contains an `extensions` field. For each matched trial, its direct local
 * dependencies (one level of indirection) are also included. The initJsPsych variable itself
 * is never treated as a dependency.
 */
function inferCodeBlock(sourceContent: string, sourcePath: string): string {
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

  const trialPattern = /^[a-zA-Z_$]*[Tt]rial(_?\d+)?$/;
  let initStatement: ts.VariableStatement | undefined;
  let initJsPsychVarName: string | undefined;
  let initJsPsychHasExtensions = false;
  const trialNodes: ts.VariableDeclaration[] = [];

  function hasExtensionsProperty(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) return false;
    if (
      ts.isObjectLiteralExpression(node) &&
      node.properties.some(
        (p) =>
          ts.isPropertyAssignment(p) &&
          ts.isIdentifier(p.name) &&
          p.name.text === "extensions",
      )
    )
      return true;
    return ts.forEachChild(node, hasExtensionsProperty) ?? false;
  }

  function visitNodes(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const init = node.initializer;

      if (
        init &&
        ts.isCallExpression(init) &&
        ts.isIdentifier(init.expression) &&
        init.expression.text === "initJsPsych"
      ) {
        const stmt = node.parent.parent;
        if (ts.isVariableStatement(stmt)) {
          initStatement = stmt;
          initJsPsychVarName = node.name.text;
          initJsPsychHasExtensions = init.arguments.some(hasExtensionsProperty);
        }
      } else if (init && (trialPattern.test(node.name.text) || hasExtensionsProperty(init))) {
        trialNodes.push(node);
      }
    }
    ts.forEachChild(node, visitNodes);
  }
  visitNodes(sourceFile);

  if (!initStatement)
    throw new Error(
      `${sourcePath}: no initJsPsych call found — use jspsych-autodoc:start/end sentinels instead`,
    );

  if (trialNodes.length === 0)
    throw new Error(
      initJsPsychHasExtensions
        ? `${sourcePath}: extension found in initJsPsych but no trial variables found that use the extension — use jspsych-autodoc:start/end sentinels instead`
        : `${sourcePath}: no variables with an "extensions" field found — use jspsych-autodoc:start/end sentinels instead`,
    );

  // build map of all local variable declarations, excluding trial nodes themselves  
  const localDecls = new Map<string, ts.VariableStatement>();
  function visitDecls(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const stmt = node.parent.parent;
      if (ts.isVariableStatement(stmt)) localDecls.set(node.name.text, stmt);
    }
    ts.forEachChild(node, visitDecls);
  }
  visitDecls(sourceFile);
  if (initJsPsychVarName) localDecls.delete(initJsPsychVarName);
  for (const trial of trialNodes) localDecls.delete((trial.name as ts.Identifier).text);

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

  const outputStatements = new Map<string, ts.Node>();
  outputStatements.set("__initJsPsych__", initStatement);

  for (const trial of trialNodes) {
    const trialStmt = trial.parent.parent;
    if (ts.isVariableStatement(trialStmt))
      outputStatements.set((trial.name as ts.Identifier).text, trialStmt);

    const refs = new Set<string>();
    collectIdentifiers(trial.initializer!, refs);
    for (const ref of refs)
      if (localDecls.has(ref)) outputStatements.set(ref, localDecls.get(ref)!);
  }

  return Array.from(outputStatements.values())
    .sort((a, b) => a.pos - b.pos)
    .map((node) => dedent(node.getFullText(sourceFile)))
    .join("\n\n");
}

export function getExtensionInfoAndExamples(
  source: ts.SourceFile,
  classNode: ts.ClassDeclaration,
  examplePath: string,
): ExtensionInfo {
  const info = getExtensionInfo(source, classNode);
  info.examples = collectExamples(examplePath, inferCodeBlock);
  return info;
}

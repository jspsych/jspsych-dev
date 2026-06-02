import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { PluginInfo, ParameterInfo, ExampleInfo } from "../types/info.js";
import { extractJsDocComment, parseParamGroup } from "./utils.js";

/**
 * Extracts plugin information from a TypeScript AST. Source must already be
 * transformed via the TypeScript compiler. Version and examples are not included
 * in this function, but are gathered from the main CLI and from
 * getPluginInfoAndExamples, respectively.
 *
 * @param source TypeScript AST of the source file
 * @param classNode the node representing the class declaration of the plugin
 * @returns a PluginInfo object containing name, description, parameters, and data.
 */
export function getPluginInfo(source: ts.SourceFile, classNode: ts.ClassDeclaration): PluginInfo {
  let result: PluginInfo = {
    name: "",
    description: "",
    version: "",
    parameters: {},
    data: {},
    examples: {},
  };

  const comment = extractJsDocComment(classNode, source);
  if (comment) result.description = comment;
  else console.warn("No JSDoc comment found for plugin class");

  let infoNode: ts.ObjectLiteralExpression | undefined;
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === "info") {
      let init = node.initializer;
      // unwrap b/c of const assertion
      if (init && ts.isTypeAssertionExpression(init)) init = init.expression;
      if (init && ts.isObjectLiteralExpression(init)) infoNode = init;
    }
    ts.forEachChild(node, visit);
  }

  visit(source);

  if (infoNode === undefined) {
    throw new Error("Could not find info object in plugin file.");
  }

  const nameProp = infoNode.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === "name",
  ) as ts.PropertyAssignment | undefined;
  if (nameProp && ts.isStringLiteral(nameProp.initializer)) {
    result.name = nameProp.initializer.text;
  }

  const parametersProp = infoNode.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === "parameters",
  ) as ts.PropertyAssignment | undefined;
  if (parametersProp && ts.isObjectLiteralExpression(parametersProp.initializer)) {
    result.parameters = parseParamGroup(parametersProp.initializer, source);
  }

  const dataProp = infoNode.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === "data",
  ) as ts.PropertyAssignment | undefined;
  if (dataProp && ts.isObjectLiteralExpression(dataProp.initializer)) {
    result.data = parseParamGroup(dataProp.initializer, source);
  }

  return result;
}

/**
 * Fallback code block extractor for HTML example files without sentinels. Requires exactly
 * one inline script block (errors if zero or multiple are found). Parses the script with the
 * TypeScript compiler, then collects all potential trial variables (has trial in the name, camel or snake case).
 * For each trial, its direct local dependencies (one level of indirection) are also included by walking identifier references in
 * the initializer and matching them against other locally declared variables.
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
  const trialNodes: ts.VariableDeclaration[] = [];

  function visitTrials(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      trialPattern.test(node.name.text)
    ) {
      if (ts.isObjectLiteralExpression(node.initializer!)) trialNodes.push(node);
      else
        // TODO: explore support for non-object-literal trial initializers (e.g. buildTrial())
        throw new Error(
          `${sourcePath}: trial variable "${node.name.text}" has a non-object-literal initializer — use jspsych-autodoc:start/end sentinels instead`,
        );
    }
    ts.forEachChild(node, visitTrials);
  }
  visitTrials(sourceFile);

  if (trialNodes.length === 0)
    throw new Error(
      `${sourcePath}: no trial variables found — use jspsych-autodoc:start/end sentinels instead`,
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
  for (const trial of trialNodes) localDecls.delete((trial.name as ts.Identifier).text);

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

  // gather trial statements and their one-level dependencies, keyed by name to deduplicate
  const outputStatements = new Map<string, ts.Node>();
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
    .map((node) => node.getText(sourceFile).trim())
    .join("\n\n");
}

/**
 * Gets the example code block text from a given HTML file. Looks for sentinels first and
 * orders sub-blocks via file position. Otherwise, infers based on trial variable declarations
 * and their dependencies.
 */
function getCodeBlock(sourceContent: string, sourcePath: string): string {
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

  if (markers.length === 0) return inferCodeBlock(sourceContent, sourcePath);

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
function getExampleInfo(sourcePath: string): Record<string, ExampleInfo> | undefined {
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
    [title]: { path: sourcePath, code: getCodeBlock(content, sourcePath) },
  };
}

/**
 * Extracts plugin information from a TypeScript AST. Source must already be
 * transformed via the TypeScript compiler. Also gathers example information
 * from the provided example path.
 *
 * @param source TypeScript AST of the source file
 * @param classNode the node representing the class declaration of the plugin
 * @param examplePath Path to an example file or directory
 * @returns a PluginInfo object containing name, description, version, parameters, data, and examples.
 */
export function getPluginInfoAndExamples(
  source: ts.SourceFile,
  classNode: ts.ClassDeclaration,
  examplePath: string,
): PluginInfo {
  const info = getPluginInfo(source, classNode);

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

  for (const file of htmlFiles) {
    const exampleInfo = getExampleInfo(file);
    if (exampleInfo) Object.assign(info.examples, exampleInfo);
  }

  return info;
}

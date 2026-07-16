import ts from "typescript";
import { TimelineInfo, TimelineHelperInfo, ParameterInfo } from "../types/info.js";
import {
  HoistEntry,
  UsageMap,
  buildInterfaceMap,
  collectExamples,
  dedent,
  extractJsDocComment,
  hoistKeyForType,
  parseFunctionParams,
  parseInterfaceMembers,
  parseValueShapeMembers,
} from "./utils.js";

// --- FUNCTION PARSING ---

function parseHelperFunction(
  funcNode: ts.FunctionDeclaration,
  source: ts.SourceFile,
  interfaceMap: Map<string, HoistEntry>,
  usageMap: UsageMap,
): TimelineHelperInfo {
  return {
    description: extractJsDocComment(funcNode, source) ?? "",
    helperParameters: parseFunctionParams(funcNode, funcNode, source, interfaceMap, usageMap),
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

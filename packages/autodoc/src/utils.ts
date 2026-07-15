import ts from "typescript";
import fs from "node:fs";
import path from "node:path";

import { ExampleInfo } from "./types/info.js";

/**
 * Updates sections of a file delimited by sentinel tags with new content from the docs object.
 * The docs object should have keys corresponding to section headings and thus sentinel tags in
 * the file. If any sentinel tags are missing in the original file, an error will immediately be
 * thrown.
 *
 * @param fileContent the content of the file to be updated
 * @param docs the documentation content to update the file with
 * @returns the updated file content
 */
export function updateDocSections(fileContent: string, docs: Record<string, string>): string {
  const headings = Object.keys(docs);

  let anyFound = false;
  const statuses: Record<string, { startFound: boolean; endFound: boolean }> = {};

  for (const heading of headings) {
    const startFound = fileContent.includes(`<!-- jspsych-autodocs:${heading}:start -->`);
    const endFound = fileContent.includes(`<!-- jspsych-autodocs:${heading}:end -->`);
    statuses[heading] = { startFound, endFound };
    if (startFound || endFound) anyFound = true;
  }

  if (!anyFound) {
    throw new Error(
      "No sentinel tags found, is this a valid jsPsych autodoc target? If not, create a new file with the CLI to observe the structure.",
    );
  }

  const errors: string[] = [];
  for (const heading of headings) {
    const { startFound, endFound } = statuses[heading];
    const startTag = `<!-- jspsych-autodocs:${heading}:start -->`;
    const endTag = `<!-- jspsych-autodocs:${heading}:end -->`;

    if (!startFound && !endFound) {
      errors.push(
        `${heading} sentinel start and end tag was not found.\n` +
          `Insert ${startTag} before the heading to complete the tag\n` +
          `Insert ${endTag} after the chart to complete the tag`,
      );
    } else if (!startFound) {
      errors.push(
        `${heading} sentinel start tag was not found.\n` +
          `Insert ${startTag} before the heading to complete the tag`,
      );
    } else if (!endFound) {
      errors.push(
        `${heading} sentinel end tag was not found.\n` +
          `Insert ${endTag} after the chart to complete the tag`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n\n"));
  }

  let result = fileContent;
  for (const heading of headings) {
    const startTag = `<!-- jspsych-autodocs:${heading}:start -->`;
    const endTag = `<!-- jspsych-autodocs:${heading}:end -->`;
    const start = result.indexOf(startTag);
    const end = result.indexOf(endTag) + endTag.length;
    result = result.slice(0, start) + docs[heading] + result.slice(end);
  }

  return result;
}

/**
 * Identifies whether a source file contains a plugin/extension/timeline, 
 * returning the classNode and the type. classNode here represents the "main node", either
 * the class node that implements `jsPsychPlugin`/`jsPsychExtension`, or the function node that 
 * is the createTimeline entrypoint for jsPsych timelines.
 * 
 * @param source the AST of the source file 
 * @returns object containing the "main node" (for use in extracting doc, so that 
 * getXXXInfo does not have to re-find) and the type of package (plugin/extension/timeline). 
 */
export function identifyPackageType(source: ts.SourceFile): {
  mainNode: ts.ClassDeclaration | ts.FunctionDeclaration;
  type: "plugin" | "extension" | "timeline";
} {
  let result: {
    mainNode: ts.ClassDeclaration | ts.FunctionDeclaration;
    type: "plugin" | "extension" | "timeline"
  } | null = null;

  function searchForMainNode(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      const implementsPlugin = node.heritageClauses?.some(
        (h) =>
          h.token === ts.SyntaxKind.ImplementsKeyword &&
          h.types.some((t) => t.getText(source).includes("JsPsychPlugin")),
      );
      const implementsExtension = node.heritageClauses?.some(
        (h) =>
          h.token === ts.SyntaxKind.ImplementsKeyword &&
          h.types.some((t) => t.getText(source).includes("JsPsychExtension")),
      );
      if (implementsPlugin && implementsExtension) {
        throw new Error(
          "A class cannot implement both JsPsychPlugin and JsPsychExtension interfaces.",
        );
      }
      else if (implementsExtension) result = { mainNode: node, type: "extension" };
      else if (implementsPlugin) result = { mainNode: node, type: "plugin" };
      else
        throw new Error(
          "Class does not implement JsPsychPlugin or JsPsychExtension interfaces. Ensure your class implements the correct interface.",
        );
    } else if (ts.isFunctionDeclaration(node)) {
      const isCreateTimeline = node.name?.text === "createTimeline";
      if (isCreateTimeline) result = { mainNode: node as ts.FunctionDeclaration, type: "timeline" };
    }
    ts.forEachChild(node, searchForMainNode);
  }
  searchForMainNode(source);

  if (!result) {
    throw new Error("No plugin or extension class found in source file.");
  }

  return result;
}

/**
 * attempts to find the source file (src/index.ts, then index.ts), but fails if not found.
 */
export function discoverSource(anchor: string): string {
  const candidates = [path.join(anchor, "src", "index.ts"), path.join(anchor, "index.ts")];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      `Could not auto-detect a source file (looked for src/index.ts, index.ts under ${anchor}). ` +
        "Specify one with --source.",
    );
  }
  return found;
}

/**
 * @returns `examples/` directory pathway to anchor, undefined if not found (optional)
 */
export function discoverExample(anchor: string): string | undefined {
  const dir = path.join(anchor, "examples");
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory() ? dir : undefined;
}

/** collects `.md` files whose basename (sans extension) matches one of `stems` */
function findMarkdownByStem(anchor: string, stems: Set<string>): string[] {
  const results: string[] = [];
  const walk = (dir: string, recurse: boolean) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (recurse && entry.name !== "node_modules") walk(full, true);
      } else if (entry.isFile() && entry.name.endsWith(".md") && stems.has(entry.name.slice(0, -3))) {
        results.push(full);
      }
    }
  };
  walk(anchor, false); // top-level files only
  walk(path.join(anchor, "docs"), true); // docs/ recursively
  return [...new Set(results)];
}

/**
 * resolves destination file by matching existing md file against package
 * name and package type, trying to find one of unscoped name (`plugin-foo`),
 * type-stripped name (`foo`), and reconstructed name (`<type>-<name>`). fails 
 * fast, this is a requirement if not present or if there are multiple matches.
 */
export function discoverDest(
  anchor: string,
  packageName: string,
  type: "plugin" | "extension" | "timeline",
): string {
  const unscoped = packageName.replace(/^@[^/]+\//, "");
  const stripped = unscoped.replace(/^(plugin|extension|timeline)-/, "");
  const stems = new Set([unscoped, stripped, `${type}-${stripped}`]);

  const matches = findMarkdownByStem(anchor, stems);

  if (matches.length === 0) {
    throw new Error(
      `Could not find an existing docs file for "${unscoped}" ` +
        `(looked for ${[...stems].map((s) => `${s}.md`).join(", ")} in ${anchor} and ${anchor}/docs). ` +
        "Specify the destination with --dest.",
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple candidate docs files found for "${unscoped}":\n` +
        matches.map((m) => `  - ${m}`).join("\n") +
        "\nDisambiguate with --dest.",
    );
  }
  return matches[0];
}

export interface PackageJsonInfo {
  name: string;
  description: string;
  version: string;
}

/**
 * gathers name, description, and version from package-json, using either a given
 * path to one, or attempting to infer via checking the root directory.
 */
export function extractPackageJsonInfo(packageJsonPath?: string): PackageJsonInfo {
  const resolvedPath = packageJsonPath ?? path.join(process.cwd(), "package.json");
  try {
    const packageJson = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));

    if (!packageJson.name) console.warn("Warning: No name field found in package.json.");
    if (!packageJson.description) console.warn("Warning: No description field found in package.json.");
    if (!packageJson.version) console.warn("Warning: No version field found in package.json.");

    return {
      name: packageJson.name ?? "unknown name",
      description: packageJson.description ?? "unknown description",
      version: packageJson.version ?? "unknown version",
    };
  } catch (err) {
    throw new Error(
      `Could not read package.json at ${resolvedPath} to determine package info. ` +
        "Ensure you are running the CLI in the directory that contains the package.json, or provide --package-json. " +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }
}

/**
 * returns a copy of the examples object with all paths made relative
 * to the given root directory
 */
export function relativizeExamplePaths(
  examples: Record<string, ExampleInfo>,
  root: string,
): Record<string, ExampleInfo> {
  return Object.fromEntries(
    Object.entries(examples).map(([title, example]) => [
      title,
      { ...example, path: path.relative(root, path.resolve(example.path)).split(path.sep).join("/") },
    ]),
  );
}

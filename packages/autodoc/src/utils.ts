import ts from "typescript";
import fs from "node:fs";
import path from "node:path";

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

//TODO: add timeline functionality
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

/** Gathers the version number from a package.json file found in the current working directory. */
export function extractVersionFromPackageJson(): string {
  try {
    const pluginPackageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    );
    if (pluginPackageJson.version) {
      return pluginPackageJson.version;
    } else {
      console.warn("Warning: No version field found in package.json.");
      return "unknown version";
    }
  } catch (err) {
    console.warn(
      "Warning: Could not read package.json to determine version. Ensure you are running the CLI in the directory that contains the package.json.",
    );
    return "unknown version";
  }
}

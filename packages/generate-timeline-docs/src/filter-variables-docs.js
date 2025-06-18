import fs from "fs";
import path from "path";
import normalizeInternalLinks from "./normalize-internal-links.js";

function removeTypeDeclaration(content) {
  const typeDeclarationMarker = "## Type declaration";
  const typeDeclarationIndex = content.indexOf(typeDeclarationMarker);

  // If the marker is found, remove everything above it, including the line itself
  if (typeDeclarationIndex !== -1) {
    const nextLineIndex = content.indexOf("\n", typeDeclarationIndex) + 2;
    return content.slice(nextLineIndex);
  }

  // If the marker is not found, return the content as is
  return content;
}

function filterVariableDoc(variablePath) {
  // Read and filter the timelineUnits documentation
  let content = fs.readFileSync(variablePath, "utf-8");
  content = removeTypeDeclaration(content);
  const headingLevels = content.match(/^#+\s/gm) || []; // Find all headings
  const topLevel = Math.min(...headingLevels.map((h) => h.trim().length)); // Determine the smallest heading level
  const topLevelHeadingRegex = new RegExp(`^#{${topLevel}}\\s`, "m"); // Match only the top-level headings
  const returnsHeading = "## Returns";
  const headingRegex = /^#+\s/m; // Matches any heading

  let result = "";
  let remainingContent = content;

  while (true) {
    // Find the next top-level heading
    const startIndex = remainingContent.search(topLevelHeadingRegex);
    if (startIndex === -1) break;

    // Find the "## Returns" section after the top-level heading
    const returnsIndex = remainingContent.indexOf(returnsHeading, startIndex);
    if (returnsIndex === -1) break;

    // Find the next heading after "## Returns"
    const nextHeadingIndex = remainingContent
      .slice(returnsIndex + returnsHeading.length)
      .search(headingRegex);

    const sliceEnd =
      nextHeadingIndex === -1
        ? remainingContent.length
        : returnsIndex + returnsHeading.length + nextHeadingIndex;

    // Append the filtered content for the current section
    let currentSection = remainingContent.slice(startIndex, sliceEnd).trim();

    result += currentSection + "\n***\n";
    remainingContent = remainingContent.slice(sliceEnd);
  }

  if (result) {
    return result.trim();
  }
  else {
    return content; // If no sections matched, return the original content
  }
}

/**
 * Filters the variables documentation for a specific package.
 * @param {*} packageDir - The directory of the package to process.
 * @returns {boolean} - Whether the processing was successful.
 */
export default function filterVariablesDocs(packageDir) {
  const docsPath = path.join(packageDir, "docs");
  const docsVariablesPath = path.join(packageDir, "docs", "variables");

  if (!fs.existsSync(docsVariablesPath)) {
    console.error(`Variables documentation not found: ${docsVariablesPath}`);
    return false;
  }

  const variableFiles = fs.readdirSync(docsVariablesPath).filter(file => file.endsWith(".md"));

  for (const variableFile of variableFiles) {
    const variablePath = path.join(docsVariablesPath, variableFile);
    let filteredDoc = filterVariableDoc(variablePath);
    filteredDoc = normalizeInternalLinks(filteredDoc, variablePath, docsPath);
    fs.writeFileSync(variablePath, filteredDoc, "utf-8");
  }

  console.log(`✔️ Complete processing variables documentation for ${packageDir}!`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  filterVariablesDocs(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

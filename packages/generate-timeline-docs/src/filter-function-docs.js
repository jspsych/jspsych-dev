import fs from "fs";
import path from "path";
import normalizeInternalLinks from "./normalize-internal-links.js";

/**
 * Filters the function documentation to keep only the relevant sections.
 * @param {*} functionPath - The path to the function documentation file.
 * @returns {string} - The filtered documentation content.
 */
function filterFunctionDoc(functionPath) {
  const content = fs.readFileSync(functionPath, "utf-8");

  function filterParametersTable(content) {
    const startMarker = /^# Function:\s+.*$/m;
    const endMarker = "## Returns";
    const nextHeadingRegex = /^##\s+/m;

    const startMatch = content.match(startMarker);
    if (!startMatch) return content;

    const startIndex = startMatch.index;

    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) return content;

    const nextHeadingIndex = content.slice(endIndex).search(nextHeadingRegex);
    const sliceEnd = nextHeadingIndex === -1 ? content.length : endIndex + nextHeadingIndex;

    return content.slice(startIndex, sliceEnd).trim();
  }

  function filterReturnsTable(content) {
    const startMarker = "## Returns";
    const headingRegex = /^#+\s/m; // Matches any number of # followed by a space

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return content;

    // Find the index of the next heading after Returns
    const nextHeadingIndex = content.slice(startIndex + startMarker.length).search(headingRegex);

    // If no next heading is found, return content from Returns to the end
    if (nextHeadingIndex === -1) {
      return content.slice(startIndex).trim();
    }

    // Return content from Returns up to the start of the next heading
    return content.slice(startIndex, startIndex + startMarker.length + nextHeadingIndex).trim();
  }

  return filterParametersTable(content) + "\n\n" + filterReturnsTable(content);
}


/**
 * Processes the functions documentation for a specific package.
 * @param {*} packageDir - The directory of the package to process.
 * @returns {boolean} - Whether the processing was successful.
 */
export default function filterFunctionsDocs(packageDir) {
  const docsPath = path.join(packageDir, "docs");
  const docsFunctionsPath = path.join(packageDir, "docs", "functions");

  if (!fs.existsSync(docsFunctionsPath)) {
    console.warn(`Functions directory not found: ${docsFunctionsPath}`);
    return false;
  }

  // Process all .md files in the functions directory
  const functionFiles = fs.readdirSync(docsFunctionsPath).filter(file => file.endsWith(".md"));

  for (const functionFile of functionFiles) {
    const functionPath = path.join(docsFunctionsPath, functionFile);
    let filteredDoc = filterFunctionDoc(functionPath);
    filteredDoc = normalizeInternalLinks(filteredDoc, functionPath, docsPath);
    fs.writeFileSync(functionPath, filteredDoc + "\n***\n", "utf-8");
  }

  console.log(`☑️ Complete processing functions documentation for ${packageDir}.`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  filterFunctionsDocs(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

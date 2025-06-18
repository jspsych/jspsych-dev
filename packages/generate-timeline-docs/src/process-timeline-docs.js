import fs from "fs";
import path from "path";

/**
 * Filters the timeline documentation to keep only the relevant sections.
 * @param {*} timelinePath - The path to the timeline documentation file.
 * @returns {string} - The filtered documentation content.
 */
function filterTimelineDoc(timelinePath) {
  const content = fs.readFileSync(timelinePath, "utf-8");

  function filterParametersTable(content) {
    const startMarker = "# Function: createTimeline()";
    const endMarker = "## Returns";
    const nextHeadingRegex = /^##\s+/m;

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return content;

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
 * Processes the timeline documentation for a specific package.
 * @param {*} packageDir - The directory of the package to process.
 * @returns {boolean} - Whether the processing was successful.
 */
export default function processTimelineDocs(packageDir) {
  const docsCreateTimelinePath = path.join(packageDir, "docs", "functions", "createTimeline.md");

  // Step 1: Check if createTimeline() documentation exists
  if (!fs.existsSync(docsCreateTimelinePath)) {
    console.error(`createTimeline() documentation file not found: ${docsCreateTimelinePath}`);
    return false;
  }

  // Step 2: Process createTimeline.md file
  const createTimelineFilteredDocs = filterTimelineDoc(docsCreateTimelinePath);

  // Step 3: Adjust headings
  // Adjust all markdown headings in createTimelineFilteredDocs so that the top levels start from ###
  const headingAdjustmentRegex = /^#+\s/gm;
  const headingLevelsInDocs = createTimelineFilteredDocs.match(headingAdjustmentRegex) || [];
  const minHeadingLevel = Math.min(...headingLevelsInDocs.map((h) => h.trim().length));
  const adjustedFilteredTimelineDocs = createTimelineFilteredDocs.replace(
    headingAdjustmentRegex,
    (match) => {
      const adjustedLevel = match.trim().length - minHeadingLevel + 3; // Adjust to start from ###
      return "#".repeat(adjustedLevel) + " ";
    }
  );

  fs.writeFileSync(docsCreateTimelinePath, adjustedFilteredTimelineDocs);

  // Step 4: Update all internal links to absolute paths
  console.log("Updating interface links to absolute paths...");
  let content = fs.readFileSync(docsCreateTimelinePath, "utf-8");

  const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^)]+))?\)/g;

  content = content.replace(linkRegex, (match, linkText, linkPath, fragment) => {
    // Get the current file's directory
    const currentFileDir = path.dirname(docsCreateTimelinePath);

    // Resolve the target file's absolute path
    const targetAbsolutePath = path.resolve(currentFileDir, linkPath);

    // Get the docs directory absolute path
    const docsDir = path.join(packageDir, "docs");

    // Calculate path relative to docs directory
    const docsRelativePath = path.relative(docsDir, targetAbsolutePath);

    // Keep any fragments
    const fragmentSuffix = fragment ? `#${fragment}` : "";

    // Normalize separators for web
    const normalizedPath = docsRelativePath.replace(/\\/g, "/");

    console.log(`Converting: ${linkPath} -> ${normalizedPath}`);
    return `[${linkText}](${normalizedPath}${fragmentSuffix})`;
  });

  fs.writeFileSync(docsCreateTimelinePath, content + "\n****");

  console.log(`☑️ Complete processing createTimeline() documentation for ${packageDir}!`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  filterTimelineDoc(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

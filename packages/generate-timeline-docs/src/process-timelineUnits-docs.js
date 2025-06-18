import fs from "fs";
import path from "path";

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

export default function processTimelineUnitsDocs(packageDir) {
  const docsTimelineUnitsPath = path.join(packageDir, "docs", "variables", "timelineUnits.md");

  // Step 1: Check if timelineUnits documentation file exists
  if (!fs.existsSync(docsTimelineUnitsPath)) {
    console.error(`Timeline units documentation not found: ${docsTimelineUnitsPath}`);
    return false;
  }

  // Step 2: Read and filter the timelineUnits documentation
  let content = fs.readFileSync(docsTimelineUnitsPath, "utf-8");
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

    // Step 3: Adjust all markdown headings in currentSection so that the top levels start from ###
    const headingAdjustmentRegex = /^#+\s/gm;
    const headingLevelsInSection = currentSection.match(headingAdjustmentRegex) || [];
    const minHeadingLevel = Math.min(...headingLevelsInSection.map((h) => h.trim().length));
    currentSection = currentSection.replace(headingAdjustmentRegex, (match) => {
      const adjustedLevel = match.trim().length - minHeadingLevel + 3; // Adjust to start from ###
      return "#".repeat(adjustedLevel) + " ";
    });

    // Step 4: Update all internal links to absolute paths
    console.log("Updating interface links to absolute paths...");
    const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^)]+))?\)/g;
    currentSection = currentSection.replace(linkRegex, (match, linkText, linkPath, fragment) => {
      // Get the current file's directory
      const currentFileDir = path.dirname(docsTimelineUnitsPath);

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

    result += currentSection + "\n\n***\n\n";
    remainingContent = remainingContent.slice(sliceEnd);
  }

  if (result) {
    fs.writeFileSync(docsTimelineUnitsPath, result.trim());
  }

  console.log(`✔️ Complete processing timelineUnits documentation for ${packageDir}!`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  processTimelineUnitsDocs(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

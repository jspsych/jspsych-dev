import fs from "fs";
import path from "path";

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

export default function filterTimelineDocs(packageDir) {
  console.log(`\n\tProcessing createTimeline() documentation for ${packageDir}...`);
  const docsCreateTimelinePath = path.join(packageDir, "docs", "functions", "createTimeline.md");

  // Step 1: Check if createTimeline() documentation exists
  if (!fs.existsSync(docsCreateTimelinePath)) {
    console.error(`\tcreateTimeline() documentation file not found: ${docsCreateTimelinePath}`);
    return false;
  }

  // Step 2: Process createTimeline.md file
  const createTimelineFilteredDocs = filterTimelineDoc(docsCreateTimelinePath);

  // Step 3: Adjust headings
  if (createTimelineFilteredDocs) {
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

    // Read the filtered content again
    const filteredContent = fs.readFileSync(docsCreateTimelinePath, "utf-8");
    const interfaceLinkRegex = /\.\.\/interfaces\/([\w-]+\.md)/g;
    let match;
    let appendedContent = "";

    // Step 4: Find all links to files under interfaces directory and append them
    console.log("\t\tLooking for interface links to append...");
    while ((match = interfaceLinkRegex.exec(filteredContent)) !== null) {
      const interfaceFilePath = path.join(packageDir, "docs", "interfaces", match[1]);

      if (fs.existsSync(interfaceFilePath)) {
        let interfaceFileContent = fs.readFileSync(interfaceFilePath, "utf-8");
        // Adjust all markdown headings in interfaceFileContent so that the top levels start from ####
        const headingLevelsInInterface = interfaceFileContent.match(headingAdjustmentRegex) || [];
        const minHeadingLevelInterface = Math.min(
          ...headingLevelsInInterface.map((h) => h.trim().length)
        );
        interfaceFileContent = interfaceFileContent.replace(headingAdjustmentRegex, (match) => {
          const adjustedLevel = match.trim().length - minHeadingLevelInterface + 4; // Adjust to start from ####
          return "#".repeat(adjustedLevel) + " ";
        });
        appendedContent += `\n\n---\n\n${interfaceFileContent}`;
        console.log(`\t\t\tAdded interface content from: ${interfaceFilePath}`);
      } else {
        console.warn(`\t\t\tInterface file not found: ${interfaceFilePath}`);
      }
    }

    // Append the contents of the linked files to the end of docsCreateTimelinePath
    if (appendedContent) {
      fs.appendFileSync(docsCreateTimelinePath, appendedContent);
      console.log("\t\tAppended interface contents to createTimeline docs");
    }
  }

  console.log(`\tComplete processing createTimeline() documentation for ${packageDir}!`);
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

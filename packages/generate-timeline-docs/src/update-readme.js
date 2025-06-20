import fs from "fs";

import { adjustHeadingLevels } from "./adjust-headings.js";
import { normalizeInternalLinksToMarkdownAnchors } from "./normalize-internal-links.js";

export default async function updateReadme(
  readmePath,
  docGraph,
  docHeading = "## `createTimeline()` Documentation"
) {
  const orderedFiles = docGraph.getOrderedFiles().map((file) => file.name);
  const readmeContent = fs.readFileSync(readmePath, "utf-8");
  const docStart = readmeContent.indexOf(docHeading);

  // Check if the documentation heading exists in the README file
  if (docStart === -1) {
    console.error(`Heading "${docHeading}" not found in README file.`);
    return false;
  }

  const headingLevel = docHeading.match(/^#+/)[0].length;
  let docEnd = readmeContent.length;
  const lines = readmeContent.split("\n");
  for (let i = docStart + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineHeadingLevel = line.match(/^#+/);
    if (lineHeadingLevel && lineHeadingLevel[0].length <= headingLevel) {
      docEnd = readmeContent.indexOf(line, docStart);
      break;
    }
  }

  let docContent = "";

  for (const filename of orderedFiles) {
    let nodeContent = docGraph.graph.getNodeData(filename);
    nodeContent = adjustHeadingLevels(nodeContent, headingLevel + 1);

    if (filename.endsWith("createTimeline.md")) {
      const createTimelineRegex = /^#+\s+.*`*createTimeline\(\)`* Documentation.*$/i;
      nodeContent = !createTimelineRegex.test(docHeading) ?
        `${"#".repeat(headingLevel)} \`createTimeline()\` Documentation\n\n` + nodeContent : nodeContent;
    } else if (filename.endsWith("timelineUnits.md")) {
      nodeContent = `${"#".repeat(headingLevel)} \`timelineUnits\` Documentation\n\n` + nodeContent;
    } else if (filename.endsWith("utils.md")) {
      nodeContent = `${"#".repeat(headingLevel)} \`utils\` Documentation\n\n` + nodeContent;
    }

    if (!nodeContent) {
      console.warn(`No content found for file: ${filename}`);
      continue;
    }

    nodeContent = await normalizeInternalLinksToMarkdownAnchors(nodeContent);

    docContent += nodeContent + "\n\n";
  }

  const updatedReadmeContent =
    readmeContent.slice(0, docStart + docHeading.length) + "\n" + docContent + readmeContent.slice(docEnd);
  fs.writeFileSync(readmePath, updatedReadmeContent, "utf-8");
  console.log(`☑️ Complete updating README documentation section starting at ${docHeading}.`);
  return true;
}

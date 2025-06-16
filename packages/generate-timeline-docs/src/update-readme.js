import fs from "fs";
import { rmSync } from "fs";
import path from "path";

function updateSectionBetweenHeadings(readmeContent, startHeading, endHeading, content) {
  const escapedStartHeading = startHeading.replace(/([()[{*+.$^\\|?])/g, "\\$1");
  const escapedEndHeading = endHeading ? endHeading.replace(/([()[{*+.$^\\|?])/g, "\\$1") : null;

  let pattern;
  if (endHeading) {
    pattern = new RegExp(`(## ${escapedStartHeading}\\s*)(.*?)(\\s*## ${escapedEndHeading})`, "s");
  } else {
    // case for utils which does not have an end heading
    pattern = new RegExp(`(## ${escapedStartHeading}\\s*)(.*?)(?=\\s*(?:#{1,6} |$))`, "s");
  }

  const matches = pattern.test(readmeContent);

  // Replace content between headings, preserving the headings themselves
  if (matches) {
    return endHeading
      ? readmeContent.replace(pattern, `$1\n\n${content}\n\n$3`)
      : readmeContent.replace(pattern, `$1\n\n${content}\n\n`);
  } else {
    console.warn(`Section with heading "${startHeading}" not found in README!`);
    return readmeContent; // return original content if no match found
  }
}

function updateContentFromFile(docsDir, readmePath, filePath, startHeading, endHeading = null) {
  // Full path to the documentation file
  const fullPath = path.join(docsDir, filePath);

  try {
    // Check if files exist
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: docs/${filePath}`);
      return null;
    }
    if (!fs.existsSync(readmePath)) {
      console.error(`README not found: ${readmePath}`);
      return null;
    }

    // Read files
    const docContent = fs.readFileSync(fullPath, "utf8");
    const readmeContent = fs.readFileSync(readmePath, "utf8");

    // Update section between headings
    const updatedReadme = updateSectionBetweenHeadings(
      readmeContent,
      startHeading,
      endHeading,
      docContent
    );

    // Write updated README
    fs.writeFileSync(readmePath, updatedReadme);
    return updatedReadme;
  } catch (error) {
    console.error(`Error updating ${startHeading} section:`, error);
    return null;
  }
}

// Function to delete the docs folder
function deleteDocs(docsDir) {
  console.log(`Deleting docs directory: ${docsDir}`);
  try {
    if (fs.existsSync(docsDir)) {
      rmSync(docsDir, { recursive: true, force: true });
      console.log("✔️ Successfully deleted docs folder");
    } else {
      console.log("Docs folder not found, nothing to delete");
    }
  } catch (error) {
    console.error("Error deleting docs folder:", error);
  }
}

// Function to update internal links to anchor links
function updateInternalLinks(readmeContent) {
  let updatedContent = readmeContent;

  // Handle interface links like [`InterfaceName`](../interfaces/InterfaceName.md)
  const interfaceLinkRegex = /\[`([^`]+)`\]\(\.\.\/interfaces\/([^)#]+)\.md(?:#([^)]+))?\)/g;
  const functionLinkRegex = /\[([^\]]+)\]\(\.\.\/functions\/([^)#]+)\.md(?:#([^)]+))?\)/g;
  const variableLinkRegex = /\[([^\]]+)\]\(\.\.\/variables\/([^)#]+)\.md(?:#([^)]+))?\)/g;

  // Map to store link targets and their anchor IDs
  const anchorMap = {};

  // Process interface links
  let match;
  while ((match = interfaceLinkRegex.exec(readmeContent)) !== null) {
    const linkText = match[1];
    const fileName = match[2];
    const fragment = match[3]; // This will capture any fragment like #section

    // Use the fragment if it exists, otherwise create an anchor from the interface name
    const anchorId = fragment || `interface-${linkText.toLowerCase().replace(/\s+/g, "-")}`;
    anchorMap[`interfaces/${fileName}.md${fragment ? `#${fragment}` : ""}`] = anchorId;
  }

  // Process function links
  while ((match = functionLinkRegex.exec(readmeContent)) !== null) {
    const linkText = match[1];
    const fileName = match[2];
    const fragment = match[3];

    // Use the fragment if it exists, otherwise create an anchor from the function name
    const anchorId = fragment || `function-${fileName.toLowerCase().replace(/\s+/g, "-")}`;
    anchorMap[`functions/${fileName}.md${fragment ? `#${fragment}` : ""}`] = anchorId;
  }

  // Process variable links
  while ((match = variableLinkRegex.exec(readmeContent)) !== null) {
    const linkText = match[1];
    const fileName = match[2];
    const fragment = match[3];

    // Use the fragment if it exists, otherwise create an anchor from the variable name
    const anchorId = fragment || `variable-${fileName.toLowerCase().replace(/\s+/g, "-")}`;
    anchorMap[`variables/${fileName}.md${fragment ? `#${fragment}` : ""}`] = anchorId;
  }

  // Replace all detected links with anchor links
  Object.keys(anchorMap).forEach((link) => {
    const anchorId = anchorMap[link];
    // Handle links with backticks
    const backtickLinkPattern = new RegExp(
      `\\[\\\`` +
        `[^\\\`]+` +
        `\\\`\]\\(\\.\\.\\/${link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
      "g"
    );

    updatedContent = updatedContent.replace(backtickLinkPattern, (match) => {
      const linkText = match.match(/\[`([^`]+)`\]/)[1];
      return `[\`${linkText}\`](#${anchorId})`;
    });

    // Handle regular links
    const regularLinkPattern = new RegExp(
      `\\[[^\\]]+\\]\\(\\.\\.\\/${link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
      "g"
    );
    updatedContent = updatedContent.replace(regularLinkPattern, (match) => {
      const linkText = match.match(/\[([^\]]+)\]/)[1];
      return `[${linkText}](#${anchorId})`;
    });
  });

  return updatedContent;
}

// Main function
export default function updateReadme(packageDir, readmePath) {
  const docsDir = path.join(packageDir, "docs");
  try {
    // Define standard file names for documentation files
    const timelineDocsFp = "functions/createTimeline.md";
    const timelineUnitsDocsFp = "variables/timelineUnits.md";
    const utilsDocsFp = "variables/utils.md";

    // Update each section between headings
    let currentReadme = updateContentFromFile(
      docsDir,
      readmePath,
      timelineDocsFp,
      "createTimeline() Documentation",
      "timelineUnits Documentation"
    );

    if (currentReadme) {
      // Use the updated README content for the next update
      fs.writeFileSync(readmePath, currentReadme);
    } else {
      console.error("No updated content found for timeline Documentation.");
    }

    currentReadme = updateContentFromFile(
      docsDir,
      readmePath,
      timelineUnitsDocsFp,
      "timelineUnits Documentation",
      "utils Documentation"
    );

    if (currentReadme) {
      fs.writeFileSync(readmePath, currentReadme);
    } else {
      console.error("No updated content found for timelineUnits Documentation.");
    }

    // For the last section, there's no ending heading
    currentReadme = updateContentFromFile(docsDir, readmePath, utilsDocsFp, "utils Documentation");

    if (currentReadme) {
      fs.writeFileSync(readmePath, currentReadme);
    } else {
      console.error("No updated content found for utils Documentation.");
    }

    // After all sections are updated, process the entire README to fix internal links
    let finalReadme = fs.readFileSync(readmePath, "utf8");
    finalReadme = updateInternalLinks(finalReadme);
    fs.writeFileSync(readmePath, finalReadme);
    console.log("✔️ Updated internal links to anchor links in README");
  } catch (error) {
    console.error("Error updating README sections:", error);
  }

  deleteDocs(docsDir);
}

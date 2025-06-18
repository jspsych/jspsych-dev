import fs from "fs";
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

// Main function
export default function updateReadme(packageDir, readmePath) {
  const docsDir = path.join(packageDir, "docs");
  try {
    // Define standard file names for documentation files
    const timelineDocsFp = "functions/createTimeline.md";
    const timelineUnitsDocsFp = "variables/timelineUnits.md";
    const utilsDocsFp = "variables/utils.md";

    // Update createTimeline() documentation section
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

    // Update timelineUnits documentation section
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

    // Update utils documentation section
    // For the last section, there's no ending heading
    currentReadme = updateContentFromFile(docsDir, readmePath, utilsDocsFp, "utils Documentation");

    if (currentReadme) {
      fs.writeFileSync(readmePath, currentReadme);
    } else {
      console.error("No updated content found for utils Documentation.");
    }
  } catch (error) {
    console.error("Error updating README sections:", error);
  }
}

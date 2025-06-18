import fs from "fs";
import path from "path";

/**
 * Resolves internal links in a README file
 * @param {string} packageDir - The package directory
 * @param {string} readmePath - Path to the README file
 * @returns {Promise<string>} - The updated README content
 */
export default async function resolveInternalLinks(packageDir, readmePath) {
  console.log("Resolving internal links in README...");

  // Read the README content
  const readmeContent = fs.readFileSync(readmePath, "utf-8");
  let updatedContent = readmeContent;

  // Find all internal links in the README
  const internalLinkRegex =
    /\[([^\]]+)\]\(((?:functions|variables|interfaces)\/[^)]+\.md)(?:#([^)]+))?\)/g;
  const docsDir = path.join(packageDir, "docs");
  const matches = [...updatedContent.matchAll(internalLinkRegex)];

  for (const match of matches) {
    const [fullMatch, linkText, linkPath, fragment] = match;
    const filePath = path.join(docsDir, linkPath);

    // Determine type and generate expected anchor ID
    let type = "";
    if (linkPath.startsWith("interfaces/")) type = "interface";
    else if (linkPath.startsWith("functions/")) type = "function";
    else if (linkPath.startsWith("variables/")) type = "variable";

    // Extract filename for anchor
    const filename = path.basename(linkPath, ".md");
    let expectedAnchor = "";
    if (type == "function") {
      // For functions, use a specific anchor format
      expectedAnchor = `#${filename.toLowerCase()}`;
    } else if (type == "variable") {
      // For variables, use a different anchor format
      expectedAnchor = `#${fragment.toLowerCase()}`;
    } else if (type == "interface") {
      // For interfaces, use a specific anchor format
      expectedAnchor = `#interface-${filename.toLowerCase()}`;
    }

    // Check if this anchor already exists in the README
    if (
      updatedContent.includes(expectedAnchor)
    ) {
      // Section exists, update link to point to the anchor
      const anchorLink = fragment ? `${expectedAnchor}-${fragment}` : expectedAnchor;
      updatedContent = updatedContent.replace(fullMatch, `[${linkText}](${anchorLink})`);
      console.log(`Updated link to existing section: ${linkPath} → ${anchorLink}`);
    } else if (fs.existsSync(filePath)) {
      // Section doesn't exist, read file content and append it
      console.log(`Adding content from ${filePath} to README`);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      // Find position to insert the content (before next ***)
      const nextSeparatorIndex = updatedContent.indexOf("***", match.index);
      if (nextSeparatorIndex !== -1) {
        updatedContent =
          updatedContent.slice(0, nextSeparatorIndex) +
          fileContent +
          "\n\n" +
          updatedContent.slice(nextSeparatorIndex);
      } else {
        // If no separator found, append to the end
        updatedContent += fileContent;
      }

      // Update the link to point to the new section
      updatedContent = updatedContent.replace(fullMatch, `[${linkText}](${expectedAnchor})`);
    } else {
      console.warn(`Referenced file not found: ${filePath}`);
    }
  }

  // Handle any duplicate sections that might have been created
  updatedContent = removeDuplicateSections(updatedContent);
  fs.writeFileSync(readmePath, updatedContent);

  return updatedContent;
}

/**
 * Removes duplicate sections from the README content
 * @param {string} content - The README content
 * @returns {string} - Deduplicated content
 */
function removeDuplicateSections(content) {
  // Split by section markers
  const sections = content.split(/\n\n## /);
  const headings = new Set();
  const uniqueSections = [];

  // Process first section (before any ##)
  if (sections.length > 0) {
    uniqueSections.push(sections[0]);
  }

  // Process remaining sections (starting with ##)
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const headingMatch = section.match(/^([^:]+?)(:|\n)/);

    if (headingMatch) {
      const heading = headingMatch[1].trim();
      if (!headings.has(heading)) {
        headings.add(heading);
        uniqueSections.push(section);
      }
    } else {
      // If no heading pattern found, include the section
      uniqueSections.push(section);
    }
  }

  // Reconstruct the content
  return (
    uniqueSections[0] +
    uniqueSections
      .slice(1)
      .map((s) => `\n\n## ${s}`)
      .join("")
  );
}

// If this script is run directly as the main module
if (import.meta.url === import.meta.main) {
  const packageDir = process.argv[2];
  const readmePath = process.argv[3];

  if (!packageDir || !readmePath) {
    console.error("Usage: node resolve-internal-links.js <packageDir> <readmePath>");
    process.exit(1);
  }

  resolveInternalLinks(packageDir, readmePath)
    .then((updatedContent) => {
      fs.writeFileSync(readmePath, updatedContent);
      console.log("Successfully resolved internal links");
    })
    .catch((error) => {
      console.error("Failed to resolve internal links:", error);
      process.exit(1);
    });
}

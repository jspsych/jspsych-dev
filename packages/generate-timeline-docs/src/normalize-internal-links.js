import fs from "fs";
import path from "path";

export function normalizeInternalLinksToAbsolute(content, filePath, baseDir) {
  if (!content) {
    return "";
  }

  // If baseDir is not provided, use the directory of the file
  if (!baseDir && filePath) {
    baseDir = path.dirname(filePath);
  }

  // If neither content nor filePath is provided, return empty string
  if (!filePath && !content) {
    console.warn("No content or filePath provided to normalizeInternalLinks");
    return "";
  }

  // If filePath is provided but content is not, read the file
  if (filePath && !content) {
    content = fs.readFileSync(filePath, "utf-8");
  }

  const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^)]+))?\)/g;

  content = content.replace(linkRegex, (match, linkText, linkPath, fragment) => {
    if (!filePath || !baseDir) {
      return match; // Cannot normalize without file context
    }

    const currentFileDir = path.dirname(filePath);
    const targetAbsolutePath = path.resolve(currentFileDir, linkPath);

    // Instead of making path relative to baseDir, use the absolute path
    // by simply using the resolved path directly
    const absolutePath = targetAbsolutePath;
    const fragmentSuffix = fragment ? `#${fragment}` : "";

    // Normalize path separators for cross-platform compatibility
    const normalizedPath = absolutePath.replace(/\\/g, "/");

    return `[${linkText}](${normalizedPath}${fragmentSuffix})`;
  });

  return content;
}

/**
 * Resolves internal links in a README file to all markdown anchors.
 * @param {string} packageDir - The package directory
 * @param {string} readmeContent - Path to the README file
 * @returns {Promise<string>} - The updated README content
 */
export async function normalizeInternalLinksToMarkdownAnchors(readmeContent) {
  let updatedContent = readmeContent;

  // Find all internal links in the README
  const internalLinkRegex =
    /\[([^\]]+)\]\((.*?docs\/(functions|variables|interfaces)\/([^\/]+\.md))(?:#([^)]+))?\)/g;
  const matches = [...updatedContent.matchAll(internalLinkRegex)];

  for (const match of matches) {
    const [fullMatch, linkText, fullLinkPath, type, linkPath, fragment] = match;

    // Extract filename for anchor
    let filename = path.basename(linkPath, ".md");
    let anchor = "";

    // REVIEW: Need to test for edge cases
    if (fragment) {
      filename = fragment;
    }
    if (type == "functions") {
      anchor = `#function-${filename.toLowerCase()}`;
    } else if (type == "variables") {
      anchor = `#${filename.toLowerCase()}`;
    } else if (type == "interfaces") {
      anchor = `#interface-${filename.toLowerCase()}`;
    }
    updatedContent = updatedContent.replace(fullMatch, `[${linkText}](${anchor})`);
  }

  return updatedContent;
}

import fs from "fs";
import path from "path";

export default function normalizeInternalLinks(content, filePath, baseDir) {
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
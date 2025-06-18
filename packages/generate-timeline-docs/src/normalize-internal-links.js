export default function normalizeInternalLinks(filePath, baseDir) {
    let content = fs.readFileSync(filePath, "utf-8");

    const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^)]+))?\)/g;

    content = content.replace(linkRegex, (match, linkText, linkPath, fragment) => {
      const currentFileDir = path.dirname(filePath);
      const targetAbsolutePath = path.resolve(currentFileDir, linkPath);
      const docsRelativePath = path.relative(baseDir, targetAbsolutePath);
      const fragmentSuffix = fragment ? `#${fragment}` : "";
      const normalizedPath = docsRelativePath.replace(/\\/g, "/");

      return `[${linkText}](${normalizedPath}${fragmentSuffix})`;
    });

    return content;
}
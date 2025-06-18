import fs from "fs";
import path from "path";

/**
 * Filters the documentation to keep only the part with the interface description, table and return type, and writes the filtered content back to the file.
 * @param {string} interfacePath - The path to the interface documentation file.
 */
function filterInterfaceDoc(interfacePath) {
  const content = fs.readFileSync(interfacePath, "utf-8");
  const startMarker = /^# Interface.*/m;

  const startIndex = content.search(startMarker);
  if (startIndex === -1) return ""; // Return empty string if startMarker is not found

  // Return content starting from startMarker to the end
  let filteredInterfaceDocs = content.slice(startIndex).trim();
  filteredInterfaceDocs = filteredInterfaceDocs + "\n***";

  if (filteredInterfaceDocs) {
    fs.writeFileSync(interfacePath, filteredInterfaceDocs);
  }
  // If filtered content returns nothing, keep the original content
}

/**
 * Filters the interface documentation files in the specified package directory.
 * @param {string} packageDir - The root directory of the package.
 * @returns {boolean} - Whether the filtering process was successful.
 */
export default function processInterfaceDocs(packageDir) {
  const docsInterfacesDir = path.join(packageDir, "docs", "interfaces");

  // Step 1: Check if interfaces directory exists
  if (!fs.existsSync(docsInterfacesDir)) {
    console.error(`Interfaces directory not found: ${docsInterfacesDir}`);
    return false;
  }

  // Step 2: Process each interface file
  const mdFiles = fs.readdirSync(docsInterfacesDir).filter((file) => file.endsWith(".md"));

  mdFiles.forEach((file) => {
    const interfacePath = path.join(packageDir, "docs", "interfaces", `${file}`);
    filterInterfaceDoc(interfacePath);
  });

  // Step 3: Update all internal links to absolute paths
  console.log("Updating interface links to absolute paths...");
  mdFiles.forEach((file) => {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(docsInterfacesDir, file);
    let content = fs.readFileSync(filePath, "utf-8");

    const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^)]+))?\)/g;

    content = content.replace(linkRegex, (match, linkText, linkPath, fragment) => {
      // Get the current file's directory
      const currentFileDir = path.dirname(filePath);

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

    

    fs.writeFileSync(filePath, content);
  });

  

  console.log(`☑️ Complete processing interface documentation for ${packageDir}!`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  processInterfaceDocs(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

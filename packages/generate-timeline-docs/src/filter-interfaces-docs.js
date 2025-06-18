import fs from "fs";
import path from "path";
import normalizeInternalLinks from "./normalize-internal-links.js";

/**
 * Filters the documentation to keep only the part with the interface description, table and return type, and writes the filtered content back to the file.
 * @param {string} interfacePath - The path to the interface documentation file.
 * @return {string} - The filtered documentation content.
 */
function filterInterfaceDoc(interfacePath) {
  const content = fs.readFileSync(interfacePath, "utf-8");
  const startMarker = /^# Interface.*/m;

  const startIndex = content.search(startMarker);
  if (startIndex === -1) {
    console.warn(`No interface documentation found at ${interfacePath}.`);
    return content; // Return original content if startMarker is not found
  }

  // Return content starting from startMarker to the end
  let filteredInterfaceDocs = content.slice(startIndex).trim();
  filteredInterfaceDocs = filteredInterfaceDocs;
  return filteredInterfaceDocs;
}

/**
 * Filters the interface documentation files in the specified package directory.
 * @param {string} packageDir - The root directory of the package.
 * @returns {boolean} - Whether the filtering process was successful.
 */
export default function filterInterfacesDocs(packageDir) {
  const docsPath = path.join(packageDir, "docs");
  const docsInterfacesPath = path.join(packageDir, "docs", "interfaces");

  // Check if interfaces directory exists
  if (!fs.existsSync(docsInterfacesPath)) {
    console.warn(`Interfaces directory not found: ${docsInterfacesPath}`);
    return false;
  }

  // Process each interface file
  const mdFiles = fs.readdirSync(docsInterfacesPath).filter((file) => file.endsWith(".md"));

  mdFiles.forEach((file) => {
    const interfacePath = path.join(docsInterfacesPath, `${file}`);
    let filteredContent = filterInterfaceDoc(interfacePath);
    filteredContent = normalizeInternalLinks(filteredContent, interfacePath, docsPath);
    fs.writeFileSync(interfacePath, filteredContent + "\n***\n", "utf-8");
  });

  console.log(`☑️ Complete processing interface documentation for ${packageDir}.`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  filterInterfacesDocs(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

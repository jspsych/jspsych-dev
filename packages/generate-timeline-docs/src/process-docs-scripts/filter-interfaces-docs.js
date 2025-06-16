import fs from "fs";
import path from "path";

function filterInterfaceDoc(interfacePath) {
  const content = fs.readFileSync(interfacePath, "utf-8");
  const startMarker = /^# Interface.*/m;

  const startIndex = content.search(startMarker);
  if (startIndex === -1) return ""; // Return empty string if startMarker is not found

  // Return content starting from startMarker to the end
  const filteredInterfaceDocs = content.slice(startIndex).trim();

  if (filteredInterfaceDocs) {
    fs.writeFileSync(interfacePath, filteredInterfaceDocs);
  }
  // If filtered content returns nothing, keep the original content
}

export default function filterInterfaceDocs(packageDir) {
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

  // Step 3: After processing all files, append linked file contents and update links
  mdFiles.forEach((file) => {
    const currentFilePath = path.join(docsInterfacesDir, file);
    let content = fs.readFileSync(currentFilePath, "utf-8");

    const linkRegex = /([\w-]+\.md)/g; // Match links to .md files in the same directory
    let match;
    let appendedContent = "";

    while ((match = linkRegex.exec(content)) !== null) {
      const linkedFileName = match[1];
      const linkedFilePath = path.join(docsInterfacesDir, linkedFileName);

      if (fs.existsSync(linkedFilePath)) {
        const linkedFileContent = fs.readFileSync(linkedFilePath, "utf-8");
        appendedContent += `\n\n---\n\n${linkedFileContent}`;

        // Update the link in the current file to point to the appended content
        const updatedLink = `#interface-${linkedFileName.replace(".md", "")}`;
        content = content.replace(match[0], updatedLink);
      }
    }

    // Write the updated content back to the current file
    if (appendedContent) {
      fs.writeFileSync(currentFilePath, content + appendedContent);
    }
  });

  console.log(`✔️ Complete processing interface documentation for ${packageDir}!`);
  return true;
}

/**
 * @dev
 * Entry point for debugging or running this file directly.
 */
function runAsScript() {
  const targetDir = process.cwd();
  filterInterfaceDocs(targetDir);
}

if (import.meta.url === import.meta.main) {
  runAsScript();
}

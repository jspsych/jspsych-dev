import fs from "fs";
import path from "path";

function filterInterfaceDocs(filename) {
  const docsInterfacePath = path.join(
    new URL("./docs/interfaces", import.meta.url).pathname,
    `${filename}.md`
  );
  const content = fs.readFileSync(docsInterfacePath, "utf-8");
  const startMarker = /^# Interface.*/m;

  const startIndex = content.search(startMarker);
  if (startIndex === -1) return ""; // Return empty string if startMarker is not found

  // Return content starting from startMarker to the end
  const filteredInterfaceDocs = content.slice(startIndex).trim();

  if (filteredInterfaceDocs) {
    fs.writeFileSync(docsInterfacePath, filteredInterfaceDocs);
  }
  // If filtered content returns nothing, keep the original content
}

// Apply filterInterfaceDocs to all .md files in ./docs/interfaces
const docsInterfacesDir = new URL("./docs/interfaces", import.meta.url).pathname;
const mdFiles = fs.readdirSync(docsInterfacesDir).filter((file) => file.endsWith(".md"));

mdFiles.forEach((file) => {
  filterInterfaceDocs(file.replace(".md", ""));
});



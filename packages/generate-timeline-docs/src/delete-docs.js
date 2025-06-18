import { rmSync } from "fs";

// Function to delete the docs folder
export default function deleteDocs(docsDir) {
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
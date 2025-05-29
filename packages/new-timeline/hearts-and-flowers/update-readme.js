import fs from 'fs';
import path from 'path';

// Define paths
const baseDir = new URL('.', import.meta.url).pathname;
const docsDir = path.join(baseDir, 'docs');
const readmePath = path.join(baseDir, 'README.md');

// Update createTimeline placeholder
function updatePlaceholder(fpFromDocs, placeholder) {
  const fp = path.join(docsDir, fpFromDocs);
  console.log(fp)
  try {
    // Read files
    const fpContent = fs.readFileSync(fp, 'utf8');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Replace placeholder with content
    const updatedReadmeContent = readmeContent.replace(
      placeholder,
      fpContent
    );
    
    // Write updated README
    fs.writeFileSync(readmePath, updatedReadmeContent);
    console.log(`Successfully updated ${placeholder} in README.md`);
  } catch (error) {
    console.error('Error updating createTimeline description:', error);
  }
}

// Main function
function updateReadmePlaceholders() {
  updatePlaceholder('functions/createTimeline.md', '<!-- createTimeline documentation -->');
  updatePlaceholder('variables/timelineUnits.md', '<!-- timelineUnits documentation -->');
  updatePlaceholder('variables/utils.md', '<!-- utils documentation -->');
}

// Run the updates
updateReadmePlaceholders();

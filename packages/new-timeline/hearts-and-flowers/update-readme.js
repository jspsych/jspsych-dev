import fs from 'fs';
import path from 'path';

// Define paths
const baseDir = new URL('.', import.meta.url).pathname;
const docsDir = path.join(baseDir, 'docs');
const readmePath = path.join(baseDir, 'README.md');

// Update createTimeline placeholder
function updateCreateTimelinePlaceholder() {
  const createTimelinePath = path.join(docsDir, 'functions', 'createTimeline.md');
  
  try {
    // Read files
    const createTimelineContent = fs.readFileSync(createTimelinePath, 'utf8');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Replace placeholder with content
    const updatedReadmeContent = readmeContent.replace(
      /<!--createTimeline Documentation-->/,
      createTimelineContent
    );
    
    // Write updated README
    fs.writeFileSync(readmePath, updatedReadmeContent);
    console.log('Successfully updated createTimeline description in README.md');
  } catch (error) {
    console.error('Error updating createTimeline description:', error);
  }
}

// Main function
function updateReadmePlaceholders() {
  updateCreateTimelinePlaceholder();
  // Add more placeholder update functions here as needed
}

// Run the updates
updateReadmePlaceholders();

import fs from 'fs';
import path from 'path';

const docsTimelinePath = path.join(new URL('./docs/functions', import.meta.url).pathname, 'createTimeline.md');
const content = fs.readFileSync(docsTimelinePath, 'utf-8');

function filterCreateTimelineDocs(content) {
  function filterParametersTable(content) {
    const startMarker = '# Function: createTimeline()';
    const endMarker = '## Returns';
    const nextHeadingRegex = /^##\s+/m;
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return content;
    
    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) return content;
    
    const nextHeadingIndex = content.slice(endIndex).search(nextHeadingRegex);
    const sliceEnd = nextHeadingIndex === -1 ? content.length : endIndex + nextHeadingIndex;
    
    return content.slice(startIndex, sliceEnd).trim();
  }
  
  function filterReturnsTable(content) {
    const startMarker = '## Returns';
    const headingRegex = /^#+\s/m;  // Matches any number of # followed by a space
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return content;
    
    // Find the index of the next heading after Returns
    const nextHeadingIndex = content.slice(startIndex + startMarker.length).search(headingRegex);
    
    // If no next heading is found, return content from Returns to the end
    if (nextHeadingIndex === -1) {
      return content.slice(startIndex).trim();
    }
    
    // Return content from Returns up to the start of the next heading
    return content.slice(startIndex, startIndex + startMarker.length + nextHeadingIndex).trim();
  }
  
  return filterParametersTable(content) + '\n\n' + filterReturnsTable(content);
}

const filteredTimelineDocs = filterCreateTimelineDocs(content);
if (filteredTimelineDocs) {
  fs.writeFileSync(docsTimelinePath, filteredTimelineDocs);
}
// If filtered content returns nothing, keep the original content
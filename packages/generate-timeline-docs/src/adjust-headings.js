/**
 * Adjusts all markdown headings in content so that the minimum level starts at a specified level
 * @param {string} content - The markdown content to adjust headings in
 * @param {number} targetStartLevel - The desired starting level for headings (default: 3 for ###)
 * @returns {string} - The content with adjusted heading levels
 */
export function adjustHeadingLevels(content, targetStartLevel = 3) {
  if (!content) return "";
  
  // Find all headings in the content
  const headingRegex = /^#+\s/gm;
  const headings = content.match(headingRegex);
  
  // If no headings found, return original content
  if (!headings || headings.length === 0) {
    return content;
  }
  
  // Find the minimum heading level (fewest # characters)
  const minHeadingLevel = Math.min(...headings.map(h => h.trim().length));
  
  // Calculate the level adjustment needed (may be positive or negative)
  const levelAdjustment = targetStartLevel - minHeadingLevel;
  
  // Replace all headings with adjusted levels
  return content.replace(headingRegex, match => {
    const currentLevel = match.trim().length;
    const newLevel = currentLevel + levelAdjustment;
    
    // Make sure we have at least one # and don't exceed reasonable limits (e.g. six #)
    const adjustedLevel = Math.max(1, Math.min(6, newLevel));
    
    return "#".repeat(adjustedLevel) + " ";
  });
}
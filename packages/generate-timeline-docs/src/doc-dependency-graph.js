import fs from "fs";
import path from "path";

import { DepGraph } from "dependency-graph";

/**
 * Recursively loops through all files in docs/ and registers them in dependency graph.
 * @param {string} dir - The starting directory path
 * @param {DocDependencyGraph} depGraph - The document dependency graph instance
 */
export function addDocsInDirAsNodes(dir, depGraph) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file); // Full path of the file/directory
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      addDocsInDirAsNodes(fullPath, depGraph);
    } else if (stats.isFile() && file.endsWith(".md")) {
      // If it's a markdown file, add it as a node in the dependency graph
      try {
        depGraph.graph.addNode(fullPath, fs.readFileSync(fullPath, "utf-8"));
      } catch (error) {
        console.warn(`Error processing file ${fullPath}: ${error.message}`);
      }
    }
  });
}

function sliceDocsFragmentContent(linkedPath, fragment) {
  let nodeContent = "";
  // Try to read the content of the linked file
  try {
    if (fs.existsSync(linkedPath)) {
      const fullContent = fs.readFileSync(linkedPath, "utf-8");

      // Convert fragment to a heading that could appear in markdown
      // e.g., "some-heading" becomes a regex for "# Some Heading" (case insensitive)
      const headingText = fragment
        .replace(/-/g, " ")
        .replace(/^\w|\s\w/g, (match) => match.toUpperCase());

      // Create regex to find the heading
      const headingRegex = new RegExp(`^#+\\s+${headingText}`, "mi");

      const headingMatch = fullContent.match(headingRegex);
      if (headingMatch) {
        const headingStart = headingMatch.index;
        // Find the next separator or end of file
        const sectionEnd = fullContent.indexOf("***", headingStart);

        // Extract just the section needed
        if (sectionEnd !== -1) {
          nodeContent = fullContent.substring(headingStart, sectionEnd).trim();
        } else {
          nodeContent = fullContent.substring(headingStart).trim();
        }
      }
    }
  } catch (error) {
    console.warn(`Error reading linked file ${linkedPath}: ${error.message}`);
  }
  return nodeContent;
}

class DocDependencyGraph {
  constructor() {
    this.graph = new DepGraph({ circular: true });
  }

  /**
   * Extract dependencies from file content
   * @param {string} filePath - Path to the file
   */
  extractDependencies(filePath) {
    const content = this.graph.getNodeData(filePath);

    // Find all markdown link references to other files
    const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^\)]+))?\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      let [fullMatch, linkText, linkedPath, fragment] = match;
      if (linkedPath !== filePath && !filePath.includes(linkedPath)) {
        // Avoid self-references
        if (fragment) {
          const nodeContent = sliceDocsFragmentContent(linkedPath, fragment);
          // Add the linked file as a node with the extracted content
          if (nodeContent) {
            this.graph.addNode(linkedPath + "#" + fragment, nodeContent);
            this.graph.addDependency(filePath, linkedPath + "#" + fragment);
          } else {
            console.warn(
              `Fragment "${fragment}" in link "${fullMatch}" not found in file ${linkedPath}`
            );
            continue; // Skip if fragment content is not found
          }
        } else {
          this.graph.addDependency(filePath, linkedPath);
        }
      }
    }
  }

  extractAllDependencies() {
    // Loop through all nodes and extract dependencies
    for (const node of this.graph.nodes.keys()) {
      this.extractDependencies(node);
    }
  }

  /**
   * Get all files that need to be processed in dependency order,
   * prioritizing specific files and their dependencies
   * @returns {Array<{name: string, content: string}>} - Ordered array of files
   */
  getOrderedFiles() {
    try {
      // Create empty result array
      const result = [];
      const added = new Set();

      // Helper function to add a node and its dependencies in depth-first order
      const addNodeAndDependencies = (node) => {
        if (added.has(node)) return; // Skip if already added

        // Add the node itself
        added.add(node);
        result.push({
          name: node,
          content: this.graph.getNodeData(node),
        });

        // Add all dependencies recursively (depth-first)
        if (this.graph.hasNode(node)) {
          const dependencies = this.graph.directDependenciesOf(node);
          for (const dep of dependencies) {
            addNodeAndDependencies(dep);
          }
        }
      };

      // Helper to find nodes containing a specific string
      const findNodesByPattern = (pattern) => {
        // Using this.graph.nodes instead of this.nodes
        return Array.from(this.graph.nodes.keys()).filter((node) =>
          node.toLowerCase().includes(pattern.toLowerCase())
        );
      };

      // 1. Start with createTimeline and its dependencies
      const createTimelineNodes = findNodesByPattern("createTimeline");
      for (const node of createTimelineNodes) {
        addNodeAndDependencies(node);
      }

      // 2. Next add timelineUnits and its dependencies
      const timelineUnitsNodes = findNodesByPattern("timelineUnits");
      for (const node of timelineUnitsNodes) {
        addNodeAndDependencies(node);
      }

      // 3. Finally add utils and its dependencies
      const utilsNodes = findNodesByPattern("utils");
      for (const node of utilsNodes) {
        addNodeAndDependencies(node);
      }

      return result;
    } catch (error) {
      console.warn(`Error ordering files: ${error.message}`);
      // Fall back to unordered files
      return [...this.graph.nodes.keys()].map((name) => ({
        name,
        content: this.graph.getNodeData(name),
      }));
    }
  }
}

// Export a singleton instance
export const docGraph = new DocDependencyGraph();

// Export class in case needed for testing
export default DocDependencyGraph;

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
        const content = fs.readFileSync(fullPath, "utf-8");

        // Add the entire file as a node
        // Assume if the file is a documentation file, it should have at least one section ending with "***"
        depGraph.graph.addNode(fullPath, "");

        // Process sections separated by *** markers
        const sections = content.split(/\n\s*\*\*\*\s*\n/);

        let currentPosition = 0;
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i].trim();

          if (section) {
            // Find the first line that starts with # (a heading)
            const lines = section.split("\n");
            let headingLine = null;
            
            for (const line of lines) {
              if (line.trim().startsWith("#")) {
                headingLine = line.trim();
                break;
              }
            }
            
            if (headingLine) {
              const headingText = headingLine.replace(/^#+\s+/, "");
              const anchorId = headingText
                .toLowerCase()
                .replace(/[^\w\s-]/g, "") // Remove special chars
                .replace(/\s+/g, "-"); // Replace spaces with hyphens
              const sectionStart = content.indexOf(section, currentPosition);
              currentPosition = sectionStart + section.length;
              const sectionKey = `${fullPath}#${anchorId}`;
              
              // Check if section already ends with *** to avoid duplicates
              const sectionWithMarker = section.trimEnd().endsWith("***") 
                ? section 
                : section + "\n\n***\n\n";
              depGraph.graph.addNode(sectionKey, sectionWithMarker);
              depGraph.graph.addDependency(fullPath, sectionKey);
            }
          }
        }
      } catch (error) {
        console.warn(`Error processing file ${fullPath}: ${error.message}`);
      }
    }
  });
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
          const fullInternalLink = `${linkedPath}#${fragment}`;
          if (this.graph.hasNode(fullInternalLink)) {
            // If the fragment exists as a node
            this.graph.addDependency(filePath, fullInternalLink);
          } else if (this.graph.hasNode(linkedPath)) {
            // If the file exists but not the fragment
            console.warn(`Fragment "${fragment}" in link "${linkedPath}" not found.`);
            this.graph.addDependency(filePath, linkedPath);
            continue;
          } else {
            // If neither the file nor fragment exists
            console.warn(`Linked file "${fullInternalLink}" not found in dependency graph.`);
            continue;
          }
        } else {
          // If no fragment, just link to the file
          if (this.graph.hasNode(linkedPath)) {
            this.graph.addDependency(filePath, linkedPath);
          } else {
            console.warn(`Linked file "${linkedPath}" not found in dependency graph.`);
          }
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

      // 4. Add any remaining nodes that weren't included yet
      const allNodes = Array.from(this.graph.nodes.keys());
      for (const node of allNodes) {
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

import { DepGraph } from "dependency-graph";

class DocDependencyGraph {
  constructor() {
    this.graph = new DepGraph({ circular: true });
    this.processedFiles = new Set();
    this.fileContents = new Map(); // Cache file contents
  }

  /**
   * Add a file to the dependency graph
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  addFile(filePath, content) {
    if (!this.graph.hasNode(filePath)) {
      this.graph.addNode(filePath);
      this.fileContents.set(filePath, content);
      
      // Parse content for dependencies
      this.extractDependencies(filePath , content);
    }
  }

  /**
   * Extract dependencies from file content
   * @param {string} filePath - Path to the file
   * @param {string} content - File content
   */
  extractDependencies(filePath, content) {
    // Find all markdown link references to other files
    const linkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)(?:#([^\)]+))?\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, linkText, linkedPath, fragment] = match;
      linkedPath = linkedPath + (fragment ? '#' + fragment : ''); // Include fragment if present

      if (linkedPath !== filePath) { // Avoid self-references
        if (!this.graph.hasNode(linkedPath)) {
          this.graph.addNode(linkedPath);
        }
        this.graph.addDependency(filePath, linkedPath);
      }
    }
  }

  /**
   * Get all files that need to be processed in dependency order
   * @returns {Array<{name: string, content: string}>} - Ordered array of files
   */
  getOrderedFiles() {
    try {
      // Get ordered list of files
      const nodeOrder = this.graph.overallOrder();
      
      return nodeOrder
        .filter(name => this.fileContents.has(name))
        .map(name => ({
          name,
          content: this.fileContents.get(name)
        }));
    } catch (error) {
      if (error.message.includes('circular')) {
        console.warn('Circular dependencies detected in documentation. Processing may be incomplete.');
        // Return files in some order, handling the circular dependency as best we can
        return [...this.fileContents.keys()].map(name => ({
          name,
          content: this.fileContents.get(name)
        }));
      }
      // If not a circular dependency error, rethrow
      throw error;
    }
  }

  /**
   * Mark a file as processed to avoid duplication
   * @param {string} filePath - Path to the file
   */
  markProcessed(fileName) {
    this.processedFiles.add(fileName);
  }

  /**
   * Check if file has been processed
   * @param {string} fileName - The file name
   * @returns {boolean} - Whether the file has been processed
   */
  isProcessed(fileName) {
    return this.processedFiles.has(fileName);
  }
}

// Export a singleton instance
export const docGraph = new DocDependencyGraph();

// Export class in case needed for testing
export default DocDependencyGraph;

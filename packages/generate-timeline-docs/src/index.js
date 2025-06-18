#!/usr/bin/env node

import generateTypedocDocs from "./generate-typedoc-docs.js";
import filterInterfacesDocs from "./filter-interfaces-docs.js";
import filterFunctionsDocs from "./filter-function-docs.js";
import filterVariablesDocs from "./filter-variables-docs.js";
import {docGraph, addDocsInDirAsNodes } from "./doc-dependency-graph.js";
// import updateReadme from "./update-readme.js";
import path from "path";
import fs from "fs";


/**
 * Runs the complete documentation generation pipeline
 * @param {string} packageDir - The root directory of the timeline package
 * @param {Object} options - Options for controlling the documentation process
 * @param {boolean} options.skipCleanup - Whether to skip the cleanup step
 * @returns {Promise<boolean>} - Whether the documentation process was successful
 */
export default async function generateDocumentation(packageDir, options = { skipCleanup: false }) {
  const readmePath = path.join(packageDir, "README.md");
  console.log(`\n1️⃣ Generating TypeDoc documentation...`);
  
  try {
    // Step 1: Generate TypeDoc documentation
    const typedocSuccess = await generateTypedocDocs(packageDir);
    if (!typedocSuccess) {
      console.error("TypeDoc documentation generation failed.");
      return false;
    }

    // Step 2: Delete README.md from docs
    if (fs.existsSync(path.join(packageDir, "docs", "README.md"))) {
      fs.rmSync(path.join(packageDir, "docs", "README.md"));
      console.log("Deleted README.md from docs directory.");
    }

    // Step 2: Process interface documentation files
    console.log(`\n2️⃣ Processing interfaces documentation...`);
    filterInterfacesDocs(packageDir);

    // Step 3: Process functions documentation files
    console.log(`\n3️⃣ Processing functions documentation...`);
    filterFunctionsDocs(packageDir);

    // Step 4: Process variables documentation files
    console.log(`\n4️⃣ Processing variables documentation...`);
    filterVariablesDocs(packageDir);

    // Step 5: Loop through docs to build dependency graph
    console.log(`\n5️⃣ Building documentation dependency graph...`);
    addDocsInDirAsNodes(path.join(packageDir, "docs"), docGraph);
    docGraph.extractAllDependencies();
    console.log(docGraph.graph.nodes.keys());
    console.log(docGraph.getOrderedFiles().map(file => file.name));


    // // Step 6: Update README with processed documentation
    // console.log(`\n6️⃣ Updating README with processed documentation...`);
    // await updateReadme(packageDir, readmePath);
    
    // // // Add a new final step to resolve all internal links
    // // console.log(`\n7️⃣ Resolving internal links in README...`);
    // // await resolveInternalLinks(packageDir, readmePath);
    
    console.log("\n✅ Documentation generation completed successfully!");
    return true;
  } catch (error) {
    console.error(`Documentation generation failed: ${error.message}`);
    return false;
  }
}

/** 
 * @dev
 * Make this more robust for different execution methods
 * This will run regardless of how the script is executed
 */
const isDirectExecution = process.argv[1] && 
                          (process.argv[1].endsWith('index.js') || 
                           process.argv[1].includes('generate-timeline-docs'));

if (isDirectExecution) {
  const packageDir = process.argv[2] || process.cwd();
  generateDocumentation(packageDir)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}

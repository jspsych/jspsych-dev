#!/usr/bin/env node

import fs from "fs";
import path from "path";

import { program } from "commander";

import deleteDocs from "./delete-docs.js";
import { addDocsInDirAsNodes, docGraph } from "./doc-dependency-graph.js";
import filterFunctionsDocs from "./filter-function-docs.js";
import filterInterfacesDocs from "./filter-interfaces-docs.js";
import filterVariablesDocs from "./filter-variables-docs.js";
import generateTypedocDocs from "./generate-typedoc-docs.js";
import updateReadme from "./update-readme.js";

program
  .name("@jspsych-dev/generate-timeline-docs")
  .description(
    "Generate documentation for your jsPsych timeline package and optionally update the README.md"
  )
  .version("0.0.1")
  .option("--skip-cleanup", "Keep the docs/ directory TypeDoc generates", false)
  .option(
    "--skip-update-readme",
    "Don't update package README.md file with generated documentation", false
  )
  .option("--help", "Show this help message")
  .argument("[package-directory]", "Path to the timeline package directory", process.cwd()) // Default to current directory if not provided
  .action(async (packageDir, options) => {
    console.log(`\n1️⃣ Generating TypeDoc documentation...`);
    try {
      const readmePath = path.join(packageDir, "README.md");
      const docsDir = path.join(packageDir, "docs");
      // Step 1: Generate TypeDoc documentation
      const typedocSuccess = await generateTypedocDocs(packageDir);
      if (!typedocSuccess) {
        console.error("TypeDoc documentation generation failed.");
        return;
      }

      // Step 1.5: Delete README.md in docs/
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
      console.log(`☑️ Completed building documentation dependency graph.`);

      // Step 6: Update README with processed documentation
      if (!options.skipUpdateReadme) {
        console.log(`\n6️⃣ Updating README with processed documentation...`);
        await updateReadme(readmePath, docGraph);
      } else {
        console.warn(`Skipping README update as per options.`);
      }

      // Step 7: Final cleanup if not skipped
      if (!options.skipCleanup) {
        console.log(`\n7️⃣ Performing final cleanup...`);
        await deleteDocs(docsDir);
      } else {
        console.warn(`Skipping final cleanup as per options.`);
      }

      console.log("\n✅ Documentation generation and appending completed successfully!");
      return true;
    } catch (error) {
      console.error(`Documentation generation failed: ${error.message}`);
      return false;
    }
  });

program.parse(process.argv);

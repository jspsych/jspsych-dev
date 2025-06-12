#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import filterInterfacesDocs from "./process-docs-scripts/filter-interfaces-docs.js";
import filterTimelineDocs from "./process-docs-scripts/filter-timeline-docs.js";
import filterTimelineUnitsDocs from "./process-docs-scripts/filter-timelineUnits-docs.js";
import filterUtilsDocs from "./process-docs-scripts/filter-utils-docs.js";
import updateReadme from "./update-readme.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Autogenerates documentation for a package using TypeDoc and processes the output.
 * @param {string} packageDir - The root directory of the timeline package
 * @param {Object} options - Options for controlling the documentation process
 * @param {boolean} options.skipCleanup - Whether to skip the cleanup step
 * @returns {Promise<boolean>} - Whether the documentation process was successful
 */
async function generateDocumentation(packageDir, options = { skipCleanup: false }) {
  const docsDir = path.join(packageDir, "docs");
  const readmePath = path.join(packageDir, "README.md");

  try {
    // Step 1: Generate documentation with TypeDoc
    console.log(`Generating TypeDoc documentation...`);
    const typedocConfigPath = path.join(__dirname, "..", "typedoc.json");
    const toolDir = path.join(__dirname, "..");

    // Look for src/index.ts as entry point
    const srcDir = path.join(packageDir, "src");
    let entryPointsArg = "";

    if (fs.existsSync(srcDir)) {
      const indexFilePath = path.join(srcDir, "index.ts");

      if (fs.existsSync(indexFilePath)) {
        entryPointsArg = `"${indexFilePath}"`;
      } else {
        console.error(`No index.ts found in ${srcDir}. Terminating documentation process.`);
        // REVIEW: fallback?
        return false;
      }
    } else {
      console.error(`Source directory not found: ${srcDir}`);
      return false;
    }

    // Use local installation paths
    // REVIEW: is this good practice?
    const typedocPath = path.join(toolDir, "node_modules", ".bin", "typedoc");
    execSync(`${typedocPath} --options ${typedocConfigPath} --out ${docsDir} ${entryPointsArg}`, {
      stdio: "inherit",
      cwd: packageDir,
      env: {
        ...process.env,
        NODE_PATH: path.join(toolDir, "node_modules"),
      },
    });

    console.log("☑️ Finished generating TypeDoc documentation.");

    // Step 2: Process each generated documentation file
    console.log(`Processing documentation files...`);
    filterInterfacesDocs(packageDir);
    filterTimelineDocs(packageDir);
    filterTimelineUnitsDocs(packageDir);
    filterUtilsDocs(packageDir);
    console.log("☑️ Finished processing documentation files.");

    // Step 3: Update README with processed documentation
    console.log(`Updating README with processed documentation...`);
    updateReadme(
      packageDir,
      readmePath,
      "functions/createTimeline.md",
      "variables/timelineUnits.md",
      "variables/utils.md"
    );
    console.log("☑️ Finished updating README with documentation sections.");

    // Step 4: Clean up documentation files (unless skipCleanup is true)
    if (!options.skipCleanup) {
      console.log(`Cleaning up documentation files...`);
      if (fs.existsSync(docsDir)) {
        fs.rmSync(docsDir, { recursive: true, force: true });
      }
    }
    console.log("☑️ Finished cleaning up documentation files.");
    return true;
  } catch (error) {
    console.error(`Documentation process failed: ${error.message}`);
    return false;
  }
}

/**
 * @dev
 * If this script is run directly (not imported as a module), it will generate documentation for the package
 * in the current working directory.
 */

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // Get the directory of the documentation tool
  const toolDir = path.resolve(__dirname, ".."); // Root directory of the tool
  const packageDir = process.cwd(); // Package directory

  console.log(`Using package directory: ${packageDir}`);
  console.log(`Documentation tool directory: ${toolDir}`);

  // Set up the NODE_PATH environment variable to help find modules
  process.env.NODE_PATH = path.join(toolDir, "node_modules");

  generateDocumentation(packageDir)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}

export default generateDocumentation;

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Autogenerates documentation for a package using TypeDoc and processes the output.
 * @param {string} packageDir - The root directory of the timeline package
 * @param {Object} options - Options for controlling the documentation process
 * @param {boolean} options.skipCleanup - Whether to skip the cleanup step
 * @returns {Promise<boolean>} - Whether the documentation process was successful
 */
export default async function generateDocumentation(packageDir) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const rootDir = path.join(__dirname, "..");
  const rootRepo = path.resolve(__dirname, "..", "..");
  const typedocConfigPath = path.join(__dirname, "..", "typedoc.json");
  const docsDir = path.join(packageDir, "docs");

  try {
    // Read the typedoc configuration to get configured entry points
    let typedocConfig;
    try {
      const configContent = fs.readFileSync(typedocConfigPath, "utf8");
      typedocConfig = JSON.parse(configContent);
    } catch (error) {
      console.error(`Error reading typedoc config: ${error.message}`);
      return false;
    }

    // Get entry points from config, or use a default
    const configuredEntryPoints = typedocConfig.entryPoints || ["src/index.ts"];

    // Look for entry points in order of configuration
    let entryPointsArg = "";
    let entryPointFound = false;

    for (const entryPoint of configuredEntryPoints) {
      const entryPath = path.join(packageDir, entryPoint);

      if (fs.existsSync(entryPath)) {
        entryPointsArg = `"${entryPath}"`;
        entryPointFound = true;
        console.log(`Using entry point: ${entryPath}`);
        break;
      }
    }

    if (!entryPointFound) {
      console.error(
        `No valid entry points found in ${packageDir}. Configured entry points: ${configuredEntryPoints.join(
          ", "
        )}`
      );
      return false;
    }

    execSync(`npx typedoc --options ${typedocConfigPath} --out ${docsDir} ${entryPointsArg}`, {
      stdio: "inherit",
      cwd: rootDir,
      env: {
        ...process.env,
        NODE_PATH: [path.join(rootDir, "node_modules"), path.join(rootRepo, "node_modules")].join(
          path.delimiter
        ),
      },
    });

    console.log("☑️ Finished generating TypeDoc documentation.");
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

if (import.meta.url === import.meta.main) {
  // Get the directory of the documentation tool
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const toolDir = path.resolve(__dirname, ".."); // Root directory of the tool
  const rootDir = path.resolve(__dirname, "..", ".."); // Parent directory of the tool
  const packageDir = process.cwd(); // Package directory

  console.info(`Using package directory: ${packageDir}`);
  console.info(`Documentation tool directory: ${toolDir}`);

  // Set up the NODE_PATH environment variable to help find modules
  process.env.NODE_PATH = [
    path.join(toolDir, "node_modules"),
    path.join(rootDir, "node_modules"),
  ].join(path.delimiter);

  generateDocumentation(packageDir)
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}

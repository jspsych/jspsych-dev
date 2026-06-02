#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { Command } from "commander";

import { extractVersionFromPackageJson, identifyPackageType, updateDocSections } from "./utils.js";
import { getPluginInfo, getPluginInfoAndExamples } from "./parsers/plugin.js";
import { getPluginDocs } from "./renderers/plugin.js";
import { ExtensionInfo, PluginInfo } from "./types/info.js";
import { getExtensionInfo, getExtensionInfoAndExamples } from "./parsers/extension.js";
import { getExtensionDocs } from "./renderers/extension.js";

// auto get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
) as { version: string };
const { version } = packageJson;

interface CliOptions {
  source?: string;
  dest?: string;
  example?: string;
}

// TODO: simulation mode-- detect if simulation mode is supported via these plugins.
function main(options: CliOptions): void {
  let sourcePath: string;
  if (options.source) {
    sourcePath = options.source;
  } else {
    throw new Error("No source file provided. Please specify a source file with --source.");
  }

  if (!options.dest) {
    throw new Error("No destination file provided. Please specify a destination file with --dest.");
  }

  const source = ts.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf-8"),
    ts.ScriptTarget.Latest,
    true,
  );

  const { classNode, type } = identifyPackageType(source);
  console.log(type)
  let docs: Record<string, string>;

  if (type === "extension") {
    console.log("Identified package type: extension");

    let extensionInfo: ExtensionInfo;
    if (options.example) {
      extensionInfo = getExtensionInfoAndExamples(source, classNode, options.example);
    } else {
      extensionInfo = getExtensionInfo(source, classNode);
    }

    console.log(extensionInfo);
    return;

    extensionInfo.version = extractVersionFromPackageJson();

    docs = getExtensionDocs(extensionInfo);
  } else if (type === "plugin") {
    console.log("Identified package type: plugin");

    let pluginInfo: PluginInfo;
    if (options.example) {
      pluginInfo = getPluginInfoAndExamples(source, classNode, options.example);
    } else {
      pluginInfo = getPluginInfo(source, classNode);
    }

    pluginInfo.version = extractVersionFromPackageJson();

    docs = getPluginDocs(pluginInfo);
  } else {
    throw new Error("Unrecognized package type.");
  }

  const rawContent = Object.values(docs).join("\n\n");
  if (!fs.existsSync(options.dest)) {
    fs.writeFileSync(options.dest, rawContent, "utf8");
  } else {
    const existingContent = fs.readFileSync(options.dest, "utf8");
    if (existingContent.trim() === "") {
      fs.writeFileSync(options.dest, rawContent, "utf8");
    } else {
      const updatedContent = updateDocSections(existingContent, docs);
      fs.writeFileSync(options.dest, updatedContent, "utf8");
    }
  }
}

const program = new Command();

program
  .name("autodoc")
  .description("CLI tool to generate documentation for jsPsych plugins")
  .version(version)
  .option("--source <name>", "Source of the package")
  .option("--dest <name>", "Destination directory for the generated documentation")
  .option("--repo <name>", "Repository that contains the source/destination files (optional)")
  .option("--example <name>", "Example folder containing usages of the plugin (optional)")
  .option("-v, --verbose", "Enable verbose logging (optional)")
  .option(
    "-f, --force",
    "Force overwrite of existing documentation (optional, use with caution or with --copy)",
  )
  .option("--copy <name>", "Copy original documentation to a specified location (optional)")
  .addHelpText(
    "after",
    `
Examples:
  $ autodoc --source /src/index.ts --dest /docs/index.md
  $ autodoc --source /src/index.ts --dest /docs/index.md --example /examples/`,
  );

program.parse();
const options = program.opts<CliOptions>();
main(options);

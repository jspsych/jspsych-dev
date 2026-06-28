#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

import { Command } from "commander";

import {
  discoverDest,
  discoverExample,
  discoverSource,
  extractPackageJsonInfo,
  identifyPackageType,
  updateDocSections,
} from "./utils.js";
import { getPluginInfo, getPluginInfoAndExamples } from "./parsers/plugin.js";
import { getPluginDocs } from "./renderers/plugin.js";
import { getExtensionInfo, getExtensionInfoAndExamples } from "./parsers/extension.js";
import { getExtensionDocs } from "./renderers/extension.js";
import { getTimelineInfo, getTimelineInfoAndExamples } from "./parsers/timeline.js";
import { getTimelineDocs } from "./renderers/timeline.js";
import { AutodocConfig, ExtensionInfo, PluginInfo, TimelineInfo } from "./types/info.js";

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
  packageJson?: string;
  dryRun?: boolean;
  config?: string;
}

async function loadConfig(configPath: string | undefined): Promise<AutodocConfig> {
  if (!configPath) return {};
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found at ${resolved}.`);
  }
  const mod = (await import(pathToFileURL(resolved).href)) as { default?: AutodocConfig };
  return mod.default ?? {};
}

// TODO: simulation mode-- detect if simulation mode is supported via these plugins.
async function main(options: CliOptions): Promise<void> {
  const userConfig = await loadConfig(options.config);

  let cachedAnchor: string | undefined;

  /** cwd if it is a package root (contains package.json), else undefined, memoized. */
  const anchorOrNull = (): string | undefined => {
    if (cachedAnchor) return cachedAnchor;
    const cwd = process.cwd();
    if (!fs.existsSync(path.join(cwd, "package.json"))) return undefined;
    return (cachedAnchor = path.resolve(cwd));
  };

  /** like `anchorOrNull`, for inputs that genuinely require discovery (throw if null) */
  const anchor = (): string => {
    const a = anchorOrNull();
    if (!a) {
      throw new Error(
        "No package.json found in the current directory. " +
          "Run autodoc from the root of the package you want to document, " +
          "or pass --source/--dest/--package-json explicitly.",
      );
    }
    return a;
  };

  const sourcePath = options.source ?? discoverSource(anchor());
  const packageJsonPath = options.packageJson ?? path.join(anchor(), "package.json");
  
  // example discovery is optional, so shouldn't really have to deal w/ fail-fast
  // behavior if not necessary
  const exampleAnchor = anchorOrNull();
  const examplePath = options.example ?? (exampleAnchor ? discoverExample(exampleAnchor) : undefined);

  const source = ts.createSourceFile(
    sourcePath,
    fs.readFileSync(sourcePath, "utf-8"),
    ts.ScriptTarget.Latest,
    true,
  );

  const { mainNode, type } = identifyPackageType(source);
  const packageJsonInfo = extractPackageJsonInfo(packageJsonPath);

  // dest depends on the resolved type + package name, so it resolves last.
  const destPath = options.dest ?? discoverDest(anchor(), packageJsonInfo.name, type);

  const mark = (explicit: boolean) => (explicit ? "explicit" : "discovered");
  console.log("Resolved inputs:");
  console.log(`  type         ${type}`);
  console.log(`  source       ${sourcePath} (${mark(!!options.source)})`);
  console.log(`  dest         ${destPath} (${mark(!!options.dest)})`);
  console.log(`  package.json ${packageJsonPath} (${mark(!!options.packageJson)})`);
  console.log(`  example      ${examplePath ?? "(none)"} (${mark(!!options.example)})`);
  if (options.config) {
    const overrides = Object.keys(userConfig).filter(
      (k) => Array.isArray((userConfig as Record<string, unknown>)[k]),
    );
    console.log(
      `  config       ${options.config} (overrides: ${overrides.length ? overrides.join(", ") : "none"})`,
    );
  }

  if (options.dryRun) {
    console.log("\n--dry-run: no files written.");
    return;
  }

  let docs: Record<string, string>;

  if (type === "extension") {
    let extensionInfo: ExtensionInfo;
    if (examplePath) {
      extensionInfo = getExtensionInfoAndExamples(source, mainNode as ts.ClassDeclaration, examplePath);
    } else {
      extensionInfo = getExtensionInfo(source, mainNode as ts.ClassDeclaration);
    }

    extensionInfo.version = packageJsonInfo.version;

    docs = getExtensionDocs(extensionInfo, userConfig.extension);
  } else if (type === "plugin") {
    let pluginInfo: PluginInfo;
    if (examplePath) {
      pluginInfo = getPluginInfoAndExamples(source, mainNode as ts.ClassDeclaration, examplePath);
    } else {
      pluginInfo = getPluginInfo(source, mainNode as ts.ClassDeclaration);
    }

    pluginInfo.version = packageJsonInfo.version;

    docs = getPluginDocs(pluginInfo, userConfig.plugin);
  } else if (type === "timeline") {
    let timelineInfo: TimelineInfo;
    if (examplePath) {
      timelineInfo = getTimelineInfoAndExamples(sourcePath, examplePath);
    } else {
      timelineInfo = getTimelineInfo(sourcePath);
    }

    timelineInfo.name = packageJsonInfo.name;
    timelineInfo.description = packageJsonInfo.description;
    timelineInfo.version = packageJsonInfo.version;

    docs = getTimelineDocs(timelineInfo, userConfig.timeline);
  } else {
    throw new Error("Unrecognized package type.");
  }

  const rawContent = Object.values(docs).join("\n\n");
  if (!fs.existsSync(destPath)) {
    fs.writeFileSync(destPath, rawContent, "utf8");
  } else {
    const existingContent = fs.readFileSync(destPath, "utf8");
    if (existingContent.trim() === "") {
      fs.writeFileSync(destPath, rawContent, "utf8");
    } else {
      const updatedContent = updateDocSections(existingContent, docs);
      fs.writeFileSync(destPath, updatedContent, "utf8");
    }
  }
}

const program = new Command();

program
  .name("autodoc")
  .description("CLI tool to generate documentation for jsPsych plugins")
  .version(version)
  .option("--source <name>", "Source of the package (optional, auto-detected from src/index.ts or index.ts)")
  .option("--dest <name>", "Destination file for the generated documentation (optional, auto-detected from the package's docs)")
  .option("--repo <name>", "Repository that contains the source/destination files (optional)")
  .option("--example <name>", "Example folder containing usages of the plugin (optional, auto-detected from examples/)")
  .option(
    "--package-json <name>",
    "Path to the package.json to read name/description/version from (optional, auto-detected from the package root)",
  )
  .option("--dry-run", "Print the resolved source/dest/example paths and exit without writing (optional)")
  .option(
    "--config <path>",
    "Path to a JS config module whose default export provides custom section templates that fully replace the defaults (optional)",
  )
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
  $ autodoc                                  # run inside a package; everything auto-detected
  $ autodoc --dry-run                        # preview what would be resolved, write nothing
  $ autodoc --source src/index.ts --dest docs/index.md
  $ autodoc --source src/index.ts --dest docs/index.md --example examples/
  $ autodoc --config autodoc.config.js          # custom section templates`,
  );

program.parse();
const options = program.opts<CliOptions>();
main(options).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

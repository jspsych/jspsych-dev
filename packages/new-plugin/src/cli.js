#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { input, select } from "@inquirer/prompts";
import { deleteSync } from "del";
import { dest, series, src } from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import { simpleGit } from "simple-git";

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getRepoRoot() {
  try {
    const rootDir = await git.revparse(["--show-toplevel"]);
    return rootDir;
  } catch (error) {
    console.error("Not a git repository or no repository root found.");
    return "";
  }
}

async function getRemoteGitRootUrl() {
  try {
    const remotes = await git.getRemotes(true);
    const originRemote = remotes.find((remote) => remote.name === "origin");
    if (originRemote) {
      let remoteGitRootUrl = originRemote.refs.fetch;
      if (remoteGitRootUrl.startsWith("git@github.com:")) {
        remoteGitRootUrl = remoteGitRootUrl.replace("git@github.com:", "git+https://github.com/");
      }
      return remoteGitRootUrl;
    }
    console.warn("No remote named 'origin' found.");
    return "";
  } catch (error) {
    console.error("Error getting remote root Git URL:", error);
    return "";
  }
}

async function getRemoteGitUrl() {
  let remoteGitUrl;
  const remoteGitRootUrl = await getRemoteGitRootUrl();
  const repoRoot = await getRepoRoot();
  if (repoRoot) {
    const currentDir = process.cwd();
    const relativePath = path.relative(repoRoot, currentDir);
    if (relativePath) {
      remoteGitUrl = `${remoteGitRootUrl}/tree/main/${relativePath}`;
    }
    return remoteGitUrl;
  }
  console.warn("No Git repository root found.");
  return "";
}

async function getGitHttpsUrl(gitUrl) {
  gitUrl = await gitUrl;
  gitUrl = gitUrl.replace("git+", "");
  gitUrl = gitUrl.replace(".git", "");
  return gitUrl;
}

function getHyphenateName(input) {
  return input
    .trim()
    .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
    .replace(/[^\w-]/g, "") // Remove all non-word characters
    .toLowerCase();
}

function getCamelCaseName(input) {
  return (
    input.charAt(0).toUpperCase() + input.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  );
}

async function getCwdInfo() {
  let isContribRepo;
  // Check if current directory is the jspsych-contrib repository
  if (await git.checkIsRepo()) {
    const remotes = await git.getRemotes(true);
    isContribRepo = remotes.some((remote) =>
      remote.refs.fetch.includes("git@github.com:jspsych/jspsych-contrib.git")
    );
    if (isContribRepo) {
      return {
        isContribRepo: isContribRepo,
        destDir: path.join(await getRepoRoot(), "packages"),
      };
    }
  }
  // If current directory is not the jspsych-contrib repository
  return {
    isContribRepo: false,
    destDir: process.cwd(),
  };
}

async function runPrompts(cwdInfo) {
  const name = await input({
    message: "Enter the name you would like this plugin package to be called:",
    required: true,
    transformer: (input) => {
      return getHyphenateName(input);
    },
    validate: (input) => {
      const packagePath = `${cwdInfo.destDir}/plugin-${getHyphenateName(input)}`;
      if (fs.existsSync(packagePath)) {
        return "A plugin package with this name already exists in this directory. Please choose a different name.";
      } else {
        return true;
      }
    },
  });

  const description = await input({
    message: "Enter a brief description of this plugin package:",
    required: true,
  });

  const author = await input({
    message: "Enter the name of the author of this plugin package:",
    required: true,
  });

  const authorUrl = await input({
    message: "Enter a profile URL for the author, e.g. a link to their GitHub profile [Optional]:",
  });

  const language = await select({
    message: "Choose a language to use for this plugin package:",
    choices: [
      { name: "TypeScript", value: "ts" },
      { name: "JavaScript", value: "js" },
    ],
    loop: false,
  });

  // If not in the jspsych-contrib repository, ask for the path to the README.md file
  let readmePath;
  if (!cwdInfo.isContribRepo) {
    readmePath = await input({
      message: "Enter the path to the README.md file for this plugin package [Optional]:",
      default: `${ await getGitHttpsUrl(await getRemoteGitUrl())}/plugin-${name}/README.md`, // '/plugin-${name}/README.md' if not a Git repository
    });
  } else {
    readmePath = `https://github.com/jspsych/jspsych-contrib/packages/plugin-${name}/README.md`;
  }

  return {
    name: name,
    description: description,
    author: author,
    authorUrl: authorUrl,
    language: language,
    readmePath: readmePath,
    destDir: cwdInfo.destDir,
    isContribRepo: cwdInfo.isContribRepo,
  };
}

async function processAnswers(answers) {
  answers.name = getHyphenateName(answers.name);
  const camelCaseName = getCamelCaseName(answers.name);
  const globalName = "jsPsychPlugin" + camelCaseName;
  const packageName = `plugin-${answers.name}`;
  const destPath = path.join(answers.destDir, packageName);
  const npmPackageName = (() => {
    if (answers.isContribRepo) {
      return `@jspsych-contrib/${packageName}`;
    } else {
      return packageName;
    }
  })();

  const templatesDir = path.resolve(__dirname, "../templates");
  let repoRoot = await getRepoRoot();
  let packageDir = answers.isContribRepo
    ? "packages"
    : repoRoot
    ? path.relative(repoRoot, process.cwd())
    : "./";
  const gitRootUrl = await getRemoteGitRootUrl();
  const gitRootHttpsUrl = await getGitHttpsUrl(gitRootUrl);

  function processTemplate() {
    return src(`${templatesDir}/plugin-template-${answers.language}/**/*`)
      .pipe(replace("{npmPackageName}", npmPackageName))
      .pipe(replace("{author}", answers.author))
      .pipe(replace("{authorUrl}", answers.authorUrl))
      .pipe(replace("{description}", answers.description))
      .pipe(replace("_globalName_", globalName))
      .pipe(replace("{globalName}", globalName))
      .pipe(replace("{camelCaseName}", camelCaseName))
      .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
      .pipe(replace("{packageName}", packageName))
      .pipe(replace("{gitRootUrl}", gitRootUrl))
      .pipe(replace("{gitRootHttpsUrl}", gitRootHttpsUrl))
      .pipe(replace("{documentationUrl}", answers.readmePath))
      .pipe(replace("{packageDir}", packageDir))
      .pipe(dest(destPath));
  }

  function renameExampleTemplate() {
    return src(`${destPath}/examples/index.html`)
      .pipe(replace("{globalName}", globalName))
      .pipe(
        replace(
          "{publishingComment}\n",
          answers.isContribRepo
            ? // prettier-ignore
              `<!-- Once this plugin package is published, it can be loaded via\n<script src="https://unpkg.com/@jspsych-contrib/${packageName}"></script>\n<script src="../dist/index.global.js"></script> -->\n`
            : `<!-- Load the published plugin package here, e.g.\n<script src="https://unpkg.com/${packageName}"></script>\n<script src="../dist/index.global.js"></script> -->\n`
        )
      )
      .pipe(dest(`${destPath}/examples`));
  }

  function renameDocsTemplate() {
    return src(`${destPath}/docs/docs-template.md`)
      .pipe(rename(`${packageName}.md`))
      .pipe(
        replace(
          "## Install",
          answers.isContribRepo
            ? // prettier-ignore
              `## Install\n\nUsing the CDN-hosted JavaScript file:\n\n\`\`\`js\n<script src="https://unpkg.com/@jspsych-contrib/${packageName}"></script>\n\`\`\`\n\nUsing the JavaScript file downloaded from a GitHub release dist archive:\n\n\`\`\`js\n<script src="jspsych/${packageName}.js"></script>\n\`\`\`\n\nUsing NPM:\n\n\`\`\`\nnpm install ${npmPackageName}\n\`\`\`\n\n\`\`\`js\nimport ${camelCaseName} from "${npmPackageName}";\n\`\`\`\n`
            : "## Install\n\n*Enter instructions for installing the plugin package here.*"
        )
      )
      .pipe(dest(`${destPath}/docs`))
      .on("end", function () {
        deleteSync(`${destPath}/docs/docs-template.md`, { force: true });
      });
  }

  function renameReadmeTemplate() {
    return src(`${destPath}/README.md`)
      .pipe(replace(`{npmPackageName}`, npmPackageName))
      .pipe(
        replace(
          `{authorInfo}`,
          answers.authorUrl ? `[${answers.author}](${answers.authorUrl})` : `${answers.author}`
        )
      )
      .pipe(
        replace(
          `## Loading`,
          answers.isContribRepo
            ? // prettier-ignore
              answers.language == "ts"
              ? // prettier-ignore
                `## Loading\n\n### In browser\n\n\`\`\`html\n<script src="https://unpkg.com/@jspsych-contrib/${packageName}">\n\`\`\`\n\n### Via NPM\n\n\`\`\`\nnpm install ${npmPackageName}\n\`\`\`\n\n\`\`\`js\nimport ${globalName} from "${packageName}";\n\`\`\``
              : `## Loading\n\n### In browser\n\n\`\`\`html\n<script src="https://unpkg.com/@jspsych-contrib/${packageName}">\n\`\`\`\n\n### Via NPM\n\n\`\`\`\nnpm install ${npmPackageName}\n\`\`\``
            : `## Loading\n\n*Enter instructions for loading the plugin package here.*`
        )
      )
      .pipe(dest(destPath));
  }

  series(processTemplate, renameExampleTemplate, renameDocsTemplate, renameReadmeTemplate)();
}

const cwdInfo = await getCwdInfo();
const answers = await runPrompts(cwdInfo);
await processAnswers(answers);

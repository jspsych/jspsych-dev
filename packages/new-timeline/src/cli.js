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

function getGitHttpsUrl(gitUrl) {
  gitUrl = gitUrl.replace("git+", "");
  gitUrl = gitUrl.replace(".git", "");
  return gitUrl;
}

function hyphenateName(input) {
  return input
    .trim()
    .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
    .replace(/[^\w-]/g, "") // Remove all non-word characters
    .toLowerCase();
}

function camelCaseName(input) {
  return (
    input.charAt(0).toUpperCase() + input.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  );
}

async function getCwdInfo() {
  // If current directory is the jspsych-timelines repository
  if (await git.checkIsRepo()) {
    const remotes = await git.getRemotes(true);
    return {
      isTimelinesRepo: remotes.some((remote) =>
        remote.refs.fetch.includes("git@github.com:jspsych/jspsych-timelines.git")
      ),
      destDir: path.join(await getRepoRoot(), "packages"),
    };
  }
  // If current directory is not the jspsych-timelines repository
  else {
    return {
      isTimelinesRepo: false,
      destDir: process.cwd(),
    };
  }
}

async function runPrompts(cwdInfo) {
  const name = await input({
    message: "Enter the name you would like this timeline package to be called:",
    required: true,
    transformer: (input) => {
      return hyphenateName(input);
    },
    validate: (input) => {
      const packagePath = `${cwdInfo.destDir}/timeline-${hyphenateName(input)}`;
      if (fs.existsSync(packagePath)) {
        return "A timeline package with this name already exists in this directory. Please choose a different name.";
      } else {
        return true;
      }
    },
  });

  const description = await input({
    message: "Enter a brief description of this timeline package:",
    required: true,
  });

  const author = await input({
    message: "Enter the name of the author of this timeline package:",
    required: true,
  });

  const authorUrl = await input({
    message: `Enter a profile URL for the author, e.g. a link to their GitHub profile [Optional]:`,
  });

  const language = await select({
    message: "What language would you like to use for your timeline package?",
    choices: [
      { name: "TypeScript", value: "ts" },
      { name: "JavaScript", value: "js" },
    ],
    loop: false,
  });

  // If not in the jspsych-timelines repository, ask for the path to the README.md file
  let readmePath;
  if (!cwdInfo.isTimelinesRepo) {
    readmePath = await input({
      message: "Enter the path to the README.md file for this timeline package [Optional]:",
      default: `${getGitHttpsUrl(await getRemoteGitUrl())}/timeline-${name}/README.md`, // '/timeline-${name}/README.md' if not a Git repository
    });
  } else {
    readmePath = `https://github.com/jspsych/jspsych-timelines/packages/timeline-${name}/README.md`;
  }

  return {
    name: name,
    description: description,
    author: author,
    authorUrl: authorUrl,
    language: language,
    readmePath: readmePath,
    destDir: cwdInfo.destDir,
    isTimelinesRepo: cwdInfo.isTimelinesRepo,
  };
}

async function processAnswers(answers) {
  answers.name = hyphenateName(answers.name);
  const globalName = "jsPsychTimeline" + camelCaseName(answers.name);
  const packageName = `timeline-${answers.name}`;
  const destPath = path.join(answers.destDir, packageName);
  const npmPackageName = (() => {
    if (answers.isTimelinesRepo) {
      return `@jspsych-timelines/${packageName}`;
    } else {
      return packageName;
    }
  })();

  const templatesDir = path.resolve(__dirname, "../templates");
  const gitRootUrl = await getRemoteGitRootUrl();
  const gitRootHttpsUrl = getGitHttpsUrl(gitRootUrl);

  function processTemplate() {
    return src(`${templatesDir}/timeline-template-${answers.language}/**/*`)
      .pipe(replace("{name}", `timeline-${answers.name}`))
      .pipe(replace("{npmPackageName}", npmPackageName))
      .pipe(replace("{author}", answers.author))
      .pipe(replace("{authorUrl}", answers.authorUrl))
      .pipe(replace("{description}", answers.description))
      .pipe(replace("_globalName_", globalName))
      .pipe(replace("{globalName}", globalName))
      .pipe(replace("{camelCaseName}", camelCaseName))
      .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
      .pipe(replace("{packageName}", packageName))
      .pipe(replace("{gitRootUrl}", gitRootUrl))
      .pipe(replace("{gitRootHttpsUrl}", gitRootHttpsUrl))
      .pipe(replace("{documentationUrl}", answers.readmePath))
      .pipe(dest(destPath));
  }

  function renameExampleTemplate() {
    return src(`${destPath}/examples/index.html`)
      .pipe(replace("{globalName}", globalName))
      .pipe(
        replace(
          "{publishingComment}\n",
          answers.isTimelinesRepo
            ? // prettier-ignore
              '<!-- Once this timeline package is published, it can be loaded via\n<script src="https://unpkg.com/@jspsych-timelines/{packageName}"></script> -->\n'
            : ""
        )
      )
      .pipe(replace("{packageName}", packageName))
      .pipe(dest(`${destPath}/examples`));
  }

  function renameDocsTemplate() {
    return src(`${destPath}/docs/docs-template.md`)
      .pipe(rename(`timeline-${answers.name}.md`))
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
          answers.isTimelinesRepo
            ? // prettier-ignore
              '## Loading\n\n### In browser\n\n```html\n<script src="https://unpkg.com/@jspsych-timelines/{packageName}">\n```\n\n### Via NPM\n\n```\nnpm install @jspsych-timelines/{name}\n```\n\n```js\nimport { createTimeline, timelineUnits, utils } from "@jspsych-timelines/{packageName}"\n```'
            : `## Loading`
        )
      )
      .pipe(replace('{packageName}', packageName))
      .pipe(dest(destPath));
  }

  series(processTemplate, renameExampleTemplate, renameDocsTemplate, renameReadmeTemplate)();
}

const cwdInfo = await getCwdInfo();
const answers = await runPrompts(cwdInfo);
await processAnswers(answers);

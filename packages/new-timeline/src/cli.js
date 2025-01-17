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

function formatName(input) {
  return input
    .trim()
    .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
    .replace(/[^\w-]/g, "") // Remove all non-word characters
    .toLowerCase();
}

async function getRepoRoot() {
  try {
    const rootDir = await git.revparse(['--show-toplevel']);
    return rootDir;
  } catch (error) {
    console.error("Not a git repository or no repository root found.");
    return null;
  }
}

async function runPrompts() {
  let isGitRepo = await git.checkIsRepo();
  let isTimelinesRepo = false;
  if (isGitRepo) {
    isTimelinesRepo = await git.getRemotes(true).then(remotes => {
      return remotes.some(remote => remote.refs.fetch.includes('git@github.com:jspsych/jspsych-timelines.git'));
    });
  }

  let destDir = isTimelinesRepo ? path.join(await getRepoRoot(), 'packages') : process.cwd();

  const name = await input({
    message: "What do you want to call this timeline package?",
    required: true,
    transformer: (input) => {
      return formatName(input);
    },
    validate: (input) => {
      const fullpackageFilename = `${destDir}/timeline-${formatName(input)}`;
      if (fs.existsSync(fullpackageFilename)) {
        return "A timeline package with this name already exists. Please choose a different name.";
      } else {
        return true;
      }
    },
  });

  const description = await input({
    message: "Enter a brief description of the timeline",
    required: true,
  });

  const author = await input({
    message: "Who is the author of this timeline?",
    required: true,
  });

  const authorUrl = await input({
    message: `Enter a profile URL for the author, e.g. a link to a GitHub profile [Optional]:`,
  });

  const language = await select({
    message: "What language do you want to use?",
    choices: [
      {
        name: "TypeScript",
        value: "ts",
      },
      {
        name: "JavaScript",
        value: "js",
      }
    ],
    loop: false,
  });

  let readmePath = "";
  if (!isTimelinesRepo) {
    readmePath = await input({
      message: "Enter the path to the README.md file for this timeline package [Optional]:",
      default: `${destDir}/${name}/README.md`
    });
  }

  return {
    isTimelinesRepo: isTimelinesRepo,
    destDir: destDir,
    name: name,
    description: description,
    author: author,
    authorUrl: authorUrl,
    language: language,
    readmePath: readmePath
  };
}

async function processAnswers(answers) {
  answers.name = formatName(answers.name);
  const camelCaseName =
    answers.name.charAt(0).toUpperCase() +
    answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

  const globalName = "jsPsychTimeline" + camelCaseName;
  const packageFilename = `timeline-${answers.name}`;
  const destPath = path.join(answers.destDir, packageFilename);
  const readmePath = (() => {
    if (answers.isTimelinesRepo) {
      return `https://github.com/jspsych/jspsych-timelines/packages/${answers.name}/README.md`
    }
    else {
      return answers.readmePath;
    }
  })();

  const templatesDir = path.resolve(__dirname, "../templates");

  function processTemplate() {
    return src(`${templatesDir}/timeline-template-${answers.language}/**/*`)
      .pipe(replace("{name}", answers.name))
      .pipe(replace("{full name}", packageFilename))
      .pipe(replace("{description}", answers.description))
      .pipe(replace("{author}", answers.author))
      .pipe(replace("{authorUrl}", answers.authorUrl))
      .pipe(replace("_globalName_", globalName))
      .pipe(replace("{globalName}", globalName))
      .pipe(replace("{camelCaseName}", camelCaseName))
      .pipe(replace("ExtensionNameExtension", `${camelCaseName}Extension`))
      .pipe(replace("{documentation-url}", readmePath))
      .pipe(dest(destPath));
  }

  function renameExampleTemplate() {
    return src(`${destPath}/examples/index.html`)
      .pipe(replace("{name}", answers.name))
      .pipe(replace("{globalName}", globalName))
      .pipe(dest(`${destPath}/examples`));
  }

  function renameDocsTemplate() {
    return src(`${destPath}/docs/docs-template.md`)
      .pipe(rename(`${answers.name}.md`))
      .pipe(dest(`${destPath}/docs`))
      .on("end", function () {
        deleteSync(`${destPath}/docs/docs-template.md`, { force: true });
      });
  }

  function renameReadmeTemplate() {
    return src(`${destPath}/README.md`)
        .pipe(
            replace(
                `{authorInfo}`,
                answers.authorUrl ? `[${answers.author}](${answers.authorUrl})` : `${answers.author}`
            )
        )
        .pipe(dest(destPath));
}

  series(processTemplate, renameExampleTemplate, renameDocsTemplate, renameReadmeTemplate)();
}

const answers = await runPrompts();
await processAnswers(answers);

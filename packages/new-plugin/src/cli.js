#!/usr/bin/env node

import fs, { read } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { input, select } from "@inquirer/prompts";
import fileSelector from 'inquirer-file-selector'
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
    let isContrib = false;
    if (isGitRepo) {
        isContrib = await git.getRemotes(true).then(remotes => {
            return remotes.some(remote => remote.refs.fetch.includes('git@github.com:jspsych/jspsych-contrib.git'));
        });
    }

    const publishing = await select({
        message: "Where are you planning to publish this plugin package?",
        choices: [
            {
                name: "jspsych-contrib",
                value: "jspsych-contrib",
                disabled: isContrib ? false : "You are not in the jspsych-contrib repository. Please clone the repository and try again there.",
            },
            {
                name: `My own repository ${isGitRepo ? "" : "(You are not currently in a git repository)"} `,
                value: "my-own-repository",
            },
            {
                name: "Not publishing",
                value: "not-publishing",
            }
        ],
        loop: false,
    });

    let destDir;
    if (publishing != "jspsych-contrib") {
        destDir = await fileSelector({
            message: "Where would you like to save this plugin package?",
            required: true,
            type: 'directory',
            loop: false
        })
    }
    else {
        const repoRoot = await getRepoRoot(); // repoRoot should be confirmed to be the root of the jspsych-contrib repository at this point
        destDir = path.join(repoRoot, 'packages');
    }

    let readmePath = "";
    if (publishing == "my-own-repository") {
        readmePath = await input({
            message: "Type a repository URL to the README file for your plugin package [Optional]:"
        });
    }

    const name = await input({
        message: "What would you like to call this plugin package?",
        required: true,
        transformer: (input) => {
            // convert to hyphen case
            return formatName(input);
        },
        validate: (input) => {
            const fullpackageFilename = `${destDir}/plugin-${formatName(input)}`;
            if (fs.existsSync(fullpackageFilename)) {
                return "A plugin package with this name already exists. Please choose a different name.";
            } else {
                return true;
            }
        },
    });

    const description = await input({
        message: "Enter a brief description of the plugin package:",
        required: true,
    });

    const author = await input({
        message: "What is the name of the author of this plugin package?",
        required: true,
    });

    const authorUrl = await input({
        message: "Enter a profile URL for the author, e.g. a link to a GitHub profile [Optional]:",
    });

    const language = await select({
        message: "What language would you like to use for your plugin?",
        choices: [
            {
                name: "TypeScript",
                value: "ts",
            },
            {
                name: "JavaScript",
                value: "js",
            },
        ],
        loop: false,
    });

    return {
        publishing: publishing,
        destDir: destDir,
        readmePath: readmePath,
        name: name,
        description: description,
        author: author,
        authorUrl: authorUrl,
        language: language
    };
}

async function processAnswers(answers) {
    answers.name = formatName(answers.name);
    const camelCaseName =
        answers.name.charAt(0).toUpperCase() +
        answers.name.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    const globalName = "jsPsych" + camelCaseName;

    const packageFilename = `plugin-${answers.name}`;
    const destPath = path.join(answers.destDir, packageFilename);
    const readMePath = (() => {
        if (answers.publishing == "jspsych-contrib") {
            return `https://github.com/jspsych/jspsych-contrib/packages/${packageFilename}/README.md`;
        }
        else if (answers.publishing == "my-own-repository") {
            return answers.readmePath;
        }
    })()

    const templatesDir = path.resolve(__dirname, '../templates');

    function processTemplate() {
        return src(`${templatesDir}/plugin-template-${answers.language}/**/*`)
            .pipe(replace("{name}", answers.name))
            .pipe(replace("{full-name}", packageFilename))
            .pipe(replace("{author}", answers.author))
            .pipe(replace("{description}", answers.description))
            .pipe(replace("{authorUrl}", answers.authorUrl))
            .pipe(replace("_globalName_", globalName))
            .pipe(replace("{globalName}", globalName))
            .pipe(replace("{camelCaseName}", camelCaseName))
            .pipe(replace("PluginNamePlugin", `${camelCaseName}Plugin`))
            .pipe(replace("{documentation-url}", readMePath))
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

    // TODO: citation file
    // TODO: location of file
}

const answers = await runPrompts();
await processAnswers(answers);

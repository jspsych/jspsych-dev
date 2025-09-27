#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { input, select } from "@inquirer/prompts";
import { Command } from "commander";
import { deleteSync } from "del";
import { dest, series, src } from "gulp";
import rename from "gulp-rename";
import replace from "gulp-replace";
import { simpleGit } from "simple-git";

const git = simpleGit();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const { version } = packageJson;

async function getRepoRoot() {
  try {
    const rootDir = await git.revparse(["--show-toplevel"]);
    return rootDir;
  } catch (error) {
    return "";
  }
}

async function getRemoteGitRootUrl() {
  if (await git.checkIsRepo()) {
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
  return "";
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
  return "";
}

function getGitHttpsUrl(gitUrl) {
  if (!gitUrl || typeof gitUrl !== 'string') {
    return '';
  }
  
  let httpsUrl = gitUrl.trim();

  // Handle git+https:// format
  httpsUrl = httpsUrl.replace(/^git\+https:\/\//, 'https://');
  
  // Handle git:// format
  httpsUrl = httpsUrl.replace(/^git:\/\/(.+)$/, 'https://$1');
  
  // Handle ssh://git@host.com/user/repo format
  httpsUrl = httpsUrl.replace(/^ssh:\/\/git@([^\/]+)\/(.+)$/, 'https://$1/$2');
  
  // Handle git@github.com:user/repo format (standard SSH URL format)
  httpsUrl = httpsUrl.replace(/^git@([^:]+):(.+)$/, 'https://$1/$2');
  
  // Remove trailing .git
  httpsUrl = httpsUrl.replace(/\.git$/, '');

  return httpsUrl;
}

function getHyphenateName(input) {
  return input
    .trim()
    .replace(/[\s_]+/g, "-") // Replace all spaces and underscores with hyphens
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Replace camelCase with hyphens
    .replace(/[^a-zA-Z0-9-]/g, "") // Remove all non-alphanumeric characters
    .toLowerCase();
}

function getCamelCaseName(input) {
  input = input.charAt(0).toUpperCase() + input.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  input = input.replace(/[^a-zA-Z0-9]/g, "") // Remove all non-alphanumeric characters
  return input;
}

async function detectContribRepo() {
  const repoRoot = await getRepoRoot();
  if (repoRoot) {
    const packageJsonPath = path.join(repoRoot, "package.json");

    // If package.json doesn't exist at the root, it cannot be the contrib repo.
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    // If package.json exists, try to read and parse it.
    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageJsonContent);
      return packageJson.name === "@jspsych/jspsych-contrib";
    } catch (error) {
      // Log an error if reading or parsing an existing package.json fails.
      console.error("Error reading or parsing package.json:", error);
      return false;
    }
  }
  // Return false if not in a git repo or repoRoot couldn't be determined.
  return false;
}

async function getCwdInfo() {
  const isRepo = await git.checkIsRepo();
  let isContribRepo;
  // Check if current directory is the jspsych-contrib repository
  if (isRepo) {
    isContribRepo = await detectContribRepo();
    if (isContribRepo) {
      return {
        isRepo: isRepo,
        isContribRepo: isContribRepo,
        destDir: path.join(await getRepoRoot(), "packages"),
      };
    }
  }
  // If current directory is not the jspsych-contrib repository
  return {
    isRepo: isRepo,
    isContribRepo: false,
    destDir: process.cwd(),
  };
}

async function runPrompts(cwdInfo) {
  const name = await input({
    message: "Enter the name you would like this extension package to be called:",
    required: true,
    validate: (input) => {
      const packagePath = `${cwdInfo.destDir}/extension-${getHyphenateName(input)}`;
      if (fs.existsSync(packagePath)) {
        return "An extension package with this name already exists in this directory. Please choose a different name.";
      } else {
        return true;
      }
    },
  });

  const description = await input({
    message: "Enter a brief description of this extension package:",
    required: true,
  });

  const author = await input({
    message: "Enter the name of the author of this extension package:",
    required: true,
  });

  const authorUrl = await input({
    message: "Enter a profile URL for the author, e.g. a link to their GitHub profile [Optional]:",
  });

  const language = await select({
    message: "Choose a language to use for this extension package:",
    choices: [
      { name: "TypeScript", value: "ts" },
      { name: "JavaScript", value: "js" },
    ],
    loop: false,
  });

  // If not in the jspsych-contrib repository, ask for the path to the README.md file
  let readmePath;
  if (!cwdInfo.isContribRepo) {
    const remoteGitUrl = await getRemoteGitUrl();
    readmePath = await input({
      message: "Enter the path to the README.md file for this extension package [Optional]:",
      default: `${getGitHttpsUrl(remoteGitUrl)}/extension-${getHyphenateName(name)}/README.md`, // '/extension-${name}/README.md' if not a Git repository
    });
  } else {
    readmePath = `https://github.com/jspsych/jspsych-contrib/packages/extension-${getHyphenateName(name)}/README.md`;
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
  Object.keys(answers).forEach((key) => {
    if (typeof answers[key] === "string" && key != "language") {
      answers[key] = JSON.stringify(answers[key]); // Properly escape for JSON
      answers[key] = answers[key].slice(1, -1); // Remove outer quotes
    }
  })
  answers.name = getHyphenateName(answers.name);
  const camelCaseName = getCamelCaseName(answers.name);
  const globalName = "jsPsychExtension" + camelCaseName;
  const packageName = `extension-${answers.name}`;
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
  const gitRootHttpsUrl = getGitHttpsUrl(gitRootUrl);

  function processTemplate() {
    return src(`${templatesDir}/extension-template-${answers.language}/**/*`)
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
              `<!-- Once this extension package is published, it can be loaded via\n<script src="https://unpkg.com/@jspsych-contrib/${packageName}"></script>\n<script src="../dist/index.global.js"></script> -->\n`
            : `<!-- Load the published extension package here, e.g.\n<script src="https://unpkg.com/${packageName}"></script>\n<script src="../dist/index.global.js"></script> -->\n`
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
            : "## Install\n\n*Enter instructions for installing the extension package here.*"
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
            : `## Loading\n\n*Enter instructions for loading the extension package here.*`
        )
      )
      .pipe(dest(destPath));
  }

  series(processTemplate, renameExampleTemplate, renameDocsTemplate, renameReadmeTemplate)();
}

async function runWithArgs(cwdInfo, options) {
  // Check if package already exists
  const packagePath = `${cwdInfo.destDir}/extension-${getHyphenateName(options.name)}`;
  if (fs.existsSync(packagePath)) {
    console.error(`Error: An extension package with this name already exists in this directory: ${packagePath}`);
    process.exit(1);
  }

  // Set defaults and calculate derived values
  const name = options.name;
  const language = options.language || 'ts';
  
  let readmePath = options.readmePath;
  if (!readmePath) {
    if (!cwdInfo.isContribRepo) {
      const remoteGitUrl = await getRemoteGitUrl();
      readmePath = `${getGitHttpsUrl(remoteGitUrl)}/extension-${getHyphenateName(name)}/README.md`;
    } else {
      readmePath = `https://github.com/jspsych/jspsych-contrib/packages/extension-${getHyphenateName(name)}/README.md`;
    }
  }

  return {
    name: name,
    description: options.description,
    author: options.author,
    authorUrl: options.authorUrl || '',
    language: language,
    readmePath: readmePath,
    destDir: cwdInfo.destDir,
    isContribRepo: cwdInfo.isContribRepo,
  };
}

// Set up Commander.js
const program = new Command();

program
  .name('new-extension')
  .description('Creates a new jsPsych extension package')
  .version(version)
  .option('--name <name>', 'Name of the extension package (required)')
  .option('--description <description>', 'Brief description of the extension package (required)')
  .option('--author <author>', 'Name of the author (required)')
  .option('--author-url <url>', 'Profile URL for the author (optional)')
  .option('--language <lang>', 'Language to use: ts or js (default: ts)', 'ts')
  .option('--readme-path <path>', 'Path to README.md file (optional)')
  .addHelpText('after', `

Examples:
  $ new-extension --name "my-extension" --description "My awesome extension" --author "John Doe"
  $ new-extension --name "my-extension" --description "My extension" --author "John Doe" --language js`)
  .action((options) => {
    // This action will only run if we have arguments provided
    return main(options, true); // true = non-interactive mode
  });

async function main(options, isNonInteractive = false) {
  const cwdInfo = await getCwdInfo();
  
  let answers;
  if (isNonInteractive) {
    // Validate required options
    if (!options.name) {
      console.error('Error: --name is required');
      process.exit(1);
    }
    if (!options.description) {
      console.error('Error: --description is required');
      process.exit(1);
    }
    if (!options.author) {
      console.error('Error: --author is required');
      process.exit(1);
    }
    
    // Validate language
    if (options.language && !['ts', 'js'].includes(options.language)) {
      console.error('Error: --language must be either "ts" or "js"');
      process.exit(1);
    }
    
    // Non-interactive mode
    answers = await runWithArgs(cwdInfo, options);
  } else {
    // Interactive mode (existing behavior)
    answers = await runPrompts(cwdInfo);
  }

  await processAnswers(answers);
}

program.parse();
const options = program.opts();

// Check if we have command line arguments (any option except defaults)
const hasArgs = Object.keys(options).some(key => 
  (key !== 'language' || options[key] !== 'ts') && 
  key !== 'version' && 
  options[key] !== undefined
);

if (!hasArgs) {
  // No arguments provided, run in interactive mode
  await main({}, false);
}

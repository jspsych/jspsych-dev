# @jspsych/new-extension

## 0.2.5

### Patch Changes

- 01719f8: Fix `getGitHttpsUrl` so the `.git` suffix is stripped at any path boundary, not only at the end of the string. Previously, when a repo's `origin` fetch URL ended in `.git`, the suggested README/docs default in stand-alone mode kept `.git` in the middle of the URL (e.g. `https://github.com/user/repo.git/tree/main/...`), producing a broken link. Also resolve the git repo root once per run in `getCwdInfo` instead of spawning `git` an extra time.

## 0.2.4

### Patch Changes

- b430035: Fix the JavaScript template build so generated packages build out of the box:

  - Add the Babel toolchain (`@babel/cli`, `@babel/core`, `@babel/preset-env`, `babel-preset-minify`) to the JS templates' `devDependencies`. The `build` script invokes `babel` but none of these were installed, so `npm run build` failed with a "babel not found" error after a fresh `npm install`.
  - Point the `build` script at `src/index.js` (where the source actually lives) instead of a non-existent `index.js` at the package root, which previously caused `babel: index.js does not exist`.
  - Update the `files` array to publish `src` instead of the non-existent `index.js`, matching the TypeScript templates.

## 0.2.3

### Patch Changes

- f7454a7: Fix several defects in the generated scaffold:

  - CITATION.cff no longer stuffs the full author name into the `family-names`, `given-names`, and `name-particle` fields, and no longer leaves unsubstituted `{email}`/`{softwareUrl}`/`{title}` placeholders. These are now clean fill-in fields (new-plugin and new-extension).
  - The generated README "Loading" snippet now imports from the scoped npm package name (e.g. `@jspsych-contrib/plugin-x`) and closes the in-browser `<script>` tag (new-plugin and new-extension).
  - The example `index.html` now loads the local build as a live `<script>` instead of leaving it commented out inside the "once published" block, so examples work out of the box.
  - new-timeline now builds the browser bundle as `dist/index.browser.min.js` (via a `tsup.config.ts`) to match the `unpkg` field and the other packages, instead of `dist/index.global.js`.
  - Generated packages now include a `.gitignore` (ignoring `dist/` and `node_modules/`). The template ships as `gitignore` and is renamed during scaffolding to avoid npm rewriting it to `.npmignore` on publish.

## 0.2.2

### Patch Changes

- b14f29e: Fix inconsistent IIFE package naming and redundant plugin global name prefix. Plugins now generate global names as `jsPsych{PackageName}` instead of `jsPsychPlugin{PackageName}`. All templates and CLI-generated comments now consistently reference `index.browser.js` instead of `index.global.js`.

## 0.2.1

### Patch Changes

- 7aa0ca8: Fix CLI tools entering non-interactive mode incorrectly when run without arguments

## 0.2.0

### Minor Changes

- 41e0a32: Add non-interactive mode with command-line arguments using Commander.js

## 0.1.5

### Patch Changes

- 3a0568c: Change the strategy for detecting when commands are run inside the official repos

## 0.1.4

### Patch Changes

- 4ae65d7: Fix remote detection for new-plugin and new-extension.

## 0.1.3

### Patch Changes

- 297193f: This patch properly escapes special characters in the user input for injection into the generated files. This patch also removes any string replacement enforcings during user input, processing the input strings in the backend after all prompts have been answered.

## 0.1.2

### Patch Changes

- 64776d9: This patch hides the error logging when using the cli tool in a non-git repo.

## 0.1.1

### Patch Changes

- ec57500: This patch fixes the getGitHttpsUrl(await getRemoteGitUrl()) call in cli.js of the new-plugin, new-extension and new-timeline packages so that this line does not crash from calling getGitHttpsUrl() on a promise.

## 0.1.0

### Minor Changes

- b8f6266: Updates @jspsych/config to 3.2.2. This is the first beta release of the tools.

## 0.0.3

### Patch Changes

- c9634aa: This release standardizes the code across all three cli tools -- new-plugin, new-extension and new-timeline. Each cli tool has been tested by running in private repositories, the jspsych-contrib repository and the jspsych-timelines repository respectively.

## 0.0.2

### Patch Changes

- 80d83bf: This patch adds documentation for jspsych-dev and the new-plugin tool; adds the new-extension tool and new-timeline tool.

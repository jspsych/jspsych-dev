# @jspsych/new-extension

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

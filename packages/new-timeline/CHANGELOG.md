# @jspsych-timelines/new-timeline

## 0.1.4

### Patch Changes

- ca505f7: Fix bug in detecting whether repo has jspsych-timelines as a remote

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

## 0.0.4

### Patch Changes

- c9634aa: This release standardizes the code across all three cli tools -- new-plugin, new-extension and new-timeline. Each cli tool has been tested by running in private repositories, the jspsych-contrib repository and the jspsych-timelines repository respectively.

## 0.0.3

### Patch Changes

- f4ef2d5: This patch adds an executable to the new-timeline package so that it can be run via npx; fixes new-timeline js template to accomodate for non-jspsych-timelines uses.
- 8317d5b: This release publishes the @jspsych/new-timeline package on npm. This is a command line tool for creating jsPsych timelines with provided template code. All prompts have been standardized to be of the form "Enter...:"

## 0.0.2

### Patch Changes

- dbf39bf: This release publishes the @jspsych/new-timeline package on npm. This is a command line tool for creating jsPsych timelines with provided template code.

## 0.2.1

### Patch Changes

- 80d83bf: This patch adds documentation for jspsych-dev and the new-plugin tool; adds the new-extension tool and new-timeline tool.

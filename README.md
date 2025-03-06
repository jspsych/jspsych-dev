# jspsych-dev: Tools & Templates for jsPsych development

This repository is for jsPsych users who would like to develop their own plugins, extensions or shareable timelines (jsPsych experiments). We provide these three tools under the `/packages` folder for each of these purposes:

- [`@jspsych/new-plugin`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-plugin)
- [`@jspsych/new-extension`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-extension)
- [`@jspsych/new-timeline`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-timeline)

Each tool can be run directly using `npx`, e.g. running `npx @jspsych/new-plugin` in the terminal. This will prompt you through the process of creating a new plugin, extension or timeline. The tool will then create a new directory in your current working directory with the appropriate files and names. More detailed instructions can be found in the `README.md` files in each of these packages.

## Choosing TypeScript vs JavaScript
When you run the tools in this repository, all three will prompt you to choose between using the TypeScript template and the JavaScript template. We outline their different purposes here:

### TypeScript template

This template uses TypeScript source files that are complied into JavaScript using Node.js and npm.
This is the format used for plugins in the main jsPsych repo.
To use this template, you should edit the `src/index.ts` file, keeping the overall structure but changing the details as appropriate (parameters, trial method, etc.).
You can then use the `npm run build` command to compile your `index.ts` code into JavaScript files, which will appear in a `/dist` directory.
This format also allows you to add a Jest test file (optional).

For more details, including setup instructions and detailed explanations of files, please see the jsPsych documentation page: [Configuring the jsPsych development environment](https://www.jspsych.org/latest/developers/configuration).
You can also read the [plugin development documentation](https://www.jspsych.org/latest/developers/plugin-development/) and look at the plugin/extension folders in the main jsPsych repository `/packages` directory for more examples.

### JavaScript template

This template allows you to put your plugin's JavaScript code directly into a JavaScript template file, rather than using TypeScript and Node.js/npm. 
To use this template, you should keep the overall structure of the `index.js` file, but change the details as appropriate for your plugin (plugin name, parameters, etc.).
The JavaScript code that runs the trial goes inside the `trial` method for the plugin class.
More information about working with the `index.js` file can be found in the [plugin development documentation](https://www.jspsych.org/latest/developers/plugin-development/).

## Contributing to jspsych-contrib or jspsych-timelines

We welcome contributions from our community!

If you would like to contribute your new plugin/extension/timeline, we highly recommend doing so by publishing your package under the `/packages` folder on one of our two community repositories ⎯ [jspsych-contrib](https://github.com/jspsych/jspsych-contrib) for plugins and extensions, and [jspsych-timelines](https://github.com/jspsych/jspsych-timelines) for timelines. If you plan to do so from the start, you may clone the appropriate community repository, then run the building tool (e.g. `npx @jspsych/new-plugin`) from the command line in your cloned local repository. This will automatically generate the template package under the `/packages` folder in your local repository.

When you are done with customizing your package, you can then open a pull request by pushing your changes onto a separate branch in jspsych-contrib or jspsych-timelines. Your package will then be reviewed by our team for official publishing. When published, your package will show up on the list of contributions on the repository's `README.md`, along with your name hyperlinked to your GitHub URL, if given.

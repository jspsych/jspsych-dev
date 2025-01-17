# Tools & Templates for jsPsych development

This repository is for jsPsych users who would like to develop their own plugins, extensions or shareable timelines (jsPsych experiments). We provide these three packages for each of these purposes:

- [`@jspsych/new-plugin`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-plugin)
- [`@jspsych/new-extension`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-extension)
- [`@jspsych/new-timeline`](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-timeline)

Each package can be run directly using `npx`, e.g. running `npx @jspsych/new-plugin` in the terminal. You will be prompted to enter information for your new plugin package, like the name of your plugin, a description of it, etc. A folder containing template code for your plugin/extension/timeline will then be generated automatically in your current working directory.

## Contributing to jspsych-contrib

We welcome contributions from our community!

If you would like to contribute your new plugin/extension/timeline, we highly recommend doing so by publishing your package on [jspsych-contrib](https://github.com/jspsych/jspsych-contrib) under the [./packages](https://github.com/jspsych/jspsych-contrib/tree/main/packages) folder. If you plan to do so from the start, you may clone the jspsych-contrib library, then run the building tool (e.g. `npx @jspsych/new-plugin`) from the command line in your cloned jspsych-contrib repository. This will automatically generate the template package under the `./packages` folder in your cloned repository. When you are done with customizing your package, you can then open a pull request by pushing your changes onto a separate branch in jspsych-contrib. Your package will then be reviewed by our team for official publishing. When published, your package will show up on the list of contributions in the jspsych-contrib [`README.md`](https://github.com/jspsych/jspsych-contrib/blob/main/README.md), along with your name hyperlinked to your GitHub URL, if given.

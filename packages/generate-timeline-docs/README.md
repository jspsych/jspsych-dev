# `@jspsych-dev/generate-timeline-docs`

This tool allows you to automatically generate documentation for your jsPsych timeline package based on your source script(s), which should be where the main logic of your jsPsych timeline lives, and optionally update your package's `README.md` with the generated documentation. For the tool to properly generate documentation, we recommend writing your source script(s) in a certain way, including following the standardized abstraction/export structure we defined in our [template for new timelines](https://github.com/jspsych/jspsych-dev/tree/main/packages/new-timeline/templates/timeline-template-ts), and writing JSDoc comments in your code to explain what each functional element does. We provide a more detailed guide for how to write your source script(s) to make it friendly to this tool in [this section](#guide-to-writing-comments-to-help-documentation-generation). If you run into errors or issues when using this tool, you can first look for solutions in the [Troubleshooting](#troubleshooting) section as a first step. We also outline existing limitations to the tool in the [Limitations] section. If you need more help or have suggestions/requests for additional documentation, feel free to open a thread on our [discussion board](https://github.com/jspsych/jsPsych/discussions/).

## How to Use
To use this tool, follow these steps:
1. Navigate to the root directory of your timeline package
```bash
cd /path/to/your/package/root/directory
```
2. Run the tool
```bash
npx @jspsych-dev/generate-timeline-docs
```

The tool should then generate documentation based on your source script, which should be where the main logic of your jsPsych timeline lives.

### Command-Line Options


You can customize the documentation generation process with these options:

```bash
npx @jspsych-dev/generate-timeline-docs --skip-cleanup

npx @jspsych-dev/generate-timeline-docs --no-append-readme

npx @jspsych-dev/generate-timeline-docs /path/to/package/directory

npx @jspsych-dev/generate-timeline-docs --help
```

## Guide to Writing Comments to Help Documentation Generation
The tool is intended to be used on timeline packages that follow , but can also be used on a package that does not follow this structure. We outline the tool's limitations when used on such non-standardized timeline packages in [this section](#used-on-a-non-standardized-timeline-package). 

## Troubleshooting

Here are some common errors that may come up when you are using this tool:

| Error | Explanation & Fix |
| ----- | ----------------- |
|No valid entry points found in <package-name>.| The tool uses your package's `src/index.ts` or `src/index.ts` as entry points. If your package does not have either of these files, the tool will exit with this error. If you wish to set different entry points for TypeDoc to generate documentation from, you can add them by navigating to `node_modules/@jspsych-dev/generate-timeline-docs/typedoc.json` and modifying the `entryPoints` field in this file. |





# `@jspsych/new-extension`
This package allows you to start building an extension in any directory by simply running `npx @jspsych/new-extension` from the command line.

You will be prompted to enter a name for your extension, a description, the name of the author, an optional link to the author's GitHub profile, the preferred language (TypeScript or JavaScript) for your extension, and an optional link to a `README.md` file for your extension. Your template package containing boilerplate code will then be automatically generated in your current working directory.

!!! note
    If you are running this command in the jspsych-contrib repository, you will not be prompted to enter a `README.md` link. It will be generated automatically, and your template package will also be automatically generated under the `./packages` folder. In general, if you are planning to publish your extension, we recommend choosing TypeScript as your extension's language, because________________.

In the generated package, you will find a `./docs` folder containing a markdown file for you to fill in technical information about your extension, e.g. additional parameters it takes in and the data it generates. You will also find an `./examples` folder where you can write simple scripts to demonstrate the functionality your extension provides. The file that contains your actual extension code should be the `index.js` file under the `./src` folder. Lastly, we also provide a `package.json` for you to list metadata about your extension so that it can be easily published to a registry like `npm`, a `README.md` and a `CITATION.cff` file. If you plan to publish your extension, we highly recommend filling out the `CITATION.cff` file as it allows your extension's users to easily cite your extension.

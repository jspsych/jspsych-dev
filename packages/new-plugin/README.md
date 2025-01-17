# `@jspsych/new-plugin`
This package allows you to start building a plugin in any directory by simply running `npx @jspsych/new-plugin` from the command line.

You will be prompted to enter a name for your plugin, a description, the name of the author, an optional link to the author's GitHub profile, the preferred language (TypeScript or JavaScript) for your plugin, and an optional link to a `README.md` file for your plugin. Your template package containing boilerplate code will then be automatically generated in your current working directory.

> [!NOTE]
> If you are running this command in the jspsych-contrib repository, you will not be prompted to enter a `README.md` link. It will be generated automatically, and your template package will also be automatically generated under the `./packages` folder.

In the generated package, you will find a `./docs` folder containing a markdown file for you to fill in technical information about your plugin, e.g. additional parameters it takes in and the data it generates. You will also find an `./examples` folder where you can write simple scripts to demonstrate the functionality your plugin provides. The file that contains your actual plugin code should be the `index.js` file under the `./src` folder. Lastly, we also provide a `package.json` for you to list metadata about your plugin so that it can be easily published to a registry like `npm`, a `README.md` and a `CITATION.cff` file. If you plan to publish your plugin, we highly recommend filling out the `CITATION.cff` file as it allows your plugin's users to easily cite your plugin.

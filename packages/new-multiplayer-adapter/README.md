# `@jspsych/new-multiplayer-adapter`

This package lets you start building a [jsPsych multiplayer adapter](https://github.com/jspsych/jsPsych/blob/main/docs/developers/adapter-development.md) by simply running `npx @jspsych/new-multiplayer-adapter` from the command line.

A multiplayer adapter implements jsPsych's `MultiplayerAdapter` interface and is responsible for the network I/O against a specific backend (JATOS group sessions, Firebase, a custom WebSocket server, etc.). Once written, it can be passed to `jsPsych.multiplayer.connect()` and used by any multiplayer plugin.

You will be prompted to enter a name for your adapter, a description, the name of the author, an optional link to the author's GitHub profile, and an optional link to a `README.md` file. A template package containing boilerplate TypeScript code will then be generated in your current working directory.

> [!NOTE]
> If you are running this command inside the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) repository, you will not be prompted to enter a `README.md` link. It will be generated automatically, your package will be created under the `./packages` folder, and it will be named under the `@jspsych-multiplayer` npm scope.

In the generated package you will find a `./src/index.ts` file containing a stub class that implements the `MultiplayerAdapter` interface (`connect`, `push`, `getAll`, `get`, `subscribe`, `disconnect`, and a `participantId`) — fill in the `TODO`s with calls to your backend. You will also find a `./docs` folder for technical documentation, an `./examples` folder for a runnable demo, a `package.json`, a `README.md`, and a `CITATION.cff` file. If you plan to publish your adapter, we highly recommend filling out the `CITATION.cff` file so your adapter's users can easily cite it.

## Usage

```
npx @jspsych/new-multiplayer-adapter
```

You can also run it non-interactively:

```
npx @jspsych/new-multiplayer-adapter --name "my-backend" --description "Adapter for my backend" --author "Jane Doe" --author-url "https://github.com/janedoe"
```

---
"@jspsych/new-plugin": minor
---

Recognize the [jspsych-multiplayer](https://github.com/jspsych/jspsych-multiplayer) repository in addition to jspsych-contrib. Repo detection is now data-driven (a `KNOWN_REPOS` map keyed by the root `package.json` name), so running `npx @jspsych/new-plugin` inside jspsych-multiplayer scaffolds a `@jspsych-multiplayer/plugin-*` package under `./packages`. Behavior inside jspsych-contrib is unchanged.

---
"@jspsych/new-plugin": patch
"@jspsych/new-extension": patch
"@jspsych/new-timeline": patch
---

Fix several defects in the generated scaffold:

- CITATION.cff no longer stuffs the full author name into the `family-names`, `given-names`, and `name-particle` fields, and no longer leaves unsubstituted `{email}`/`{softwareUrl}`/`{title}` placeholders. These are now clean fill-in fields (new-plugin and new-extension).
- The generated README "Loading" snippet now imports from the scoped npm package name (e.g. `@jspsych-contrib/plugin-x`) and closes the in-browser `<script>` tag (new-plugin and new-extension).
- The example `index.html` now loads the local build as a live `<script>` instead of leaving it commented out inside the "once published" block, so examples work out of the box.
- new-timeline now builds the browser bundle as `dist/index.browser.min.js` (via a `tsup.config.ts`) to match the `unpkg` field and the other packages, instead of `dist/index.global.js`.
- Generated packages now include a `.gitignore` (ignoring `dist/` and `node_modules/`). The template ships as `gitignore` and is renamed during scaffolding to avoid npm rewriting it to `.npmignore` on publish.

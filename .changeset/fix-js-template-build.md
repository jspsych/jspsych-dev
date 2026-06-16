---
"@jspsych/new-plugin": patch
"@jspsych/new-extension": patch
"@jspsych/new-timeline": patch
---

Fix the JavaScript template build so generated packages build out of the box:

- Add the Babel toolchain (`@babel/cli`, `@babel/core`, `@babel/preset-env`, `babel-preset-minify`) to the JS templates' `devDependencies`. The `build` script invokes `babel` but none of these were installed, so `npm run build` failed with a "babel not found" error after a fresh `npm install`.
- Point the `build` script at `src/index.js` (where the source actually lives) instead of a non-existent `index.js` at the package root, which previously caused `babel: index.js does not exist`.
- Update the `files` array to publish `src` instead of the non-existent `index.js`, matching the TypeScript templates.

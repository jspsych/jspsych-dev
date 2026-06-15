import { defineConfig } from "tsup";

export default defineConfig([
  {
    // ES module build, consumed via `import` / bundlers
    entry: ["src/index.ts"],
    format: ["esm"],
    outExtension: () => ({ js: ".mjs" }),
    sourcemap: true,
    dts: true,
    treeshake: true,
    clean: true,
  },
  {
    // Minified browser (IIFE) build, exposed on the page as `{globalName}`
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "{globalName}",
    outExtension: () => ({ js: ".browser.min.js" }),
    sourcemap: true,
    treeshake: true,
    minify: true,
  },
]);

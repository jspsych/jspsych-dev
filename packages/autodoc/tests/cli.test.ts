import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { makeTree, removeTree } from "./helpers/tempTree.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const cliPath = path.join(packageRoot, "dist", "cli.js");

const pluginSource = fs.readFileSync(
  path.join(__dirname, "fixtures", "plugin", "basic.ts"),
  "utf-8",
);

// CLI is a built artifact, so we build it once up front and ensure the dist is not stale.
beforeAll(() => {
  execSync("npm run build", { cwd: packageRoot, stdio: "ignore" });
}, 120_000);

const roots: string[] = [];
const tree = (spec: Record<string, string>): string => {
  const root = makeTree(spec);
  roots.push(root);
  return root;
};
afterEach(() => {
  roots.splice(0).forEach(removeTree);
});

interface CliResult {
  status: number;
  stdout: string;
  stderr: string;
}

/** runs the built CLI in `cwd`, capturing status/stdout/stderr without throwing on failure */
function runCli(args: string[], cwd: string): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [cliPath, ...args], {
      cwd,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "" };
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer | string; stderr?: Buffer | string };
    return {
      status: e.status ?? 1,
      stdout: e.stdout?.toString() ?? "",
      stderr: e.stderr?.toString() ?? "",
    };
  }
}

const pkgJson = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    name: "@jspsych/plugin-test",
    description: "A test plugin",
    version: "9.9.9",
    ...overrides,
  });

describe("cli --dry-run", () => {
  it("resolves and reports every input without writing", () => {
    const root = tree({
      "package.json": pkgJson(),
      "src/index.ts": pluginSource,
      "docs/test.md": "",
      "examples/demo.html": "",
    });

    const { status, stdout } = runCli(["--dry-run"], root);

    expect(status).toBe(0);
    expect(stdout).toMatch(/type\s+plugin/);
    expect(stdout).toContain(path.join(root, "src", "index.ts"));
    expect(stdout).toContain(path.join(root, "docs", "test.md"));
    expect(stdout).toContain(path.join(root, "examples"));
    expect(stdout).toContain("no files written");
    // the discovered destination must be untouched
    expect(fs.readFileSync(path.join(root, "docs", "test.md"), "utf-8")).toBe("");
  });

  it("works fully out-of-tree from a non-package cwd without --example", () => {
    // source/dest/package-json explicit; example omitted. bc example discovery
    // is soft, the missing cwd package.json must NOT cause a failure here.
    const pkg = tree({ "package.json": pkgJson(), "src/index.ts": pluginSource });
    const dest = path.join(pkg, "out.md");
    fs.writeFileSync(dest, "");
    const elsewhere = tree({}); // no package.json here

    const { status, stdout } = runCli(
      [
        "--source",
        path.join(pkg, "src", "index.ts"),
        "--dest",
        dest,
        "--package-json",
        path.join(pkg, "package.json"),
        "--dry-run",
      ],
      elsewhere,
    );

    expect(status).toBe(0);
    expect(stdout).toMatch(/source\s+.*\(explicit\)/);
    expect(stdout).toContain("example      (none)");
  });
});

describe("cli fail-fast", () => {
  it("exits 1 when cwd has no package.json", () => {
    const root = tree({ "src/index.ts": pluginSource });
    const { status, stderr } = runCli(["--dry-run"], root);
    expect(status).toBe(1);
    expect(stderr).toContain("No package.json found");
  });

  it("exits 1 when no source can be auto-detected", () => {
    const root = tree({ "package.json": pkgJson() });
    const { status, stderr } = runCli(["--dry-run"], root);
    expect(status).toBe(1);
    expect(stderr).toContain("Could not auto-detect a source file");
  });

  it("exits 1 when no destination doc can be found", () => {
    const root = tree({ "package.json": pkgJson(), "src/index.ts": pluginSource });
    const { status, stderr } = runCli(["--dry-run"], root);
    expect(status).toBe(1);
    expect(stderr).toContain("Could not find an existing docs file");
  });
});

describe("cli end-to-end write", () => {
  it("generates docs into the discovered destination", () => {
    const root = tree({
      "package.json": pkgJson(),
      "src/index.ts": pluginSource,
      "docs/test.md": "",
    });

    const { status } = runCli([], root);

    expect(status).toBe(0);
    const written = fs.readFileSync(path.join(root, "docs", "test.md"), "utf-8");
    expect(written).toContain("<!-- jspsych-autodocs:");
    expect(written).toContain("test-plugin"); // name from the source's info object
    expect(written).toContain("9.9.9"); // version sourced from package.json
  });
});

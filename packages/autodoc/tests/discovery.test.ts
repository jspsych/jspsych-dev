import path from "node:path";

import { jest } from "@jest/globals";

import {
  discoverDest,
  discoverExample,
  discoverSource,
  extractPackageJsonInfo,
} from "../src/utils.js";
import { makeTree, removeTree } from "./helpers/tempTree.js";

const roots: string[] = [];
const tree = (spec: Record<string, string>): string => {
  const root = makeTree(spec);
  roots.push(root);
  return root;
};
afterEach(() => {
  roots.splice(0).forEach(removeTree);
});

describe("discoverSource", () => {
  it("prefers src/index.ts over index.ts", () => {
    const root = tree({ "src/index.ts": "", "index.ts": "" });
    expect(discoverSource(root)).toBe(path.join(root, "src", "index.ts"));
  });

  it("falls back to index.ts when src/index.ts is absent", () => {
    const root = tree({ "index.ts": "" });
    expect(discoverSource(root)).toBe(path.join(root, "index.ts"));
  });

  it("throws when neither candidate exists", () => {
    const root = tree({ "README.md": "" });
    expect(() => discoverSource(root)).toThrow("Could not auto-detect a source file");
  });
});

describe("discoverExample", () => {
  it("returns the examples/ directory when present", () => {
    const root = tree({ "examples/demo.html": "" });
    expect(discoverExample(root)).toBe(path.join(root, "examples"));
  });

  it("returns undefined when examples/ is absent", () => {
    const root = tree({ "src/index.ts": "" });
    expect(discoverExample(root)).toBeUndefined();
  });

  it("returns undefined when 'examples' is a file, not a directory", () => {
    const root = tree({ examples: "" });
    expect(discoverExample(root)).toBeUndefined();
  });
});

describe("discoverDest", () => {
  it("matches the type-stripped stem inside docs/", () => {
    const root = tree({ "docs/foo.md": "" });
    expect(discoverDest(root, "@jspsych/plugin-foo", "plugin")).toBe(
      path.join(root, "docs", "foo.md"),
    );
  });

  it("matches the full unscoped stem at the top level", () => {
    const root = tree({ "plugin-foo.md": "" });
    expect(discoverDest(root, "@jspsych/plugin-foo", "plugin")).toBe(
      path.join(root, "plugin-foo.md"),
    );
  });

  it("matches the reconstructed <type>-<name> stem when the name lacks a prefix", () => {
    const root = tree({ "docs/plugin-foo.md": "" });
    expect(discoverDest(root, "@jspsych/foo", "plugin")).toBe(
      path.join(root, "docs", "plugin-foo.md"),
    );
  });

  it("searches docs/ recursively", () => {
    const root = tree({ "docs/plugins/foo.md": "" });
    expect(discoverDest(root, "@jspsych/plugin-foo", "plugin")).toBe(
      path.join(root, "docs", "plugins", "foo.md"),
    );
  });

  it("ignores non-matching markdown like README.md", () => {
    const root = tree({ "README.md": "", "docs/foo.md": "" });
    expect(discoverDest(root, "@jspsych/plugin-foo", "plugin")).toBe(
      path.join(root, "docs", "foo.md"),
    );
  });

  it("throws when no candidate exists", () => {
    const root = tree({ "README.md": "" });
    expect(() => discoverDest(root, "@jspsych/plugin-foo", "plugin")).toThrow(
      "Could not find an existing docs file",
    );
  });

  it("throws when multiple candidates exist", () => {
    const root = tree({ "plugin-foo.md": "", "docs/foo.md": "" });
    expect(() => discoverDest(root, "@jspsych/plugin-foo", "plugin")).toThrow("Multiple candidate");
  });
});

describe("extractPackageJsonInfo", () => {
  it("reads name, description, and version", () => {
    const root = tree({
      "package.json": JSON.stringify({
        name: "@jspsych/plugin-foo",
        description: "A foo plugin",
        version: "2.1.0",
      }),
    });
    expect(extractPackageJsonInfo(path.join(root, "package.json"))).toEqual({
      name: "@jspsych/plugin-foo",
      description: "A foo plugin",
      version: "2.1.0",
    });
  });

  it("falls back to placeholders for missing fields", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const root = tree({ "package.json": JSON.stringify({ name: "@jspsych/plugin-foo" }) });
    expect(extractPackageJsonInfo(path.join(root, "package.json"))).toEqual({
      name: "@jspsych/plugin-foo",
      description: "unknown description",
      version: "unknown version",
    });
    warn.mockRestore();
  });

  it("throws on malformed JSON", () => {
    const root = tree({ "package.json": "{ not valid json" });
    expect(() => extractPackageJsonInfo(path.join(root, "package.json"))).toThrow(
      "Could not read package.json",
    );
  });

  it("throws when the file does not exist", () => {
    const root = tree({});
    expect(() => extractPackageJsonInfo(path.join(root, "package.json"))).toThrow(
      "Could not read package.json",
    );
  });
});

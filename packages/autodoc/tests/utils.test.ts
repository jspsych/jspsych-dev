import { identifyPackageType, relativizeExamplePaths } from "../src/utils.js";
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadFixture(relativePath: string) {
    const fixturePath = path.resolve(__dirname, relativePath);
    return ts.createSourceFile(
        fixturePath,
        fs.readFileSync(fixturePath, "utf-8"),
        ts.ScriptTarget.Latest,
        true
    );
}

const pluginSource = loadFixture("fixtures/plugin/basic.ts");
const extensionSource = loadFixture("fixtures/extension/basic.ts");
const timelineSource = loadFixture("fixtures/timeline/basic.ts")
const bothInterfacesSource = loadFixture("fixtures/utils/both-interfaces.ts");
const noClassSource = loadFixture("fixtures/utils/no-class.ts");

describe("identifyPackageType", () => {
    it("identifies plugin class", () => {
        const result = identifyPackageType(pluginSource);
        expect(result.type).toBe("plugin");
        expect(result.mainNode.name?.text).toBe("TestPlugin");
    });

    it("identifies extension class", () => {
        const result = identifyPackageType(extensionSource);
        expect(result.type).toBe("extension");
        expect(result.mainNode.name?.text).toBe("TestExtension");
    });

    it("identifies timeline function", () => {
        const result = identifyPackageType(timelineSource);
        expect(result.type).toBe("timeline")
        expect(result.mainNode.name?.text).toBe("createTimeline");
    })

    it("throws if class implements both interfaces", () => {
        expect(() => identifyPackageType(bothInterfacesSource)).toThrow(
            "A class cannot implement both JsPsychPlugin and JsPsychExtension interfaces."
        );
    });

    it("throws if no class found in source file", () => {
        expect(() => identifyPackageType(noClassSource)).toThrow(
            "No plugin or extension class found in source file."
        );
    });
});

describe("relativizeExamplePaths", () => {
    const root = path.resolve("/pkg/root");
    const example = (p: string) => ({ "Example": { path: p, code: "const a = 1;" } });

    it("rewrites an absolute path to be relative to the package root", () => {
        const result = relativizeExamplePaths(example(path.join(root, "examples", "demo.html")), root);
        expect(result["Example"].path).toBe("examples/demo.html");
    });

    it("keeps ../ prefixes for examples outside the package root", () => {
        const outside = path.resolve("/pkg/shared/examples/demo.html");
        const result = relativizeExamplePaths(example(outside), root);
        expect(result["Example"].path).toBe("../shared/examples/demo.html");
    });

    it("normalizes a path that is already relative to the package root", () => {
        const result = relativizeExamplePaths(example("./examples/demo.html"), process.cwd());
        expect(result["Example"].path).toBe("examples/demo.html");
    });

    it("does not mutate the input", () => {
        const absolute = path.join(root, "examples", "demo.html");
        const input = example(absolute);
        const result = relativizeExamplePaths(input, root);
        expect(input["Example"].path).toBe(absolute);
        expect(result["Example"]).not.toBe(input["Example"]);
    });

    it("preserves titles and code while rewriting every entry", () => {
        const input = {
            "First": { path: path.join(root, "examples", "one.html"), code: "one();" },
            "Second": { path: path.join(root, "examples", "nested", "two.html"), code: "two();" },
        };
        const result = relativizeExamplePaths(input, root);
        expect(result).toEqual({
            "First": { path: "examples/one.html", code: "one();" },
            "Second": { path: "examples/nested/two.html", code: "two();" },
        });
    });

    it("returns an empty record when there are no examples", () => {
        expect(relativizeExamplePaths({}, root)).toEqual({});
    });
});

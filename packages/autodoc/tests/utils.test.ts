import { identifyPackageType } from "../src/utils.js";
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

import { getExtensionDocs } from "../../src/renderers/extension.js";
import { ExtensionInfo } from "../../src/types/info.js";

const info: ExtensionInfo = {
  name: "test-extension",
  description: "A test extension.",
  version: "1.0.0",
  initializeParameters: {
    tracking: { type: "boolean", default: "true", description: "Whether to track." },
  },
  onStartParameters: {
    label: { type: "string", default: "undefined", description: "Trial label." },
  },
  onLoadParameters: {},
  onFinishParameters: {},
  data: {
    samples: { type: "object", default: "", description: "Collected samples." },
  },
  functions: {
    reset: {
      description: "Clears the collected samples.",
      isStatic: false,
      parameters: {},
      examples: [],
    },
  },
  examples: {
    "examples/basic.html": { title: "Basic example", hasCustomTitle: true, path: "examples/basic.html", displayPath: "basic.html", code: "initJsPsych({ extensions: [...] });" },
  },
};

describe("extension renderer (default template)", () => {
  const docs = getExtensionDocs(info);

  it("produces the default sections", () => {
    expect(Object.keys(docs)).toEqual([
      "introduction",
      "parameters",
      "init-parameters",
      "trial-parameters",
      "data",
      "functions",
      "examples",
    ]);
  });

  it("renders instance helper functions without a static marker", () => {
    expect(docs.functions).toContain("### `reset()`");
    expect(docs.functions).not.toContain("static reset");
    expect(docs.functions).toContain("Clears the collected samples.");
  });

  it("derives the jsPsychExtension name in the usage snippets", () => {
    expect(docs["init-parameters"]).toContain("jsPsychExtensionTestExtension");
  });

  it("renders human-readable type strings in parameter and data tables", () => {
    expect(docs["init-parameters"]).toContain("boolean");
    expect(docs["trial-parameters"]).toContain("string");
    expect(docs["data"]).toContain("object");
    expect(docs["init-parameters"]).not.toContain("ParameterType");
    expect(docs["data"]).not.toContain("ParameterType");
  });

  it("renders both examples with their subdirectory path in the section heading", () => {
    const infoWithPathCollision: ExtensionInfo = {
      ...info,
      examples: {
        "examples/path1/duplicated_filename.html": {
          title: "TestExtension Example",
          hasCustomTitle: false,
          path: "examples/path1/duplicated_filename.html",
          displayPath: "path1/duplicated_filename.html",
          code: "const trial1 = {};",
        },
        "examples/path2/duplicated_filename.html": {
          title: "TestExtension Example",
          hasCustomTitle: false,
          path: "examples/path2/duplicated_filename.html",
          displayPath: "path2/duplicated_filename.html",
          code: "const trial2 = {};",
        },
      },
    };
    const docs = getExtensionDocs(infoWithPathCollision);
    expect(docs.examples).toContain("### TestExtension Example (path1/duplicated_filename.html)");
    expect(docs.examples).toContain("### TestExtension Example (path2/duplicated_filename.html)");
    expect(docs.examples).not.toContain("### TestExtension Example (duplicated_filename.html)");
  });

  it("matches the rendered snapshot", () => {
    expect(getExtensionDocs(info)).toMatchSnapshot();
  });
});

describe("extension renderer (empty optional sections)", () => {
  const emptyInfo: ExtensionInfo = { ...info, functions: {}, examples: {} };
  const docs = getExtensionDocs(emptyInfo);

  it("keeps the section anchors while omitting the visible headings", () => {
    expect(docs.functions).toContain("jspsych-autodocs:functions:start");
    expect(docs.functions).not.toContain("## Functions");
    expect(docs.examples).toContain("jspsych-autodocs:examples:start");
    expect(docs.examples).not.toContain("## Examples");
  });
});

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
    "Basic example": { path: "examples/basic.html", code: "initJsPsych({ extensions: [...] });" },
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

  it("matches the rendered snapshot", () => {
    expect(getExtensionDocs(info)).toMatchSnapshot();
  });
});

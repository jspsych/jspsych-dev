import { getExtensionDocs } from "../../src/renderers/extension.js";
import { ExtensionInfo } from "../../src/types/info.js";

const info: ExtensionInfo = {
  name: "test-extension",
  description: "A test extension.",
  version: "1.0.0",
  initializeParameters: {
    tracking: { type: "ParameterType.BOOL", default: "true", description: "Whether to track." },
  },
  onStartParameters: {
    label: { type: "ParameterType.STRING", default: "undefined", description: "Trial label." },
  },
  onLoadParameters: {},
  onFinishParameters: {},
  data: {
    samples: { type: "ParameterType.OBJECT", default: "", description: "Collected samples." },
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
      "examples",
    ]);
  });

  it("derives the jsPsychExtension name in the usage snippets", () => {
    expect(docs["init-parameters"]).toContain("jsPsychExtensionTestExtension");
  });

  it("matches the rendered snapshot", () => {
    expect(getExtensionDocs(info)).toMatchSnapshot();
  });
});

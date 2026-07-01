import { getPluginDocs } from "../../src/renderers/plugin.js";
import { PluginInfo, SectionTemplate } from "../../src/types/info.js";

// A representative PluginInfo, built inline so these tests exercise the default
// template's rendering logic in isolation from the parser.
const info: PluginInfo = {
  name: "test-plugin",
  description: "A test plugin.",
  version: "1.0.0",
  parameters: {
    stimulus: { type: "ParameterType.HTML_STRING", default: "undefined", description: "The stimulus." },
    trials: { type: "ParameterType.INT", default: "1", description: "Number of trials." },
    choices: { type: "ParameterType.KEYS", default: '"ALL_KEYS"', array: true, description: "Valid keys." },
  },
  data: {
    rt: { type: "ParameterType.INT", default: "", description: "Response time in ms." },
    response: { type: "ParameterType.STRING", default: "", description: "The key pressed." },
  },
  examples: {
    "Basic example": { path: "examples/basic.html", code: "const trial = { type: jsPsychTestPlugin };" },
  },
};

describe("plugin renderer (default template)", () => {
  const docs = getPluginDocs(info);

  it("produces the default sections", () => {
    expect(Object.keys(docs)).toEqual(["introduction", "parameters", "data", "examples"]);
  });

  it("maps ParameterType values to human-readable names", () => {
    expect(docs.parameters).toContain("HTML string");
    expect(docs.parameters).toContain("integer");
    expect(docs.parameters).toContain("array of keys");
  });

  it("renders data rows and examples", () => {
    expect(docs.data).toContain("Response time in ms.");
    expect(docs.examples).toContain("examples/basic.html");
  });

  it("maps ParameterType values to human-readable strings in the data table", () => {
    expect(docs.data).toContain("integer");
    expect(docs.data).toContain("string");
    expect(docs.data).not.toContain("ParameterType");
  });

  it("matches the rendered snapshot", () => {
    expect(getPluginDocs(info)).toMatchSnapshot();
  });
});

describe("plugin renderer (custom template)", () => {
  it("fully replaces the default sections", () => {
    const custom: SectionTemplate<PluginInfo>[] = [
      { heading: "custom", render: (i) => `# ${i.name}` },
    ];
    const docs = getPluginDocs(info, custom);
    expect(Object.keys(docs)).toEqual(["custom"]);
    // none of the defaults survive
    expect(docs).not.toHaveProperty("introduction");
    expect(docs).not.toHaveProperty("parameters");
  });
});

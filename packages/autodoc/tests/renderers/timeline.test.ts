import { getTimelineDocs } from "../../src/renderers/timeline.js";
import { TimelineInfo } from "../../src/types/info.js";

const info: TimelineInfo = {
  name: "test-timeline",
  description: "A test timeline.",
  version: "1.0.0",
  createTimeline: {
    description: "Builds the timeline.",
    helperParameters: {
      stimuli: { type: "string[]", default: "undefined", array: true, description: "List of stimuli." },
    },
  },
  timelineUnits: {
    trial: { description: "A single trial unit.", helperParameters: {} },
  },
  utils: {},
  interfaces: {},
  examples: {
    "examples/basic.html": { title: "Basic example", hasCustomTitle: true, path: "examples/basic.html", displayPath: "basic.html", code: "createTimeline(jsPsych);" },
  },
};

describe("timeline renderer (default template)", () => {
  const docs = getTimelineDocs(info);

  it("produces the default sections", () => {
    expect(Object.keys(docs)).toEqual([
      "introduction",
      "installation",
      "api-reference",
      "create-timeline",
      "timeline-units",
      "utils",
      "configuration-options",
      "examples",
    ]);
  });

  it("renders the createTimeline helper body", () => {
    expect(docs["create-timeline"]).toContain("Builds the timeline.");
  });

  it("collapses configuration-options when there are no shared interfaces", () => {
    expect(docs["configuration-options"]).toContain("jspsych-autodocs:configuration-options:start");
    expect(docs["configuration-options"]).not.toContain("## Configuration Options");
    expect(docs["configuration-options"]).not.toContain("*None*");
  });

  it("collapses examples when there are none", () => {
    const emptyExamples = getTimelineDocs({ ...info, examples: {} });
    expect(emptyExamples.examples).toContain("jspsych-autodocs:examples:start");
    expect(emptyExamples.examples).not.toContain("## Examples");
  });

  it("matches the rendered snapshot", () => {
    expect(getTimelineDocs(info)).toMatchSnapshot();
  });
});

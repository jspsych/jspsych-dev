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
    "Basic example": { path: "examples/basic.html", code: "createTimeline(jsPsych);" },
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

  it("matches the rendered snapshot", () => {
    expect(getTimelineDocs(info)).toMatchSnapshot();
  });
});

import { renderSections } from "../../src/renderers/utils.js";
import { SectionTemplate } from "../../src/types/info.js";

// `renderSections` is the shared, type-agnostic wrapper behind every `get*Docs`
// function. It does not know about any particular `*Info` shape or default
// template, so it is tested generically with a throwaway info object and a
// fake template. This is the contract that custom-template (config) users
// depend on.
interface FakeInfo {
  name: string;
}

describe("renderSections", () => {
  const info: FakeInfo = { name: "x" };

  it("keys the result by section heading, in template order", () => {
    const template: SectionTemplate<FakeInfo>[] = [
      { heading: "a", render: () => "A" },
      { heading: "b", render: () => "B" },
    ];
    expect(Object.keys(renderSections(info, template))).toEqual(["a", "b"]);
  });

  it("wraps each rendered section in matching sentinel tags", () => {
    const template: SectionTemplate<FakeInfo>[] = [{ heading: "intro", render: () => "hello" }];
    expect(renderSections(info, template).intro).toBe(
      "<!-- jspsych-autodocs:intro:start -->\nhello\n<!-- jspsych-autodocs:intro:end -->",
    );
  });

  it("passes the exact info object to each render function", () => {
    let received: FakeInfo | undefined;
    renderSections(info, [
      {
        heading: "a",
        render: (i) => {
          received = i;
          return "";
        },
      },
    ]);
    expect(received).toBe(info);
  });

  it("returns an empty record for an empty template", () => {
    expect(renderSections(info, [])).toEqual({});
  });

  it("keeps the last section when headings collide", () => {
    const template: SectionTemplate<FakeInfo>[] = [
      { heading: "dup", render: () => "first" },
      { heading: "dup", render: () => "second" },
    ];
    const out = renderSections(info, template);
    expect(Object.keys(out)).toEqual(["dup"]);
    expect(out.dup).toContain("second");
  });
});

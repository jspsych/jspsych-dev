import { removePackageName, renderSections, PARAMETER_TYPE_MAP } from "../../src/renderers/utils.js";
import { SectionTemplate } from "../../src/types/info.js";

describe("removePackageName", () => {
  it("strips a leading bold title and the whitespace after it", () => {
    expect(
      removePackageName("**plugin-redirect-to-url** The redirect-to-url plugin does things."),
    ).toBe("The redirect-to-url plugin does things.");
  });

  it("works regardless of the form the bolded name takes", () => {
    expect(removePackageName("**jsPsychPipe** This plugin facilitates communication.")).toBe(
      "This plugin facilitates communication.",
    );
  });

  it("only removes the first (leading) bold span", () => {
    expect(removePackageName("**title** keep **this** bold")).toBe("keep **this** bold");
  });

  it("returns a description with no leading bold span unchanged", () => {
    expect(removePackageName("A test plugin.")).toBe("A test plugin.");
  });

  it("does not strip a bold span that is not at the very start", () => {
    expect(removePackageName("See **the docs** for details.")).toBe(
      "See **the docs** for details.",
    );
  });
});

describe("PARAMETER_TYPE_MAP", () => {
  it("maps common ParameterType values to human-readable strings", () => {
    expect(PARAMETER_TYPE_MAP["ParameterType.BOOL"]).toBe("boolean");
    expect(PARAMETER_TYPE_MAP["ParameterType.STRING"]).toBe("string");
    expect(PARAMETER_TYPE_MAP["ParameterType.INT"]).toBe("integer");
    expect(PARAMETER_TYPE_MAP["ParameterType.FLOAT"]).toBe("float");
    expect(PARAMETER_TYPE_MAP["ParameterType.HTML_STRING"]).toBe("HTML string");
    expect(PARAMETER_TYPE_MAP["ParameterType.COMPLEX"]).toBe("object");
  });

  it("returns undefined for unknown ParameterType values", () => {
    expect(PARAMETER_TYPE_MAP["ParameterType.UNKNOWN"]).toBeUndefined();
  });
});

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

import { SectionTemplate, TimelineInfo } from "../types/info.js";

const mainTemplate: SectionTemplate<TimelineInfo>[] = [
    {
        heading: "",
        render: (info) => ""
    }    
]

export function getTimelineDocs(info: TimelineInfo): Record<string, string> {
  return Object.fromEntries(
    mainTemplate.map((section) => {
      const content = section.render(info);
      const wrapped = `<!-- jspsych-autodocs:${section.heading}:start -->\n${content}\n<!-- jspsych-autodocs:${section.heading}:end -->`;
      return [section.heading, wrapped];
    }),
  );
}
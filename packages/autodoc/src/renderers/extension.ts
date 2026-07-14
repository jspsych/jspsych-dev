import { ExtensionInfo, SectionTemplate } from "../types/info.js";
import { renderParameterRow, renderDataRow, renderFunctionGroup, renderSections, topParameterChart, topDataChart } from "./utils.js";

const getTypeName = (type: string, array?: boolean): string =>
  array ? `array of ${type}` : type;

const toJsPsychExtensionName = (name: string): string =>
  "jsPsychExtension" + name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");

export const defaultExtensionTemplate: SectionTemplate<ExtensionInfo>[] = [
  {
    heading: "introduction",
    render: (info) => {
      return `# ${info.name}

${info.description}

Current version: ${info.version}`.trim();
      },
  },
  {
    heading: "parameters",
    render: (_) => `## Parameters \n`
  },
  {
    heading: "init-parameters",
    render: (info) => {
      const initRows = Object.entries(info.initializeParameters)
        .map(([name, param]) => renderParameterRow(name, param, getTypeName))
        .join("\n");
      return `### Initialization Parameters
Initialization parameters are set when calling \`initJsPsych()\`.

\`\`\`js
initJsPsych({
  extensions: {
    { type: ${toJsPsychExtensionName(info.name)}, params: { ... } }
  }
})
\`\`\`

${topParameterChart}
${initRows ?? "*None*"}
`.trim();
    }
  },
  {
    heading: "trial-parameters",
    render: (info) => {
      const trialRows = Object.entries({ ...info.onStartParameters, ...info.onLoadParameters, ...info.onFinishParameters })
        .map(([name, param]) => renderParameterRow(name, param, getTypeName))
        .join("\n");
      return `### Trial Parameters

Trial parameters are set when adding an extension to the trial object.

\`\`\`js
var trial = {
  type: jsPsych...,
  extensions: [
    { type: ${toJsPsychExtensionName(info.name)}, params: { ... } }
  ]
}
\`\`\`

${topParameterChart}
${trialRows ?? "*None*"}
`.trim();
    }
  },
  {
    heading: "data",
    render: (info) => {
      const rows = Object.entries(info.data)
        .map(([name, param]) => renderDataRow(name, param, getTypeName))
        .join("\n");
      return `## Data Generated

${topDataChart}
${rows ?? "*None*"}
`.trim();
  },
  },
  {
    heading: "functions",
    render: (info) => {
      if (Object.keys(info.functions).length === 0) return "";
      return `## Functions

In addition to the standard extension lifecycle methods, this extension exposes the following helper functions.

${renderFunctionGroup(info.functions)}
`.trim();
    },
  },
  {
    heading: "examples",
    render: (info) => {
      if (Object.keys(info.examples).length === 0) return "";
      const sections = Object.entries(info.examples)
        .map(
          ([title, example]) =>
            `### ${title} (${example.path})

\`\`\`js
${example.code}
\`\`\``,
        )
        .join("\n\n");
      return `## Examples

${sections}
`.trim();
    },
  },
]

export function getExtensionDocs(
  info: ExtensionInfo,
  template: SectionTemplate<ExtensionInfo>[] = defaultExtensionTemplate,
): Record<string, string> {
  return renderSections(info, template);
}
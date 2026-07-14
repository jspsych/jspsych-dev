import { PluginInfo, SectionTemplate } from "../types/info.js";
import { renderParameterRow, renderDataRow, renderFunctionGroup, removePackageName, renderSections, topParameterChart, topDataChart, PARAMETER_TYPE_MAP } from "./utils.js";

const stringifyTypeMap = PARAMETER_TYPE_MAP;

const getTypeName = (type: string, array?: boolean): string => {
  const baseType = stringifyTypeMap[type] || type;
  return array ? `array of ${baseType}` : baseType;
};

export const defaultPluginTemplate: SectionTemplate<PluginInfo>[] = [
  {
    heading: "introduction",
    render: (info) => {
      return `# ${info.name}

${removePackageName(info.description)}

Current version: ${info.version}`.trim();
    },
  },
  {
    heading: "parameters",
    render: (info) => {
      const rows = Object.entries(info.parameters)
        .map(([name, param]) => renderParameterRow(name, param, getTypeName))
        .join("\n");
      return `## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of \`undefined\` must be specified. Other parameters can be left unspecified if the default value is acceptable.

${topParameterChart}
${rows ?? "*None*"}
`.trim();
    },
  },
  {
    heading: "data",
    render: (info) => {
      const rows = Object.entries(info.data)
        .map(([name, param]) => renderDataRow(name, param, getTypeName))
        .join("\n");
      return `## Data

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

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

In addition to the standard plugin lifecycle methods, this plugin exposes the following helper functions.

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
];

export function getPluginDocs(
  info: PluginInfo,
  template: SectionTemplate<PluginInfo>[] = defaultPluginTemplate,
): Record<string, string> {
  return renderSections(info, template);
}

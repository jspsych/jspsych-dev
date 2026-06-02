import { PluginInfo, SectionTemplate } from "../types/info.js";
import { renderParameterRow, renderDataRow, topParameterChart, topDataChart } from "./utils.js";

const stringifyTypeMap: Record<string, string> = {
  "ParameterType.STRING": "string",
  "ParameterType.INT": "integer",
  "ParameterType.FLOAT": "float",
  "ParameterType.BOOL": "boolean",
  "ParameterType.FUNCTION": "function",
  "ParameterType.KEY": "key",
  "ParameterType.KEYS": "keys",
  "ParameterType.SELECT": "selection", //TODO: infer type from options
  "ParameterType.HTML_STRING": "HTML string",
  "ParameterType.IMAGE": "image file",
  "ParameterType.AUDIO": "audio file",
  "ParameterType.VIDEO": "video file",
  "ParameterType.OBJECT": "object",
  "ParameterType.COMPLEX": "object",
};

const getTypeName = (type: string, array?: boolean): string => {
  const baseType = stringifyTypeMap[type] || type;
  return array ? `array of ${baseType}` : baseType;
};

const mainTemplate: SectionTemplate<PluginInfo>[] = [
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
    heading: "examples",
    render: (info) => {
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

export function getPluginDocs(info: PluginInfo): Record<string, string> {
  return Object.fromEntries(
    mainTemplate.map((section) => {
      const content = section.render(info);
      const wrapped = `<!-- jspsych-autodocs:${section.heading}:start -->\n${content}\n<!-- jspsych-autodocs:${section.heading}:end -->`;
      return [section.heading, wrapped];
    }),
  );
}

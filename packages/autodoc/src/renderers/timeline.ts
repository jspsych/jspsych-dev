import { SectionTemplate, TimelineInfo, TimelineHelperInfo, TimelineInterfaceInfo, ParameterInfo } from "../types/info.js";
import { removePackageName, renderSections, topParameterChart } from "./utils.js";

const getTypeName = (type: string, array?: boolean): string => (array ? `array of ${type}` : type);

function formatDefault(value: string | undefined): string {
  if (!value) return "*(required)*";
  // no new lines!!!!!!!!
  const normalized = value.replace(/\s*\n\s*/g, " ").trim();
  return !isNaN(parseFloat(normalized)) ? normalized : `\`${normalized}\``;
}

function renderParamRow(name: string, param: ParameterInfo): string {
  let description = param.description?.trim();
  if (!description) {
    console.warn(`Warning: Parameter "${name}" is missing a description.`);
    description = "No description provided.";
  }
  if (param.interfaceRef) {
    description = `${description} (see [\`${param.interfaceRef}\`](#${param.interfaceRef.toLowerCase()}) below)`;
  }
  return `| ${name} | ${getTypeName(param.type, param.array)} | ${formatDefault(param.default)} | ${description} |`;
}

function renderParameterChart(
  params: Record<string, ParameterInfo>,
  subHeadingLevel: string,
  path: string,
): string {
  const rows = Object.entries(params)
    .map(([name, param]) => renderParamRow(name, param))
    .join("\n");
  const chart = `${topParameterChart}\n${rows || "*None*"}`;

  const subcharts = Object.entries(params)
    .filter(([, param]) => param.nested)
    .map(([name, param]) => {
      const subPath = path ? `${path}.${name}` : name;
      return `${subHeadingLevel} \`${subPath}\`\n\n${renderParameterChart(param.nested!, subHeadingLevel + "#", subPath)}`;
    });

  return [chart, ...subcharts].join("\n\n");
}

function renderFunctionBody(helper: TimelineHelperInfo, subHeadingLevel: string): string {
  const description = helper.description || "*No description provided.*";
  const chart = renderParameterChart(helper.helperParameters, subHeadingLevel, "");
  return `${description}\n\n${chart}`;
}

function renderHelperGroup(group: Record<string, TimelineHelperInfo>): string {
  const sections = Object.entries(group)
    .map(([name, helper]) => `#### \`${name}()\`\n\n${renderFunctionBody(helper, "#####")}`)
    .join("\n\n");
  return sections || "*None*";
}

export const defaultTimelineTemplate: SectionTemplate<TimelineInfo>[] = [
  {
    heading: "introduction",
    render: (info) => {
      return `# ${info.name}

${removePackageName(info.description)}

Current version: ${info.version}`.trim();
    },
  },
  {
    heading: "installation",
    render: (info) => {
      return `## Installation
      
TODO`
    }
  },
  {
    heading: "api-reference",
    render: (_) => "## API Reference",
  },
  {
    heading: "create-timeline",
    render: (info) => `### \`createTimeline()\`

${renderFunctionBody(info.createTimeline, "####")}`,
  },
  {
    heading: "timeline-units",
    render: (info) => `### \`timelineUnits\`

The following helper functions are exported as part of \`timelineUnits\` and can be used to build pieces of the timeline.

${renderHelperGroup(info.timelineUnits)}`,
  },
  {
    heading: "utils",
    render: (info) => `### \`utils\`

The following helper functions are exported as part of \`utils\`.

${renderHelperGroup(info.utils)}`,
  },
  {
    heading: "configuration-options",
    render: (info) => {
      if (Object.keys(info.interfaces).length === 0) return "";
      const sections = Object.entries(info.interfaces)
        .map(([name, interfaceInfo]: [string, TimelineInterfaceInfo]) => {
          const description = interfaceInfo.description || "*No description provided.*";
          const chart = renderParameterChart(interfaceInfo.interfaceParameters, "####", "");
          return `### \`${name}\`\n\n${description}\n\n${chart}`;
        })
        .join("\n\n");
      return `## Configuration Options

These types are shared by multiple parameters above.

${sections}`;
    },
  },
  {
    heading: "examples",
    render: (info) => {
      if (Object.keys(info.examples).length === 0) return "";
      const sections = Object.entries(info.examples)
        .map(
          ([, example]) =>
            `### ${example.title}${example.hasCustomTitle ? "" : ` (${example.displayPath})`}

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

export function getTimelineDocs(
  info: TimelineInfo,
  template: SectionTemplate<TimelineInfo>[] = defaultTimelineTemplate,
): Record<string, string> {
  return renderSections(info, template);
}

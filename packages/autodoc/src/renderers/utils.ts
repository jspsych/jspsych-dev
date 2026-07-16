import { FunctionInfo, ParameterInfo, SectionTemplate } from "../types/info.js";

/** 
 * renders a given template with `info`, returning a record keyed with the 
 * section headers, and values containing the rendered content per section.
 * used in each `get*Docs` function.
 */
export function renderSections<T>(
  info: T,
  template: SectionTemplate<T>[],
): Record<string, string> {
  return Object.fromEntries(
    template.map((section) => {
      const content = section.render(info);
      const wrapped = `<!-- jspsych-autodocs:${section.heading}:start -->\n${content}\n<!-- jspsych-autodocs:${section.heading}:end -->`;
      return [section.heading, wrapped];
    }),
  );
}

/**
 * Strips a leading bold "title" from a parsed class description. jsPsych plugin,
 * extension, and timeline docblocks conventionally open with the package name wrapped
 * in bold (e.g. `**plugin-redirect-to-url**` or `**jsPsychPipe**`) before the real
 * description. The exact form of that name isn't predictable, so we remove whatever
 * leading `**...**` bold span is present. Descriptions with no leading bold span are
 * returned unchanged.
 */
export function removePackageName(description: string): string {
  return description.replace(/^\s*\*\*.+?\*\*\s*/, "").trim();
}

export const PARAMETER_TYPE_MAP: Record<string, string> = {
  "ParameterType.STRING": "string",
  "ParameterType.INT": "integer",
  "ParameterType.FLOAT": "float",
  "ParameterType.BOOL": "boolean",
  "ParameterType.FUNCTION": "function",
  "ParameterType.KEY": "key",
  "ParameterType.KEYS": "keys",
  "ParameterType.SELECT": "selection",
  "ParameterType.HTML_STRING": "HTML string",
  "ParameterType.IMAGE": "image file",
  "ParameterType.AUDIO": "audio file",
  "ParameterType.VIDEO": "video file",
  "ParameterType.OBJECT": "object",
  "ParameterType.COMPLEX": "object",
};

export const topParameterChart = `| Parameter | Type | Default Value | Description |
| --------- | ---- | ------------- | ----------- |`;

export const topDataChart = `| Name | Type | Value |
| ---- | ---- | ----- |`;

const renderNestedParameterDescription = (nested: Record<string, ParameterInfo>): string => {
  const parts = Object.entries(nested).map(([name, param]) => {
    if (!param.description) {
      console.warn(`Warning: Nested parameter "${name}" is missing a description.`);
      param.description = "No description provided.";
    }
    const desc = param.nested
      ? `${param.description} ${renderNestedParameterDescription(param.nested)}`
      : param.description;
    return `\`${name}\`: ${desc}`;
  });
  return `(${parts.join(", ")})`;
};

export const renderParameterRow = (name: string, parameter: ParameterInfo, typeToString: (type: string, array?: boolean) => string): string => {
  if (!parameter.description) {
    console.warn(`Warning: Parameter "${name}" is missing a description.`);
    parameter.description = "No description provided.";
  }
  const defaultValue = !isNaN(parseFloat(parameter.default))
    ? parameter.default
    : `\`${parameter.default}\``;
  const description = parameter.nested
    ? `${parameter.description} ${renderNestedParameterDescription(parameter.nested)}`
    : parameter.description;
  return `| ${name} | ${typeToString(parameter.type, parameter.array)} | ${defaultValue} | ${description} |`;
};

const renderNestedDataDescription = (nested: Record<string, ParameterInfo>): string => {
  const parts = Object.entries(nested).map(([name, param]) => {
    if (!param.description) {
      console.warn(`Warning: Nested data parameter "${name}" is missing a description.`);
      param.description = "No description provided.";
    }
    const desc = param.nested
      ? `${param.description} ${renderNestedDataDescription(param.nested)}`
      : param.description;
    return `\`${name}\`: ${desc}`;
  });
  return `(${parts.join(", ")})`;
};

export const renderDataRow = (name: string, parameter: ParameterInfo, typeToString: (type: string, array?: boolean) => string): string => {
  if (!parameter.description) {
    console.warn(`Warning: Data parameter "${name}" is missing a description.`);
    parameter.description = "No description provided.";
  }
  const value = parameter.nested
    ? `${parameter.description} ${renderNestedDataDescription(parameter.nested)}`
    : parameter.description;
  return `| ${name} | ${typeToString(parameter.type, parameter.array)} | ${value} |`;
};

/** function parameter/return types come from TS annotations already, so they only need array-wrapping */
const renderFunctionTypeName = (type: string, array?: boolean): string =>
  array ? `array of ${type}` : type;

const renderFunction = (name: string, fn: FunctionInfo): string => {
  const signature = `${fn.isStatic ? "static " : ""}${name}(${Object.keys(fn.parameters).join(", ")})`;
  const parts: string[] = [`### \`${signature}\``];

  parts.push(fn.description?.trim() || "*No description provided.*");

  if (Object.keys(fn.parameters).length > 0) {
    const rows = Object.entries(fn.parameters)
      .map(([paramName, param]) => renderParameterRow(paramName, param, renderFunctionTypeName))
      .join("\n");
    parts.push(`${topParameterChart}\n${rows}`);
  }

  if (fn.returns) {
    const type = renderFunctionTypeName(fn.returns.type, fn.returns.array);
    const description = fn.returns.description ? ` — ${fn.returns.description}` : "";
    parts.push(`**Returns:** \`${type}\`${description}`);
  }

  for (const example of fn.examples) {
    parts.push(`\`\`\`js\n${example}\n\`\`\``);
  }

  return parts.join("\n\n");
};

/**
 * Renders a group of helper functions as classic function documentation: a
 * signature heading, description, parameter table, return value, and any
 * `@example` code blocks. Shared by the plugin and extension renderers.
 */
export const renderFunctionGroup = (functions: Record<string, FunctionInfo>): string => {
  const entries = Object.entries(functions);
  if (entries.length === 0) return "*None*";
  return entries.map(([name, fn]) => renderFunction(name, fn)).join("\n\n");
};
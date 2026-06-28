import { ParameterInfo, SectionTemplate } from "../types/info.js";

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
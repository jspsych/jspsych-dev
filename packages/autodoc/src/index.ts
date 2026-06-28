export { getPluginInfo } from "./parsers/plugin.js";
export { getExtensionInfo } from "./parsers/extension.js";
export { getTimelineInfo } from "./parsers/timeline.js";

export { getPluginDocs, defaultPluginTemplate } from "./renderers/plugin.js";
export { getExtensionDocs, defaultExtensionTemplate } from "./renderers/extension.js";
export { getTimelineDocs, defaultTimelineTemplate } from "./renderers/timeline.js";

export type {
  AutodocConfig,
  SectionTemplate,
  PluginInfo,
  ExtensionInfo,
  TimelineInfo,
  TimelineHelperInfo,
  TimelineInterfaceInfo,
  ParameterInfo,
  ExampleInfo,
} from "./types/info.js";

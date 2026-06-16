import ts from "typescript";
import { TimelineInfo, TimelineHelperInfo } from "../types/info.js";
import { collectExamples, dedent, extractJsDocComment, parseParamGroup } from "./utils.js";

export function getTimelineInfo(sourceFile: ts.SourceFile, createTimelineNode: ts.FunctionDeclaration): TimelineInfo {
  let result: TimelineInfo = {
    name: "",
    description: "",
    version: "",
    createTimeline: { description: "", helperParameters: {} },
    timelineUnits: {},
    utils: {},
    examples: {},
  };

  return result;
}

function inferCodeBlock(content: string, path: string): string {
  return "";
}

export function getTimelineInfoAndExamples(
  sourceFile: ts.SourceFile,
  createTimelineNode: ts.FunctionDeclaration,
  examplePath: string,
): TimelineInfo {
  const info = getTimelineInfo(sourceFile, createTimelineNode);
  info.examples = collectExamples(examplePath, inferCodeBlock);
  return info;
}

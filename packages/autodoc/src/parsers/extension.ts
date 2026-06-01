import ts from "typescript";
import { ExtensionInfo } from "../types/info.js";

export async function getExtensionInfo(source: ts.SourceFile): Promise<ExtensionInfo> {
  // Placeholder implementation, replace with actual logic to retrieve documentation
  let result: ExtensionInfo = {
    name: "",
    description: "",
    version: "",
    initializeParameters: {},
    onStartParameters: {},
    onLoadParameters: {},
    onFinishParameters: {},
    data: {},
    examples: {},
  };

  return result;
}

export async function getExtensionInfoAndExamples(
  source: ts.SourceFile,
  examplePath: string,
): Promise<ExtensionInfo> {
  // Placeholder implementation, replace with actual logic to retrieve documentation
  const info = await getExtensionInfo(source);

  return info;
}

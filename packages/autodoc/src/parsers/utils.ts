import ts from "typescript";

/** Grabs JSDoc comments from a node. */
export function extractJsDocComment(node: ts.Node, source: ts.SourceFile): string | undefined {
  const jsDoc = ts.getJSDocCommentsAndTags(node);
  const rawComment = jsDoc[0] && ts.isJSDoc(jsDoc[0]) ? jsDoc[0].comment : undefined;
  return (
    typeof rawComment === "string" ? rawComment : rawComment?.map((n) => n.getText(source)).join("")
  )
    ?.replace(/\s*\n\s*/g, " ")
    .trim();
}

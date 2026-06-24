import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * builds a dummy directory under the OS temp dir, returning the root. keys for 
 * `spec` are the file paths, relative to the root, and the values are the 
 * contents of the file. we need this to temporarily create `package.json`s 
 * to mimic real file systems. 
 * 
 * we need this to allow discovery tests and e2e CLI testing to run, without 
 * incurring an error from `jest-haste-map`'s duplicate-package-name detection.
 */
export function makeTree(spec: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "autodoc-test-"));
  for (const [rel, content] of Object.entries(spec)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

/** removes a tree created by {@link makeTree} */
export function removeTree(root: string): void {
  fs.rmSync(root, { recursive: true, force: true });
}

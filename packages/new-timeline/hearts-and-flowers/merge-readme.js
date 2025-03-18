import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const docsReadmePath = join(new URL('.', import.meta.url).pathname, 'docs', 'README.md');
const rootReadmePath = join(new URL('.', import.meta.url).pathname, 'README.md');
const startMarker = '<!-- AUTO-GENERATED-API-DOCS -->\n';
const endMarker = '<!-- END-OF-API-DOCS -->\n';

if (existsSync(docsReadmePath)) {
  const docsReadmeContent = readFileSync(docsReadmePath, 'utf-8');
  let rootReadmeContent = readFileSync(rootReadmePath, 'utf-8');

  const startIndex = rootReadmeContent.indexOf(startMarker);
  const endIndex = rootReadmeContent.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    rootReadmeContent =
      rootReadmeContent.slice(0, startIndex + startMarker.length) +
      '\n\n' +
      docsReadmeContent +
      '\n\n' +
      rootReadmeContent.slice(endIndex);
    writeFileSync(rootReadmePath, rootReadmeContent, 'utf-8');
    console.log('Injected docs/README.md content into the root README.md between markers.');
  } else {
    console.error('Markers not found or are in the wrong order in the root README.md.');
  }
} else {
  console.error('docs/README.md does not exist. Ensure Typedoc has generated it.');
}

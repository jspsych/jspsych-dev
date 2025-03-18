import fs from 'fs';
import { execSync } from 'child_process';

const apiDoc = execSync('npx typedoc --options typedoc.json --plugin typedoc-plugin-markdown').toString();
const readmePath = './README.md';

let readmeContent = fs.readFileSync(readmePath, 'utf-8');
const startMarker = '<!-- AUTO-GENERATED-API-DOCS -->\n';
const endMarker = '<!-- END-OF-API-DOCS -->\n';

const newContent =
  startMarker + apiDoc + '\n' + endMarker;

const updatedContent = readmeContent.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  newContent
);

fs.writeFileSync(readmePath, updatedContent);
console.log('README.md updated with API documentation.');

import fs from 'fs';
import { execSync } from 'child_process';

const apiDoc = execSync('npx typedoc --options typedoc.json --out docs --plugin typedoc-plugin-markdown').toString();
const docsPath = './docs/api-docs.md'; // Changed path to docs folder

// Ensure the docs folder exists
if (!fs.existsSync('./docs')) {
  fs.mkdirSync('./docs');
}

fs.writeFileSync(docsPath, apiDoc); // Write API docs to the docs folder
console.log('API documentation generated in docs/api-docs.md.');

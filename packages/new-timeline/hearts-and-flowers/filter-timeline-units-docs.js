import fs from 'fs';
import path from 'path';

const docsTimelineUnitsPath = path.join(new URL('./docs/variables', import.meta.url).pathname, 'timelineUnits.md');
const content = fs.readFileSync(docsTimelineUnitsPath, 'utf-8');


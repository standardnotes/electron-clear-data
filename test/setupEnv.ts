import fs from 'fs-extra';
import path from 'path';

const tmpDir = path.resolve(__dirname, '../tmp');
fs.emptyDirSync(tmpDir);

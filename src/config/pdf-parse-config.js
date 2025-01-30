import fs from 'fs';
import path from 'path';

const pdfPath = path.join(process.cwd(), 'node_modules', 'pdf-parse', 'test', 'data', '05-versions-space.pdf');

if (!fs.existsSync(pdfPath)) {
  fs.writeFileSync(pdfPath, 'Dummy PDF content');
}

export default {};
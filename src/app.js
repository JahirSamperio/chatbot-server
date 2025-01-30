import './config/pdf-parse-config.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Server from './server/server.js';

// Sobrescribe la variable de entorno PDF_FILE
// process.env.PDF_FILE = PDF_FILE;

config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir);
// }

const server = new Server();
server.listen();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.join(root, 'client', 'dist');
const to = path.join(root, 'server', 'public');

if (!fs.existsSync(path.join(from, 'index.html'))) {
  console.error('client/dist/index.html not found - run the Vite build first.');
  process.exit(1);
}

fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });
console.log('Copied client/dist -> server/public');

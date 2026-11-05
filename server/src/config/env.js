import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Must be the first import in every entrypoint: ESM evaluates imported modules
// before the importing module body, so late dotenv.config() calls leave
// module-scope constants reading an empty environment.
const here = path.dirname(fileURLToPath(import.meta.url));

dotenv.config(); // process.cwd()
dotenv.config({ path: path.join(here, '../../..', '.env') }); // repo root
dotenv.config({ path: path.join(here, '../..', '.env') }); // server/

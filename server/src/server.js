import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);
app.use('/api', routes);

// In production the compiled React app is served by this same process (single port).
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(path.join(publicDir, 'index.html'))) {
  app.use(
    express.static(publicDir, {
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          // A cached index.html can reference a bundle that no longer exists
          // after a redeploy, which leaves the login page blank.
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          // Vite hashes asset filenames, so these are safe to cache forever.
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    if (req.path.startsWith('/assets/')) return res.status(404).end('Asset not found');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .catch((err) => console.error('MongoDB connection failed:', err.message))
  .finally(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`LoanTrack listening on :${PORT}`));
  });

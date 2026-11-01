import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import healthHandler from './api/health';
import featuresHandler from './api/features';
import predictHandler from './api/predict';
import configHandler from './api/config';
import colabTemplateHandler from './api/colab-template';
import apiIndexHandler from './api/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Mount API handlers
app.all(['/api/health', '/health'], healthHandler);
app.all(['/api/features', '/features'], featuresHandler);
app.all(['/api/predict', '/predict'], predictHandler);
app.all(['/api/config', '/config'], configHandler);
app.all(['/api/colab-template', '/colab-template'], colabTemplateHandler);
app.all('/api', apiIndexHandler);

async function setupViteOrStatic() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

setupViteOrStatic().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
});

export default app;

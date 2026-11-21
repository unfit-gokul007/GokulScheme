import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import schemesRouter from './routes/schemes.js';
import matchRouter from './routes/match.js';
import chatRouter from './routes/chat.js';
import { isAiEnabled } from './services/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDevMode = process.argv.includes('--dev');
const PORT = isDevMode
  ? Number(process.env.API_PORT) || 5000
  : Number(process.env.PORT) || 5000;

// Allowed CORS origins (never wildcard *)
const configuredOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

if (process.env.APP_URL) {
  allowedOrigins.add(process.env.APP_URL.trim());
}

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server / Vite proxy requests without an Origin mismatch
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '100kb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiEnabled: isAiEnabled(),
  });
});

// Rate limiting strictly on /api/chat
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many assistant requests. Please wait a minute and try again.',
      },
    });
  },
});

app.use('/api/schemes', schemesRouter);
app.use('/api/match', matchRouter);
app.use('/api/chat', chatLimiter, chatRouter);

// Serve built client in production (when not running in --dev mode and client/dist exists)
const clientDistDir = path.resolve(__dirname, '../client/dist');
const clientIndexHtml = path.join(clientDistDir, 'index.html');
if (!isDevMode && fs.existsSync(clientIndexHtml)) {
  app.use(express.static(clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(clientIndexHtml);
  });
}

// Consistent JSON 404 for unknown API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    error: {
      code: 'API_NOT_FOUND',
      message: 'API endpoint not found.',
    },
  });
});

// Consistent JSON error handler (never log message contents or secrets)
app.use((err, _req, res, _next) => {
  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      error: { code: 'CORS_FORBIDDEN', message: 'Request origin is not permitted.' },
    });
  }
  return res.status(err?.status || 500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected server error occurred.',
    },
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GokulScheme AI API server listening on port ${PORT} (AI enabled: ${isAiEnabled()})`);
});

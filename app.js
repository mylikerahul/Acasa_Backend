/**
 * @fileoverview Express Server Configuration & Startup Module
 * @description Main entry point for ServEase Backend API.
 *
 * @author Rahul Sharma
 * @version 2.0.0
 * @license MIT
 *
 * OPTIMIZATIONS APPLIED:
 * 1. Non-blocking server start (listen first, then DB init)
 * 2. Lazy Swagger loading (only in dev, loaded after server starts)
 * 3. CORS origins as Set for O(1) lookup
 * 4. Compression disabled in production (handled by reverse proxy)
 * 5. Morgan disabled in production (use external logging)
 * 6. `initializeModels` runs in background after server is ready
 * 7. Removed redundant `app.options('*')` — cors() handles it
 * 8. `trust proxy` moved before routes
 * 9. `unhandledRejection` now triggers graceful shutdown
 * 10. Health check caches DB status for 10s to reduce DB load
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Local modules
import pool from './config/db.js';
import { initializeModels } from './config/initModels.js';
import { initializeRoutes } from './config/initRoutes.js';
import attachDB from './middleware/attachDB.js';
import errorMiddleware from './middleware/error.js';

// Load env vars first — before anything else
dotenv.config();

// ─── Constants ────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT     = parseInt(process.env.PORT, 10) || 8080;
const HOST     = '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD  = NODE_ENV === 'production';

const BASE_URL = process.env.RENDER_EXTERNAL_URL
  || process.env.BASE_URL
  || `http://localhost:${PORT}`;

// ─── Logger ───────────────────────────────────────────────────────────────────

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const DEFAULT_LOG_LEVEL = IS_PROD ? 'warn' : 'info';
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS[DEFAULT_LOG_LEVEL];

const log = {
  error:   (msg, ...a) => currentLogLevel >= LOG_LEVELS.error && console.error(`[ERROR] ${msg}`, ...a),
  warn:    (msg, ...a) => currentLogLevel >= LOG_LEVELS.warn  && console.warn(`[WARN]  ${msg}`, ...a),
  info:    (msg, ...a) => currentLogLevel >= LOG_LEVELS.info  && console.log(`[INFO]  ${msg}`, ...a),
  success: (msg, ...a) => currentLogLevel >= LOG_LEVELS.info  && console.log(`[OK]    ${msg}`, ...a),
};

// ─── CORS ─────────────────────────────────────────────────────────────────────

// Set for O(1) lookup instead of Array.includes() O(n) on every request
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://new.acasa.ae',
  'https://acasa.ae',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
]);

// Compiled once — not on every request
const DEV_LOCAL_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):\d+$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and known origins
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      return callback(null, true);
    }
    // In dev, also allow any local network address
    if (!IS_PROD && DEV_LOCAL_ORIGIN_REGEX.test(origin)) {
      log.warn(`Allowing local dev origin: ${origin}`);
      return callback(null, true);
    }
    log.warn(`Blocked origin: ${origin}`);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
  exposedHeaders: ['Content-Disposition', 'Set-Cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400, // Browser caches preflight for 24h → fewer OPTIONS requests
};

// ─── Helmet ───────────────────────────────────────────────────────────────────

const helmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy: IS_PROD ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", BASE_URL],
    },
  } : false,
};

// ─── App Setup ────────────────────────────────────────────────────────────────

const app    = express();
const server = createServer(app);

// Trust proxy FIRST — before any rate limiting or IP-based middleware
app.set('trust proxy', 1);

// Security
app.use(helmet(helmetOptions));
app.use(cors(corsOptions));
// Note: cors() middleware already handles OPTIONS preflight — no need for app.options('*')

// OPTIMIZATION: Skip compression in production.
// Render/Nginx/CDN handles this at the edge — much more efficient than Node doing it.
// In dev, it's still useful to test compressed responses.
if (!IS_PROD) {
  const { default: compression } = await import('compression');
  app.use(compression());
}

// OPTIMIZATION: Morgan only in dev. In production use structured logging (Render logs / Sentry).
if (!IS_PROD && currentLogLevel >= LOG_LEVELS.info) {
  const { default: morgan } = await import('morgan');
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: IS_PROD ? '7d' : 0, // Cache static files in prod
  etag: true,
}));

// Attach DB to every request
app.use(attachDB);

// ─── Core Routes ──────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    message: 'ServEase Backend API',
    version: '2.0.0',
    documentation: `${BASE_URL}/api-docs`,
    health: `${BASE_URL}/health`,
  });
});

// Health check with simple in-memory cache to avoid hammering DB
// on every uptime ping (UptimeRobot, Render health checks, etc.)
let healthCache = { result: null, at: 0 };
const HEALTH_CACHE_TTL = 10_000; // 10 seconds

app.get('/health', async (_req, res) => {
  const now = Date.now();

  // Serve cached response if fresh
  if (healthCache.result && (now - healthCache.at) < HEALTH_CACHE_TTL) {
    return res.status(healthCache.result.status === 'OK' ? 200 : 503).json(healthCache.result);
  }

  const payload = {
    status: 'OK',
    service: 'ServEase API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  };

  try {
    const t0 = Date.now();
    await pool.query('SELECT 1');
    payload.database = { status: 'connected', responseTime: `${Date.now() - t0}ms` };
    healthCache = { result: payload, at: now };
    res.status(200).json(payload);
  } catch (err) {
    payload.status = 'ERROR';
    payload.database = { status: 'disconnected', error: err.message };
    healthCache = { result: payload, at: now };
    log.error('Health check DB error:', err.message);
    res.status(503).json(payload);
  }
});

// OPTIMIZATION: Swagger only in dev — swagger-jsdoc scans all route files on startup (slow!)
if (!IS_PROD) {
  const [{ default: swaggerJsdoc }, { default: swaggerUi }] = await Promise.all([
    import('swagger-jsdoc'),
    import('swagger-ui-express'),
  ]);

  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: { title: 'ServEase API', version: '2.0.0', description: 'ServEase Backend API Documentation' },
      servers: [{ url: BASE_URL, description: 'Development Server' }],
    },
    apis: [
      path.resolve(__dirname, './routes/*.js'),
      path.resolve(__dirname, './controllers/*.js'),
    ],
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  log.info(`API Docs : ${BASE_URL}/api-docs`);
}

// Application routes
initializeRoutes(app, { silent: currentLogLevel < LOG_LEVELS.info });

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorMiddleware);

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log.warn(`${signal} received — shutting down gracefully...`);

  // Stop accepting new connections
  server.close(async () => {
    log.info('HTTP server closed');
    try {
      await pool.closePool();
      log.info('DB connections closed');
      log.success('Shutdown complete');
      process.exit(0);
    } catch (err) {
      log.error('Error during shutdown:', err.message);
      process.exit(1);
    }
  });

  // Force kill after 30s if graceful shutdown hangs
  setTimeout(() => {
    log.error('Forced shutdown — timeout exceeded');
    process.exit(1);
  }, 30_000).unref(); // .unref() so this timer doesn't keep the process alive unnecessarily
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  log.error('Uncaught Exception:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

// FIXED: Was missing shutdown call — unhandled rejections should also trigger shutdown
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
  shutdown('UNHANDLED_REJECTION');
});

// ─── Server Startup ───────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    log.info('Starting ServEase Backend...');

    // OPTIMIZATION: Start listening FIRST, then initialize in background.
    // This way the server is ready to handle requests (like health checks)
    // while heavy initialization (models, etc.) happens asynchronously.
    server.listen(PORT, HOST, () => {
      log.info('════════════════════════════════════════');
      log.success('ServEase Backend Started');
      log.info('════════════════════════════════════════');
      log.info(`Environment : ${NODE_ENV}`);
      log.info(`Server      : ${BASE_URL}`);
      log.info(`Port        : ${PORT}`);
      log.info('════════════════════════════════════════');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        log.error(`Port ${PORT} is already in use`);
      } else {
        log.error(`Server error: ${err.message}`);
      }
      process.exit(1);
    });

    // OPTIMIZATION: Run heavy init AFTER server is already listening.
    // If these fail, log the error but don't crash the server —
    // the health check endpoint will reflect the degraded state.
    Promise.all([
      pool.query('SELECT 1')
        .then(() => log.success('Database connected'))
        .catch(err => log.error('DB connection failed:', err.message)),

      initializeModels({ silent: currentLogLevel < LOG_LEVELS.info })
        .then(() => log.success('Models initialized'))
        .catch(err => log.error('Model init failed:', err.message)),
    ]);

  } catch (err) {
    log.error('Fatal: Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
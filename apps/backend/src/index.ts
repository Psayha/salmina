/**
 * @file index.ts
 * @description Main application entry point
 * @author AI Assistant
 * @updated 2024-11-13
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { apiLimiter, authLimiter, orderLimiter } from './middleware/rateLimit.js';
import { sanitizeBody } from './middleware/sanitize.js';
import { logger } from './utils/logger.js';
import { prisma } from './database/prisma.service.js';
import { redis } from './database/redis.service.js';
import { setupGracefulShutdown } from './utils/gracefulShutdown.js';

// Import module routes
import { authRoutes } from './modules/auth/index.js';
import { userRoutes } from './modules/users/index.js';
import { productsRoutes } from './modules/products/index.js';
import { categoriesRoutes } from './modules/categories/index.js';
import { cartRoutes } from './modules/cart/index.js';
import { ordersRoutes } from './modules/orders/index.js';
import promocodesRoutes from './modules/promocodes/index.js';
import promotionsRoutes from './modules/promotions/index.js';
import legalRoutes from './modules/legal/index.js';
import { uploadRoutes } from './modules/upload/index.js';
import { statsRoutes } from './modules/stats/index.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy - required when running behind nginx or other reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(helmet());

// Compression middleware for response compression (gzip)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balance between speed and compression ratio
}));

// Request ID middleware for tracing
app.use(requestIdMiddleware);

// CORS configuration with multiple allowed origins
const allowedOrigins = [
  env.FRONTEND_URL,
  'https://salminashop.ru',
  'https://www.salminashop.ru',
  'http://localhost:3000', // Development
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {return callback(null, true);}

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// Increase body size limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Health check routes (no rate limiting)
app.use('/api', healthRoutes);

// API root
app.get('/api', (_req, res) => {
  res.json({
    name: 'Telegram Shop API',
    version: '1.1.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      promocodes: '/api/promocodes',
      promotions: '/api/promotions',
      legal: '/api/legal',
      webhooks: '/webhooks',
    },
  });
});

// Mount module routes with specific rate limits and sanitization

// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', sanitizeBody, productsRoutes);
app.use('/api/categories', sanitizeBody, categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderLimiter, ordersRoutes);
app.use('/api/promocodes', promocodesRoutes);
app.use('/api/promotions', sanitizeBody, promotionsRoutes);
app.use('/api/legal', sanitizeBody, legalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/webhooks', webhooksRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await prisma.connect();

    // Connect to Redis
    await redis.getClient();

    // Start listening
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api`);
      logger.info('💪 Optimizations enabled: compression, rate limiting, request tracing');
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

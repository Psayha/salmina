/**
 * @file index.ts
 * @description Main application entry point
 * @author AI Assistant
 * @updated 2024-11-13
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { logger } from './utils/logger.js';
import { prisma } from './database/prisma.service.js';
import { redis } from './database/redis.service.js';

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
import webhooksRoutes from './routes/webhooks.routes.js';

const app = express();

// Middleware
app.use(helmet());

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
      if (!origin) return callback(null, true);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Health check
app.get('/health', async (_req, res) => {
  const dbConnected = await checkDatabaseConnection();
  const redisConnected = redis.isReady();

  res.json({
    status: dbConnected && redisConnected ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? 'connected' : 'disconnected',
      redis: redisConnected ? 'connected' : 'disconnected',
    },
  });
});

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

// Mount module routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/promocodes', promocodesRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/legal', legalRoutes);
app.use('/webhooks', webhooksRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

/**
 * Check database connection
 */
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Close database connection
  await prisma.$disconnect();
  logger.info('Database connection closed');

  // Close Redis connection
  await redis.disconnect();
  logger.info('Redis connection closed');

  process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();


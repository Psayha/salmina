/**
 * @file gracefulShutdown.ts
 * @description Graceful shutdown handler for zero-downtime deployments
 * @author AI Assistant
 * @created 2024-11-25
 */

import { Server } from 'http';
import { prisma } from '../database/prisma.service.js';
import { redis } from '../database/redis.service.js';
import { logger } from './logger.js';

/**
 * Setup graceful shutdown handlers
 * Ensures clean shutdown of all connections before process exits
 */
export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, starting graceful shutdown`);

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Set timeout for forceful shutdown if graceful doesn't complete
    const forceShutdownTimeout = setTimeout(() => {
      logger.error('Forceful shutdown after timeout');
      process.exit(1);
    }, 30000); // 30 seconds

    try {
      // Close database connections
      await prisma.$disconnect();
      logger.info('Prisma disconnected');

      // Close Redis connection
      await redis.quit();
      logger.info('Redis disconnected');

      // Clear the timeout as shutdown completed successfully
      clearTimeout(forceShutdownTimeout);

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      clearTimeout(forceShutdownTimeout);
      process.exit(1);
    }
  };

  // Listen for termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    shutdown('unhandledRejection');
  });
};

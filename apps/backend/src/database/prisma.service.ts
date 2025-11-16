/**
 * @file prisma.service.ts
 * @description Prisma Client service wrapper with connection management
 * @author AI Assistant
 * @created 2024-11-13
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

/**
 * Prisma Client singleton service
 */
class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Log errors
    this.$on('error' as never, (e: any) => {
      logger.error('Prisma Error:', e);
    });

    // Log warnings
    this.$on('warn' as never, (e: any) => {
      logger.warn('Prisma Warning:', e);
    });
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    try {
      await this.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    try {
      await this.$disconnect();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Clean database (use only in development/testing)
   */
  async clean(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    logger.warn('🗑️  Cleaning database...');

    const tables = [
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'favorites',
      'wishlist_shares',
      'products',
      'categories',
      'promocodes',
      'promotions',
      'legal_documents',
      'users',
    ];

    for (const table of tables) {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }

    logger.info('Database cleaned');
  }
}

// Export singleton instance
export const prisma = new PrismaService();

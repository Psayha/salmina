/**
 * @file redis.service.ts
 * @description Redis client service for caching and session management
 * @author AI Assistant
 * @created 2024-11-13
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Redis Client singleton service
 */
class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  /**
   * Get Redis client instance
   */
  async getClient(): Promise<RedisClientType> {
    if (!this.client) {
      this.client = createClient({
        url: env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('❌ Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client connecting...');
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis Client ready');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        logger.warn('Redis Client reconnecting...');
        this.isConnected = false;
      });

      await this.client.connect();
    }

    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Set a value in Redis with optional TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = await this.getClient();
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  /**
   * Get a value from Redis
   */
  async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    return client.get(key);
  }

  /**
   * Delete a key from Redis
   */
  async del(key: string): Promise<void> {
    const client = await this.getClient();
    await client.del(key);
  }

  /**
   * Check if a key exists in Redis
   */
  async exists(key: string): Promise<boolean> {
    const client = await this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    const client = await this.getClient();
    await client.expire(key, seconds);
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    const client = await this.getClient();
    return client.ttl(key);
  }

  /**
   * Store object as JSON string
   */
  async setObject<T>(key: string, obj: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(obj), ttlSeconds);
  }

  /**
   * Get object from JSON string
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Increment a counter
   */
  async increment(key: string): Promise<number> {
    const client = await this.getClient();
    return client.incr(key);
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string): Promise<number> {
    const client = await this.getClient();
    return client.decr(key);
  }

  /**
   * Get keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    const client = await this.getClient();
    return client.keys(pattern);
  }

  /**
   * Delete keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    const client = await this.getClient();
    return client.del(keys);
  }

  /**
   * Flush all keys (use with caution!)
   */
  async flushAll(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot flush Redis in production');
    }
    const client = await this.getClient();
    await client.flushAll();
    logger.warn('🗑️  Redis flushed');
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }
}

// Export singleton instance
export const redis = new RedisService();

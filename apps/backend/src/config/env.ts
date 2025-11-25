/**
 * @file env.ts
 * @description Environment configuration with Zod validation
 * @author AI Assistant
 * @updated 2024-11-25
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variables schema with Zod validation
 * Provides type safety and runtime validation
 */
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).default('3001'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3001'),

  // Database (required in production)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT (required in production)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Telegram (required in production)
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  TELEGRAM_BOT_USERNAME: z.string().optional(),

  // Prodamus Payment Gateway
  PRODAMUS_PAYMENT_FORM_URL: z.string().url().optional().or(z.literal('')),
  PRODAMUS_SECRET_KEY: z.string().optional().or(z.literal('')),

  // Admin
  ADMIN_TELEGRAM_IDS: z.string().optional(),

  // Security
  BCRYPT_ROUNDS: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(4).max(12)).default('10'),
});

/**
 * Validate and parse environment variables
 * Throws descriptive error if validation fails
 */
const validateEnv = () => {
  try {
    const parsed = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      FRONTEND_URL: process.env.FRONTEND_URL,
      API_URL: process.env.API_URL,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
      PRODAMUS_PAYMENT_FORM_URL: process.env.PRODAMUS_PAYMENT_FORM_URL,
      PRODAMUS_SECRET_KEY: process.env.PRODAMUS_SECRET_KEY,
      ADMIN_TELEGRAM_IDS: process.env.ADMIN_TELEGRAM_IDS,
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
    });

    return {
      ...parsed,
      ADMIN_TELEGRAM_IDS: parsed.ADMIN_TELEGRAM_IDS?.split(',').filter(Boolean) || [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
};

export const env = validateEnv();
export type Env = typeof env;


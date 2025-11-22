import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:3001',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME || '',

  // Prodamus Payment Gateway
  PRODAMUS_PAYMENT_FORM_URL: process.env.PRODAMUS_PAYMENT_FORM_URL || '',
  PRODAMUS_SECRET_KEY: process.env.PRODAMUS_SECRET_KEY || '',

  // Admin
  ADMIN_TELEGRAM_IDS: process.env.ADMIN_TELEGRAM_IDS?.split(',') || [],

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
} as const;

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'TELEGRAM_BOT_TOKEN',
] as const;

if (env.NODE_ENV === 'production') {
  for (const varName of requiredEnvVars) {
    if (!env[varName as keyof typeof env]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
}


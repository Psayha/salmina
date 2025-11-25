/**
 * @file health.routes.ts
 * @description Health check endpoints for monitoring and uptime checks
 * @author AI Assistant
 * @created 2024-11-25
 */

import { Router } from 'express';
import { asyncHandler } from '../types/express.js';
import { prisma } from '../database/prisma.service.js';
import { redis } from '../database/redis.service.js';

const router: Router = Router();

interface HealthCheck {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'ok' | 'error' | 'unknown';
    redis: 'ok' | 'error' | 'unknown';
  };
  version?: string;
}

/**
 * GET /health - Basic health check
 * Returns 200 if server is responsive
 */
router.get('/health', asyncHandler(async (_req, res) => {
  const health: HealthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
    },
    version: process.env.npm_package_version || '1.1.0',
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'ok';
  } catch (error) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Check Redis connection
  try {
    const client = await redis.getClient();
    await client.ping();
    health.checks.redis = 'ok';
  } catch (error) {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }

  // Return appropriate status code
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
}));

/**
 * GET /health/liveness - Kubernetes liveness probe
 * Returns 200 if process is alive
 */
router.get('/health/liveness', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * GET /health/readiness - Kubernetes readiness probe
 * Returns 200 if ready to accept traffic
 */
router.get('/health/readiness', asyncHandler(async (_req, res) => {
  try {
    // Check if database is accessible
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Database not accessible' });
  }
}));

export default router;

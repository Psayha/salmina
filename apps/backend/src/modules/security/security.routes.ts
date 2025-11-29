/**
 * @file security.routes.ts
 * @description Security monitoring API routes (admin only)
 */

import { Router } from 'express';
import { asyncHandler } from '../../types/express.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { securityService } from './security.service.js';

const router: Router = Router();

// All security routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/security/fail2ban - Get fail2ban status and banned IPs
 */
router.get('/fail2ban', asyncHandler(async (_req, res) => {
  const status = await securityService.getFail2banStatus();
  res.json({ success: true, data: status });
}));

/**
 * GET /api/security/firewall - Get UFW firewall status
 */
router.get('/firewall', asyncHandler(async (_req, res) => {
  const status = await securityService.getFirewallStatus();
  res.json({ success: true, data: status });
}));

/**
 * GET /api/security/status - Get full security status
 */
router.get('/status', asyncHandler(async (_req, res) => {
  const [fail2ban, firewall] = await Promise.all([
    securityService.getFail2banStatus(),
    securityService.getFirewallStatus(),
  ]);

  res.json({
    success: true,
    data: {
      fail2ban,
      firewall,
    },
  });
}));

export default router;

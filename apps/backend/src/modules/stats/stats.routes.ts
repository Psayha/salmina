/**
 * @file stats.routes.ts
 * @description Stats routes
 */

import { Router } from 'express';
import { getStats } from './stats.controller.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';

const router: Router = Router();

// Stats routes require authentication AND admin role
router.use(authenticate);
router.use(requireAdmin);

// Get stats
router.get('/', getStats);

export default router;

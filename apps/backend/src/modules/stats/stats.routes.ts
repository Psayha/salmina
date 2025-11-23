/**
 * @file stats.routes.ts
 * @description Stats routes
 */

import { Router } from 'express';
import { getStats } from './stats.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router: Router = Router();

// Stats routes require authentication
router.use(authenticate);

// Get stats
router.get('/', getStats);

export default router;

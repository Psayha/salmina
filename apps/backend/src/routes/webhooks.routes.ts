/**
 * @file webhooks.routes.ts
 * @description Routes for webhook handlers
 */

import express, { Router } from 'express';
import { webhooksController } from '../controllers/webhooks.controller.js';

const router: Router = express.Router();

/**
 * POST /webhooks/prodamus
 * Handle Prodamus payment notification webhook
 *
 * @returns {void} 200 OK on success
 */
router.post('/prodamus', (req, res) => webhooksController.handleProdamusWebhook(req, res));

export default router;

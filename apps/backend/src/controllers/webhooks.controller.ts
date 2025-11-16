/**
 * @file webhooks.controller.ts
 * @description Webhook handlers for external integrations
 */

import { Request, Response } from 'express';
import { prodamusService, ProdamusWebhookData } from '../services/prodamus.service.js';
import { ordersService } from '../modules/orders/orders.service.js';
import { logger } from '../utils/logger.js';

class WebhooksController {
  /**
   * Handle Prodamus payment webhook
   *
   * POST /webhooks/prodamus
   */
  async handleProdamusWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData: ProdamusWebhookData = req.body;

      logger.info('Received Prodamus webhook', {
        orderNumber: webhookData.order_num,
        paymentStatus: webhookData.payment_status,
      });

      // Verify webhook signature
      const isValid = prodamusService.verifyWebhookSignature(webhookData);

      if (!isValid) {
        logger.error('Invalid webhook signature', { orderNumber: webhookData.order_num });
        res.status(403).json({ error: 'Invalid signature' });
        return;
      }

      // Check if payment is successful
      const isPaymentSuccessful = prodamusService.isPaymentSuccessful(webhookData);

      if (!isPaymentSuccessful) {
        logger.info('Payment not successful', {
          orderNumber: webhookData.order_num,
          status: webhookData.payment_status,
        });
        res.status(200).send('OK');
        return;
      }

      // Update order payment status
      const order = await ordersService.confirmPayment(webhookData.order_num);

      logger.info('Payment confirmed successfully', {
        orderNumber: order.orderNumber,
        orderId: order.id,
      });

      // Return 200 OK to acknowledge webhook
      res.status(200).send('OK');
    } catch (error) {
      logger.error('Error processing Prodamus webhook:', error);

      // Return 200 to prevent retries for unrecoverable errors
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(200).send('OK');
        return;
      }

      // Return 500 for recoverable errors (Prodamus will retry)
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const webhooksController = new WebhooksController();

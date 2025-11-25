/**
 * @file orders.routes.ts
 */

import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/validation.middleware.js';
import { createOrderSchema, updateOrderStatusSchema, getOrderSchema, getOrdersSchema } from './orders.validation.js';

const router: Router = Router();

router.post('/', authenticate, validate(createOrderSchema), ordersController.createOrder.bind(ordersController));
router.get('/', authenticate, validate(getOrdersSchema), ordersController.getUserOrders.bind(ordersController));
router.get('/all', authenticate, requireAdmin, validate(getOrdersSchema), ordersController.getAllOrders.bind(ordersController));
router.get('/:id', authenticate, validate(getOrderSchema), ordersController.getOrderById.bind(ordersController));
router.patch('/:id/status', authenticate, requireAdmin, validate(updateOrderStatusSchema), ordersController.updateOrderStatus.bind(ordersController));
router.post('/:id/cancel', authenticate, validate(getOrderSchema), ordersController.cancelOrder.bind(ordersController));

export default router;

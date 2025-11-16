/**
 * @file orders.controller.ts
 * @description HTTP handlers for orders
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/middleware/auth.middleware.js';
import { ordersService } from './orders.service.js';
import { CreateOrderInput, UpdateOrderStatusInput } from './orders.validation.js';
import { OrderStatus } from './orders.types.js';

class OrdersController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const data: CreateOrderInput = req.body;
      const order = await ordersService.createOrder(userId, data);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await ordersService.getUserOrders(userId, page, limit);
      res.json({ success: true, data: result.orders, total: result.total, page, limit });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.role === 'ADMIN' ? undefined : req.user?.userId;
      const order = await ordersService.getOrderById(id, userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateOrderStatusInput = req.body;
      const order = await ordersService.updateOrderStatus(id, data);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const order = await ordersService.cancelOrder(id, userId);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus | undefined;
      const result = await ordersService.getAllOrders(page, limit, status);
      res.json({ success: true, data: result.orders, total: result.total, page, limit });
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();

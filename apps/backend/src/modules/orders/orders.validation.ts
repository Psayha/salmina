/**
 * @file orders.validation.ts
 * @description Validation schemas for orders module
 */

import { z } from 'zod';
import { OrderStatus, PaymentMethod } from './orders.types.js';

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, 'Name too short').max(100, 'Name too long'),
    customerPhone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
    customerEmail: z.string().email('Invalid email'),
    customerAddress: z.string().min(10, 'Address too short').max(500, 'Address too long'),
    comment: z.string().max(1000, 'Comment too long').optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    promocodeCode: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    trackingNumber: z.string().optional(),
  }),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid order ID'),
  }),
});

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];

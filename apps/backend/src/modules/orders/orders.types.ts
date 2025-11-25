/**
 * @file orders.types.ts
 * @description TypeScript types for orders module
 * @author AI Assistant
 * @created 2024-11-13
 */

import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Re-export enums for convenience
export { OrderStatus, PaymentMethod, PaymentStatus };

/**
 * Order model interface
 */
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  comment: string | null;
  subtotal: Decimal;
  discount: Decimal;
  total: Decimal;
  promocodeId: string | null;
  promocodeDiscount: Decimal | null;
  trackingNumber: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
}

/**
 * OrderItem model interface
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productArticle: string;
  productImage: string;
  basePrice: Decimal;
  appliedPrice: Decimal;
  hadPromotion: boolean;
  quantity: number;
  createdAt: Date;
}

/**
 * Order with items
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  comment: string | null;
  subtotal: number;
  discount: number;
  total: number;
  promocodeDiscount: number | null;
  trackingNumber: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  items: OrderItemDTO[];
  paymentUrl?: string; // Payment link for online payment
}

export interface OrderItemDTO {
  id: string;
  productName: string;
  productArticle: string;
  productImage: string;
  basePrice: number;
  appliedPrice: number;
  hadPromotion: boolean;
  quantity: number;
  subtotal: number;
}

export interface CreateOrderDTO {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  comment?: string;
  paymentMethod: PaymentMethod;
  promocodeCode?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  trackingNumber?: string;
}

export function toOrderDTO(order: OrderWithItems): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    customerAddress: order.customerAddress,
    comment: order.comment,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    promocodeDiscount: order.promocodeDiscount ? Number(order.promocodeDiscount) : null,
    trackingNumber: order.trackingNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt,
    shippedAt: order.shippedAt,
    items: order.items.map((item: OrderItem): OrderItemDTO => ({
      id: item.id,
      productName: item.productName,
      productArticle: item.productArticle,
      productImage: item.productImage,
      basePrice: Number(item.basePrice),
      appliedPrice: Number(item.appliedPrice),
      hadPromotion: item.hadPromotion,
      quantity: item.quantity,
      subtotal: Number(item.appliedPrice) * item.quantity,
    })),
  };
}

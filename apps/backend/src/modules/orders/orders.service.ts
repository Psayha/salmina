/**
 * @file orders.service.ts
 * @description Business logic for orders
 */

import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors/AppError.js';
import { logger } from '../../utils/logger.js';
import { telegramService } from '../../services/telegram.service.js';
import { prodamusService } from '../../services/prodamus.service.js';
// import { cartService } from '../cart/cart.service.js'; // unused
import { CreateOrderDTO, UpdateOrderStatusDTO, OrderDTO, toOrderDTO, OrderStatus, PaymentStatus, OrderItem } from './orders.types.js';
import { CartItemWithProduct } from '../cart/cart.types.js';

class OrdersService {
  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create order from cart
   */
  async createOrder(userId: string, data: CreateOrderDTO): Promise<OrderDTO> {
    logger.info('Creating order', { userId });

    // Get cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        throw new BadRequestError(`Insufficient stock for ${item.product.name}`);
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum: number, item: CartItemWithProduct) => sum + Number(item.appliedPrice) * item.quantity, 0);
    const discount = cart.items.reduce((sum: number, item: CartItemWithProduct) => {
      const diff = Number(item.price) - Number(item.appliedPrice);
      return sum + diff * item.quantity;
    }, 0);

    let promocodeDiscount = 0;
    let promocodeId: string | undefined;

    // Validate and apply promocode
    if (data.promocodeCode) {
      const promocode = await prisma.promocode.findFirst({
        where: {
          code: data.promocodeCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
        },
      });

      if (!promocode) {
        throw new BadRequestError('Invalid or expired promocode');
      }

      if (promocode.maxUses && promocode.usedCount >= promocode.maxUses) {
        throw new BadRequestError('Promocode usage limit reached');
      }

      if (promocode.minOrderAmount && subtotal < Number(promocode.minOrderAmount)) {
        throw new BadRequestError(`Minimum order amount: ${promocode.minOrderAmount}`);
      }

      if (promocode.discountType === 'PERCENT') {
        promocodeDiscount = (subtotal * Number(promocode.discountValue)) / 100;
      } else {
        promocodeDiscount = Number(promocode.discountValue);
      }

      promocodeId = promocode.id;
    }

    const total = subtotal - promocodeDiscount;
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
          status: data.paymentMethod === 'ONLINE' ? OrderStatus.PAID : OrderStatus.PAID,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
          paymentStatus: data.paymentMethod === 'ONLINE' ? PaymentStatus.PENDING : data.paymentMethod === 'SBP' ? PaymentStatus.PENDING : PaymentStatus.PAID,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          customerAddress: data.customerAddress,
          comment: data.comment || null,
          subtotal,
          discount,
          total,
          promocodeDiscount: promocodeDiscount || null,
          promocodeId: promocodeId || null,
          paymentMethod: data.paymentMethod,
        },
        include: {
          items: true,
        },
      });

      // Create order items
      for (const cartItem of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: cartItem.productId,
            productName: cartItem.product.name,
            productArticle: cartItem.product.article,
            productImage: cartItem.product.images[0] || '',
            basePrice: cartItem.price,
            appliedPrice: cartItem.appliedPrice,
            hadPromotion: cartItem.hasPromotion,
            quantity: cartItem.quantity,
          },
        });

        // Decrease product quantity
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            quantity: { decrement: cartItem.quantity },
            orderCount: { increment: 1 },
          },
        });
      }

      // Update promocode usage
      if (promocodeId) {
        await tx.promocode.update({
          where: { id: promocodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: { items: true },
      });
    });

    if (!order) {
      throw new Error('Order creation failed');
    }

    logger.info(`Order created: ${order.orderNumber}`);

    // Generate payment link for ONLINE payment method
    let paymentUrl: string | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (data.paymentMethod === 'ONLINE') {
      try {
        paymentUrl = prodamusService.generatePaymentLink({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail || undefined,
          customerPhone: order.customerPhone || undefined,
          products: order.items.map((item: OrderItem) => ({
            name: item.productName,
            price: Number(item.appliedPrice),
            quantity: item.quantity,
          })),
          successUrl: `${process.env.FRONTEND_URL}/orders/${order.id}?payment=success`,
          failUrl: `${process.env.FRONTEND_URL}/orders/${order.id}?payment=failed`,
          callbackUrl: `${process.env.API_URL}/webhooks/prodamus`,
        });

        logger.info(`Payment link generated for order ${order.orderNumber}: ${paymentUrl}`);
      } catch (error) {
        logger.error('Failed to generate payment link:', error);
        // Don't fail the order creation if payment link generation fails
      }
    }

    // Send notification to admin
    try {
      await telegramService.notifyNewOrder({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: Number(order.total),
        items: order.items.map((item: OrderItem) => ({
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.appliedPrice),
        })),
      });
    } catch (error) {
      logger.error('Failed to send order notification:', error);
      // Don't fail the order creation if notification fails
    }

    const orderDTO = toOrderDTO(order);

    // Add payment URL to response
    if (paymentUrl) {
      orderDTO.paymentUrl = paymentUrl;
    }

    return orderDTO;
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string, page = 1, limit = 20): Promise<{ orders: OrderDTO[]; total: number }> {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders: orders.map(toOrderDTO),
      total,
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string, userId?: string): Promise<OrderDTO> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundError('Order', orderId);
    }

    return toOrderDTO(order);
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    // Validate status transition
    if (data.status === OrderStatus.SHIPPED && !data.trackingNumber) {
      throw new BadRequestError('Tracking number required for SHIPPED status');
    }

    const updateData: any = {
      status: data.status,
      ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
    };

    if (data.status === OrderStatus.SHIPPED && !order.shippedAt) {
      updateData.shippedAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true, user: true },
    });

    logger.info(`Order status updated: ${orderId} -> ${data.status}`);

    // Send notification to customer
    try {
      await telegramService.notifyOrderStatus({
        telegramId: Number(updated.user.telegramId),
        orderNumber: updated.orderNumber,
        status: updated.status,
        trackingNumber: updated.trackingNumber || undefined,
      });
    } catch (error) {
      logger.error('Failed to send status update notification:', error);
    }

    return toOrderDTO(updated);
  }

  /**
   * Cancel order (user only before PROCESSING)
   */
  async cancelOrder(orderId: string, userId: string): Promise<OrderDTO> {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });

    if (!order) {
      throw new NotFoundError('Order', orderId);
    }

    if (order.userId !== userId) {
      throw new NotFoundError('Order', orderId);
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestError('Can only cancel orders in PAID status');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true },
    });

    logger.info(`Order cancelled: ${orderId}`);
    return toOrderDTO(updated);
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(page = 1, limit = 20, status?: OrderStatus): Promise<{ orders: OrderDTO[]; total: number }> {
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map(toOrderDTO),
      total,
    };
  }

  /**
   * Confirm payment (webhook callback)
   */
  async confirmPayment(orderNumber: string): Promise<OrderDTO> {
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: { items: true, user: true },
    });

    if (!order) {
      throw new NotFoundError('Order', orderNumber);
    }

    // Update payment status if it was pending
    if (order.paymentStatus === PaymentStatus.PENDING) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        },
        include: { items: true },
      });

      logger.info(`Payment confirmed for order ${orderNumber}`);

      // Send notification to customer about successful payment
      try {
        await telegramService.notifyOrderStatus({
          telegramId: Number(order.user.telegramId),
          orderNumber: updated.orderNumber,
          status: updated.status,
          trackingNumber: undefined,
        });
      } catch (error) {
        logger.error('Failed to send payment confirmation notification:', error);
      }

      return toOrderDTO(updated);
    }

    // Order already paid
    logger.info(`Order ${orderNumber} already marked as paid`);
    return toOrderDTO(order);
  }
}

export const ordersService = new OrdersService();

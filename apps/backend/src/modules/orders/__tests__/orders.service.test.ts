/**
 * @file orders.service.test.ts
 * @description Unit tests for OrdersService
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('OrdersService', () => {
  // Mock data
  const mockUser = {
    id: 'user-1',
    telegramId: BigInt(123456789),
  };

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    article: 'TEST-001',
    price: 1000,
    quantity: 10,
    images: ['https://example.com/image.jpg'],
    orderCount: 0,
  };

  const mockCartItem = {
    id: 'cart-item-1',
    cartId: 'cart-1',
    productId: 'product-1',
    quantity: 2,
    price: 1000,
    appliedPrice: 900,
    hasPromotion: true,
    product: mockProduct,
  };

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    items: [mockCartItem],
  };

  const mockPromocode = {
    id: 'promo-1',
    code: 'SAVE10',
    discountType: 'PERCENT',
    discountValue: 10,
    isActive: true,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31'),
    usedCount: 0,
    maxUses: 100,
    minOrderAmount: null,
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-12345678-9012',
    userId: 'user-1',
    status: 'PAID',
    paymentStatus: 'PENDING',
    customerName: 'Иван Иванов',
    customerPhone: '+79991234567',
    customerEmail: 'test@example.com',
    customerAddress: 'Москва',
    subtotal: 1800,
    discount: 200,
    total: 1620,
    promocodeDiscount: 180,
    promocodeId: 'promo-1',
    paymentMethod: 'ONLINE',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock implementations
  let prismaMock: any;
  let telegramServiceMock: any;
  let prodamusServiceMock: any;
  let ordersService: any;

  beforeEach(async () => {
    // Create mocks
    prismaMock = {
      cart: {
        findFirst: jest.fn(),
      },
      promocode: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      orderItem: {
        create: jest.fn(),
      },
      product: {
        update: jest.fn(),
      },
      cartItem: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    telegramServiceMock = {
      notifyOrderCreated: jest.fn(),
      notifyOrderStatus: jest.fn(),
    };

    prodamusServiceMock = {
      generatePaymentLink: jest.fn(() => 'https://demo.payform.ru?payment_link'),
    };

    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    // Mock modules
    jest.unstable_mockModule('../../../database/prisma.service.js', () => ({
      prisma: prismaMock,
    }));

    jest.unstable_mockModule('../../../services/telegram.service.js', () => ({
      telegramService: telegramServiceMock,
    }));

    jest.unstable_mockModule('../../../services/prodamus.service.js', () => ({
      prodamusService: prodamusServiceMock,
    }));

    jest.unstable_mockModule('../../../utils/logger.js', () => ({
      logger: loggerMock,
    }));

    // Import after mocking
    const ordersModule = await import('../orders.service.js');
    ordersService = (ordersModule as any).ordersService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('createOrder', () => {
    const createOrderData = {
      customerName: 'Иван Иванов',
      customerPhone: '+79991234567',
      customerEmail: 'test@example.com',
      customerAddress: 'Москва, ул. Ленина, 1',
      paymentMethod: 'ONLINE' as const,
      comment: 'Доставить после 18:00',
    };

    it('должен создать заказ с товарами из корзины', async () => {
      // Arrange
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.order.create.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, items: [mockCartItem] });

      // Act
      const result = await ordersService.createOrder('user-1', createOrderData);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderNumber).toContain('ORD-');
      expect(prismaMock.cart.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('должен выбросить BadRequestError если корзина пустая', async () => {
      // Arrange
      prismaMock.cart.findFirst.mockResolvedValue({ ...mockCart, items: [] });

      // Act & Assert
      try {
        await ordersService.createOrder('user-1', createOrderData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('BadRequestError');
        expect(error.message).toBe('Cart is empty');
      }
    });

    it('должен выбросить BadRequestError при недостаточном количестве товара', async () => {
      // Arrange
      const lowStockCart = {
        ...mockCart,
        items: [
          {
            ...mockCartItem,
            quantity: 20,
            product: { ...mockProduct, quantity: 5 },
          },
        ],
      };
      prismaMock.cart.findFirst.mockResolvedValue(lowStockCart);

      // Act & Assert
      try {
        await ordersService.createOrder('user-1', createOrderData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('BadRequestError');
        expect(error.message).toContain('Insufficient stock');
      }
    });

    it('должен применить промокод при создании заказа', async () => {
      // Arrange
      const dataWithPromocode = {
        ...createOrderData,
        promocodeCode: 'SAVE10',
      };
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.promocode.findFirst.mockResolvedValue(mockPromocode);
      prismaMock.order.create.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, items: [mockCartItem] });

      // Act
      const result = await ordersService.createOrder('user-1', dataWithPromocode);

      // Assert
      expect(prismaMock.promocode.findFirst).toHaveBeenCalledWith({
        where: {
          code: 'SAVE10',
          isActive: true,
          validFrom: { lte: expect.any(Date) },
          validTo: { gte: expect.any(Date) },
        },
      });
      expect(result).toBeDefined();
    });

    it('должен выбросить BadRequestError при невалидном промокоде', async () => {
      // Arrange
      const dataWithPromocode = {
        ...createOrderData,
        promocodeCode: 'INVALID',
      };
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.promocode.findFirst.mockResolvedValue(null);

      // Act & Assert
      try {
        await ordersService.createOrder('user-1', dataWithPromocode);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('BadRequestError');
        expect(error.message).toBe('Invalid or expired promocode');
      }
    });

    it('должен выбросить BadRequestError если превышен лимит использования промокода', async () => {
      // Arrange
      const dataWithPromocode = {
        ...createOrderData,
        promocodeCode: 'SAVE10',
      };
      const usedPromocode = {
        ...mockPromocode,
        usedCount: 100,
        maxUses: 100,
      };
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.promocode.findFirst.mockResolvedValue(usedPromocode);

      // Act & Assert
      try {
        await ordersService.createOrder('user-1', dataWithPromocode);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('BadRequestError');
        expect(error.message).toBe('Promocode usage limit reached');
      }
    });

    it('должен генерировать payment link для ONLINE платежа', async () => {
      // Arrange
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.order.create.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, items: [mockCartItem] });

      // Act
      const result = await ordersService.createOrder('user-1', createOrderData);

      // Assert
      expect(prodamusServiceMock.generatePaymentLink).toHaveBeenCalledWith({
        orderNumber: expect.stringContaining('ORD-'),
        customerName: 'Иван Иванов',
        customerEmail: 'test@example.com',
        customerPhone: '+79991234567',
        products: expect.any(Array),
        successUrl: expect.stringContaining('/orders/'),
        failUrl: expect.stringContaining('/orders/'),
        callbackUrl: expect.stringContaining('/webhooks/prodamus'),
      });
      expect(result.paymentUrl).toBe('https://demo.payform.ru?payment_link');
    });

    it('должен уменьшить количество товара на складе', async () => {
      // Arrange
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.order.create.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, items: [mockCartItem] });

      // Act
      await ordersService.createOrder('user-1', createOrderData);

      // Assert
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: {
          quantity: { decrement: 2 },
          orderCount: { increment: 1 },
        },
      });
    });

    it('должен очистить корзину после создания заказа', async () => {
      // Arrange
      prismaMock.cart.findFirst.mockResolvedValue(mockCart);
      prismaMock.order.create.mockResolvedValue(mockOrder);
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, items: [mockCartItem] });

      // Act
      await ordersService.createOrder('user-1', createOrderData);

      // Assert
      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-1' },
      });
    });
  });

  describe('confirmPayment', () => {
    it('должен подтвердить оплату заказа', async () => {
      // Arrange
      const pendingOrder = {
        ...mockOrder,
        paymentStatus: 'PENDING',
        user: { telegramId: BigInt(123456789) },
      };
      prismaMock.order.findFirst.mockResolvedValue(pendingOrder);
      prismaMock.order.update.mockResolvedValue({
        ...pendingOrder,
        paymentStatus: 'PAID',
        paidAt: new Date(),
      });
      prismaMock.order.findUnique.mockResolvedValue({
        ...pendingOrder,
        paymentStatus: 'PAID',
        items: [],
      });

      // Act
      const result = await ordersService.confirmPayment('ORD-12345678-9012');

      // Assert
      expect(result.paymentStatus).toBe('PAID');
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: {
          paymentStatus: 'PAID',
          paidAt: expect.any(Date),
        },
        include: {
          items: true,
        },
      });
    });

    it('должен выбросить NotFoundError если заказ не найден', async () => {
      // Arrange
      prismaMock.order.findFirst.mockResolvedValue(null);

      // Act & Assert
      try {
        await ordersService.confirmPayment('INVALID-ORDER');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });
  });
});

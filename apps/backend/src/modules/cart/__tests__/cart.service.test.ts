/**
 * @file cart.service.test.ts
 * @description Unit tests for CartService
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('CartService', () => {
  // Mock data
  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    price: 1000,
    quantity: 10,
    isActive: true,
    hasPromotion: false,
    images: ['https://example.com/image.jpg'],
    article: 'TEST-001',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCart = {
    id: 'cart-1',
    userId: 'user-1',
    sessionToken: 'session-token-123',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

  const mockCartItem = {
    id: 'item-1',
    cartId: 'cart-1',
    productId: 'product-1',
    quantity: 2,
    price: 1000,
    appliedPrice: 1000,
    hasPromotion: false,
    allowPromocode: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: mockProduct,
  };

  // Mock implementations
  let prismaMock: any;
  let CartService: any;
  let cartService: any;

  beforeEach(async () => {
    // Create mocks
    prismaMock = {
      cart: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
      },
      cartItem: {
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };

    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const cryptoMock = {
      generateRandomToken: jest.fn(() => 'random-token-123'),
    };

    // Mock modules
    jest.unstable_mockModule('../../../database/prisma.service.js', () => ({
      prisma: prismaMock,
    }));

    jest.unstable_mockModule('../../../utils/logger.js', () => ({
      logger: loggerMock,
    }));

    jest.unstable_mockModule('../../../common/utils/crypto.js', () => cryptoMock);

    // Import after mocking - cart service exports singleton instance
    const cartModule = await import('../cart.service.js');
    cartService = (cartModule as any).cartService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('getOrCreateCart', () => {
    it('должен вернуть существующую корзину пользователя', async () => {
      // Arrange
      const existingCart = { ...mockCart, items: [mockCartItem] };
      prismaMock.cart.findFirst.mockResolvedValue(existingCart);

      // Act
      const result = await cartService.getOrCreateCart('user-1');

      // Assert
      expect(result).toEqual(existingCart);
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
      expect(prismaMock.cart.create).not.toHaveBeenCalled();
    });

    it('должен создать новую корзину если не найдена', async () => {
      // Arrange
      prismaMock.cart.findFirst.mockResolvedValue(null);
      const newCart = { ...mockCart, items: [] };
      prismaMock.cart.create.mockResolvedValue(newCart);

      // Act
      const result = await cartService.getOrCreateCart('user-1');

      // Assert
      expect(result).toEqual(newCart);
      expect(prismaMock.cart.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          sessionToken: 'random-token-123',
          expiresAt: expect.any(Date),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    it('должен найти корзину по sessionToken', async () => {
      // Arrange
      const sessionCart = { ...mockCart, userId: null, items: [] };
      prismaMock.cart.findUnique.mockResolvedValue(sessionCart);

      // Act
      const result = await cartService.getOrCreateCart(undefined, 'session-token-123');

      // Assert
      expect(result).toEqual(sessionCart);
      expect(prismaMock.cart.findUnique).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-123' },
        include: expect.any(Object),
      });
    });

    it('должен связать сессионную корзину с пользователем при входе', async () => {
      // Arrange
      const sessionCart = { ...mockCart, userId: null, items: [] };
      const linkedCart = { ...mockCart, items: [] };
      prismaMock.cart.findFirst.mockResolvedValue(null); // No cart by userId
      prismaMock.cart.findUnique.mockResolvedValue(sessionCart); // Found by sessionToken
      prismaMock.cart.update.mockResolvedValue(linkedCart); // Link to user

      // Act
      const result = await cartService.getOrCreateCart('user-1', 'session-token-123');

      // Assert
      expect(result).toEqual(linkedCart);
      expect(prismaMock.cart.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
      });
      expect(prismaMock.cart.findUnique).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-123' },
        include: expect.any(Object),
      });
      expect(prismaMock.cart.update).toHaveBeenCalledWith({
        where: { id: 'cart-1' },
        data: { userId: 'user-1' },
        include: expect.any(Object),
      });
      expect(prismaMock.cart.create).not.toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    it('должен добавить товар в корзину', async () => {
      // Arrange
      const emptyCart = { ...mockCart, items: [] };
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.cart.findFirst.mockResolvedValue(emptyCart);
      prismaMock.cartItem.create.mockResolvedValue(mockCartItem);

      // Act
      const result = await cartService.addToCart(
        { productId: 'product-1', quantity: 2 },
        'user-1'
      );

      // Assert
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(prismaMock.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-1',
          productId: 'product-1',
          quantity: 2,
          price: 1000,
          appliedPrice: 1000,
          hasPromotion: false,
          allowPromocode: true,
        },
      });
    });

    it('должен выбросить NotFoundError если товар не найден', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await cartService.addToCart({ productId: 'non-existent', quantity: 1 }, 'user-1');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });

    it('должен выбросить BadRequestError при недостаточном количестве товара', async () => {
      // Arrange
      const lowStockProduct = { ...mockProduct, quantity: 1 };
      prismaMock.product.findUnique.mockResolvedValue(lowStockProduct);

      // Act & Assert
      try {
        await cartService.addToCart({ productId: 'product-1', quantity: 5 }, 'user-1');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('BadRequestError');
        expect(error.message).toContain('Insufficient stock');
      }
    });

    it('должен обновить количество если товар уже в корзине', async () => {
      // Arrange
      const cartWithItem = {
        ...mockCart,
        items: [{ ...mockCartItem, quantity: 2 }],
      };
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.cart.findFirst.mockResolvedValue(cartWithItem);
      prismaMock.cartItem.update.mockResolvedValue({ ...mockCartItem, quantity: 4 });

      // Act
      await cartService.addToCart({ productId: 'product-1', quantity: 2 }, 'user-1');

      // Assert
      expect(prismaMock.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 4 },
      });
      expect(prismaMock.cartItem.create).not.toHaveBeenCalled();
    });
  });
});

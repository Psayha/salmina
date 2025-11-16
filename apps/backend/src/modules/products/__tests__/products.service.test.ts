/**
 * @file products.service.test.ts
 * @description Unit tests for ProductsService
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('ProductsService', () => {
  // Mock data
  const mockCategory = {
    id: 'category-1',
    name: 'Уход за кожей',
    slug: 'skin-care',
    description: 'Товары для ухода за кожей',
    image: 'https://example.com/category.jpg',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    slug: 'test-product',
    article: 'ART-001',
    sku: 'SKU-001',
    description: 'Test description',
    price: 1000,
    promotionPrice: null,
    discountPrice: null,
    quantity: 10,
    weight: 100,
    dimensions: null,
    composition: 'Test composition',
    delivery: 'Доставка 1-3 дня',
    characteristics: null,
    application: null,
    images: ['https://example.com/image1.jpg'],
    categoryId: 'category-1',
    category: mockCategory,
    isNew: false,
    isHit: false,
    isDiscount: false,
    hasPromotion: false,
    isActive: true,
    viewCount: 0,
    orderCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductWithPromotion = {
    ...mockProduct,
    id: 'product-2',
    slug: 'promo-product',
    hasPromotion: true,
    promotionPrice: 800,
  };

  // Mock implementations
  let prismaMock: any;
  let ProductsService: any;
  let productsService: any;

  beforeEach(async () => {
    // Create mocks
    prismaMock = {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: {
        findUnique: jest.fn(),
      },
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

    jest.unstable_mockModule('../../../utils/logger.js', () => ({
      logger: loggerMock,
    }));

    // Import after mocking
    const productsModule = await import('../products.service.js');
    ProductsService = productsModule.ProductsService;
    productsService = new ProductsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('getAllProducts', () => {
    it('должен вернуть список товаров с пагинацией', async () => {
      // Arrange
      const params = { page: 1, limit: 10 };
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      const result = await productsService.getAllProducts(params);

      // Assert
      expect(result).toBeDefined();
      expect(result.products).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 10,
        include: { category: true },
      });
    });

    it('должен применить фильтры при поиске', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        filters: { categoryId: 'category-1', isNew: true },
      };
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.getAllProducts(params);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'category-1',
            isNew: true,
            isActive: true,
          }),
        })
      );
    });

    it('должен применить текстовый поиск', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        query: 'test',
      };
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.getAllProducts(params);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'test', mode: 'insensitive' } },
              { description: { contains: 'test', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('должен применить сортировку по цене', async () => {
      // Arrange
      const params = {
        page: 1,
        limit: 10,
        sortBy: 'price' as const,
        order: 'asc' as const,
      };
      prismaMock.product.findMany.mockResolvedValue([mockProduct]);
      prismaMock.product.count.mockResolvedValue(1);

      // Act
      await productsService.getAllProducts(params);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ price: 'asc' }],
        })
      );
    });
  });

  describe('getProductBySlug', () => {
    it('должен вернуть товар по slug', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.update.mockResolvedValue({
        ...mockProduct,
        viewCount: 1,
      });

      // Act
      const result = await productsService.getProductBySlug('test-product');

      // Assert
      expect(result).toBeDefined();
      expect(result.slug).toBe('test-product');
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        include: { category: true },
      });
    });

    it('должен выбросить NotFoundError если товар не найден', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await productsService.getProductBySlug('non-existent');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });

    it('должен выбросить NotFoundError если товар неактивен', async () => {
      // Arrange
      const inactiveProduct = { ...mockProduct, isActive: false };
      prismaMock.product.findUnique.mockResolvedValue(inactiveProduct);

      // Act & Assert
      try {
        await productsService.getProductBySlug('test-product');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('getProductById', () => {
    it('должен вернуть товар по ID', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await productsService.getProductById('product-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('product-1');
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: { category: true },
      });
    });

    it('должен выбросить NotFoundError если товар не найден', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await productsService.getProductById('non-existent');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('getRelatedProducts', () => {
    it('должен вернуть похожие товары из той же категории', async () => {
      // Arrange
      const product2 = { ...mockProduct, id: 'product-2', slug: 'product-2' };
      const product3 = { ...mockProduct, id: 'product-3', slug: 'product-3' };

      prismaMock.product.findUnique.mockResolvedValue({
        categoryId: 'category-1',
        isActive: true,
      });
      prismaMock.product.findMany.mockResolvedValue([product2, product3]);

      // Act
      const result = await productsService.getRelatedProducts('product-1', 4);

      // Assert
      expect(result).toHaveLength(2);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'category-1',
            isActive: true,
            id: { not: 'product-1' },
          }),
          take: 4,
        })
      );
    });

    it('должен выбросить NotFoundError если товар не найден', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await productsService.getRelatedProducts('non-existent');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('createProduct', () => {
    const createProductData = {
      name: 'New Product',
      slug: 'new-product',
      article: 'ART-002',
      sku: 'SKU-002',
      description: 'New product description',
      price: 2000,
      quantity: 5,
      weight: 150,
      composition: 'Test composition',
      delivery: 'Доставка 1-3 дня',
      images: ['https://example.com/new.jpg'],
      categoryId: 'category-1',
    };

    it('должен создать новый товар', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue(mockCategory);
      prismaMock.product.findFirst.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue({
        ...mockProduct,
        ...createProductData,
      });

      // Act
      const result = await productsService.createProduct(createProductData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('New Product');
      expect(prismaMock.product.create).toHaveBeenCalled();
    });

    it('должен выбросить NotFoundError если категория не найдена', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await productsService.createProduct(createProductData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });

    it('должен выбросить ConflictError если slug уже существует', async () => {
      // Arrange
      prismaMock.category.findUnique.mockResolvedValue(mockCategory);
      // validateUniqueFields finds existing product with same slug
      const existingWithSameSlug = {
        ...mockProduct,
        slug: createProductData.slug, // Same slug!
      };
      prismaMock.product.findFirst
        .mockResolvedValueOnce(existingWithSameSlug);

      // Act & Assert
      try {
        await productsService.createProduct(createProductData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('ConflictError');
      }
    });
  });

  describe('updateProduct', () => {
    const updateData = {
      name: 'Updated Product',
      price: 1500,
    };

    it('должен обновить товар', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateData,
      });

      // Act
      const result = await productsService.updateProduct('product-1', updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Product');
      expect(prismaMock.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'product-1' },
          data: expect.objectContaining(updateData),
        })
      );
    });

    it('должен выбросить NotFoundError если товар не найден', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await productsService.updateProduct('non-existent', updateData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });
  });

  describe('deleteProduct', () => {
    it('должен удалить товар (soft delete)', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      // Act
      await productsService.deleteProduct('product-1');

      // Assert
      expect(prismaMock.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'product-1' },
          data: expect.objectContaining({
            isActive: false,
          }),
        })
      );
    });

    it('должен выбросить NotFoundError если товар не найден', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await productsService.deleteProduct('non-existent');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('NotFoundError');
      }
    });
  });
});

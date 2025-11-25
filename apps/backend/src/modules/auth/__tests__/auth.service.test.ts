/**
 * @file auth.service.test.ts
 * @description Unit tests for AuthService
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { UserRole } from '@prisma/client';
import { UnauthorizedError, BadRequestError } from '../../../common/errors/AppError.js';

describe('AuthService', () => {
  // Mock data
  const mockTelegramUser = {
    id: 123456789,
    first_name: 'Иван',
    last_name: 'Иванов',
    username: 'ivan_test',
    photo_url: 'https://example.com/photo.jpg',
  };

  const mockUser = {
    id: 'user-uuid-123',
    telegramId: BigInt(123456789),
    username: 'ivan_test',
    firstName: 'Иван',
    lastName: 'Иванов',
    photoUrl: 'https://example.com/photo.jpg',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const mockTokenPayload = {
    userId: 'user-uuid-123',
    telegramId: '123456789',
    role: UserRole.USER,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  // Mock implementations
  let prismaMock: any;
  let redisMock: any;
  let cryptoMock: any;
  let telegramServiceMock: any;
  let AuthService: any;
  let authService: any;

  beforeEach(async () => {
    // Create mocks
    prismaMock = {
      user: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    cryptoMock = {
      validateTelegramInitData: jest.fn(),
      parseTelegramInitData: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
    };

    telegramServiceMock = {
      sendWelcomeMessage: jest.fn(),
    };

    const loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    // Mock env module with valid test values
    jest.unstable_mockModule('../../../config/env.js', () => ({
      env: {
        NODE_ENV: 'test',
        PORT: 3001,
        DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
        JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long',
        JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-at-least-32-characters-long',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        TELEGRAM_BOT_TOKEN: 'test-token',
        REDIS_URL: 'redis://localhost:6379',
        PRODAMUS_SECRET_KEY: 'test-secret',
      },
    }));

    // Mock modules
    jest.unstable_mockModule('../../../database/prisma.service.js', () => ({
      prisma: prismaMock,
    }));

    jest.unstable_mockModule('../../../database/redis.service.js', () => ({
      redis: redisMock,
    }));

    jest.unstable_mockModule('../../../common/utils/crypto.js', () => cryptoMock);

    jest.unstable_mockModule('../../../services/telegram.service.js', () => ({
      telegramService: telegramServiceMock,
    }));

    jest.unstable_mockModule('../../../utils/logger.js', () => ({
      logger: loggerMock,
    }));

    // Import after mocking
    const authModule = await import('../auth.service.js');
    AuthService = authModule.AuthService;
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('authenticateWithTelegram', () => {
    const validInitData = 'query_id=xxx&user=%7B%22id%22%3A123%7D&auth_date=1234567890&hash=valid';

    it('должен успешно аутентифицировать пользователя с валидными данными Telegram', async () => {
      // Arrange
      const currentTime = Math.floor(Date.now() / 1000);
      cryptoMock.validateTelegramInitData.mockReturnValue(true);
      cryptoMock.parseTelegramInitData.mockReturnValue({
        user: mockTelegramUser,
        auth_date: currentTime - 100,
      });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.upsert.mockResolvedValue(mockUser);
      cryptoMock.generateAccessToken.mockReturnValue(mockTokens.accessToken);
      cryptoMock.generateRefreshToken.mockReturnValue(mockTokens.refreshToken);
      redisMock.set.mockResolvedValue('OK');
      telegramServiceMock.sendWelcomeMessage.mockResolvedValue(undefined);

      // Act
      const result = await authService.authenticateWithTelegram(validInitData);

      // Assert
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        user: expect.objectContaining({
          id: mockUser.id,
          telegramId: mockUser.telegramId.toString(),
          firstName: mockUser.firstName,
        }),
      });
      expect(cryptoMock.validateTelegramInitData).toHaveBeenCalled();
      expect(prismaMock.user.upsert).toHaveBeenCalled();
      expect(redisMock.set).toHaveBeenCalled();
      expect(telegramServiceMock.sendWelcomeMessage).toHaveBeenCalledWith(
        mockTelegramUser.id,
        mockTelegramUser.first_name
      );
    });

    it('должен выбросить UnauthorizedError при невалидной подписи Telegram', async () => {
      // Arrange
      cryptoMock.validateTelegramInitData.mockReturnValue(false);

      // Act & Assert
      try {
        await authService.authenticateWithTelegram(validInitData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
        expect(error.message).toBe('Invalid Telegram authentication data');
      }
    });

    it('должен выбросить BadRequestError если не удалось распарсить данные', async () => {
      // Arrange
      cryptoMock.validateTelegramInitData.mockReturnValue(true);
      cryptoMock.parseTelegramInitData.mockReturnValue(null);

      // Act & Assert
      try {
        await authService.authenticateWithTelegram(validInitData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('BadRequestError');
      }
    });

    it('должен выбросить UnauthorizedError если auth_date слишком старый', async () => {
      // Arrange
      const oldAuthDate = Math.floor(Date.now() / 1000) - 90000;
      cryptoMock.validateTelegramInitData.mockReturnValue(true);
      cryptoMock.parseTelegramInitData.mockReturnValue({
        user: mockTelegramUser,
        auth_date: oldAuthDate,
      });

      // Act & Assert
      try {
        await authService.authenticateWithTelegram(validInitData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });

    it('должен выбросить UnauthorizedError если пользователь неактивен', async () => {
      // Arrange
      const currentTime = Math.floor(Date.now() / 1000);
      const inactiveUser = { ...mockUser, isActive: false };

      cryptoMock.validateTelegramInitData.mockReturnValue(true);
      cryptoMock.parseTelegramInitData.mockReturnValue({
        user: mockTelegramUser,
        auth_date: currentTime - 100,
      });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.upsert.mockResolvedValue(inactiveUser);

      // Act & Assert
      try {
        await authService.authenticateWithTelegram(validInitData);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });

    it('не должен отправлять welcome message существующему пользователю', async () => {
      // Arrange
      const currentTime = Math.floor(Date.now() / 1000);
      cryptoMock.validateTelegramInitData.mockReturnValue(true);
      cryptoMock.parseTelegramInitData.mockReturnValue({
        user: mockTelegramUser,
        auth_date: currentTime - 100,
      });
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.user.upsert.mockResolvedValue(mockUser);
      cryptoMock.generateAccessToken.mockReturnValue(mockTokens.accessToken);
      cryptoMock.generateRefreshToken.mockReturnValue(mockTokens.refreshToken);
      redisMock.set.mockResolvedValue('OK');

      // Act
      await authService.authenticateWithTelegram(validInitData);

      // Assert
      expect(telegramServiceMock.sendWelcomeMessage).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('должен успешно обновить access token', async () => {
      // Arrange
      cryptoMock.verifyRefreshToken.mockReturnValue(mockTokenPayload);
      redisMock.get.mockResolvedValue(mockTokens.refreshToken);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      cryptoMock.generateAccessToken.mockReturnValue('new-access-token');

      // Act
      const result = await authService.refreshAccessToken(mockTokens.refreshToken);

      // Assert
      expect(result).toEqual({
        accessToken: 'new-access-token',
        user: expect.objectContaining({
          id: mockUser.id,
        }),
      });
    });

    it('должен выбросить UnauthorizedError при невалидном токене', async () => {
      // Arrange
      cryptoMock.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      try {
        await authService.refreshAccessToken('invalid');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });

    it('должен выбросить UnauthorizedError если токен не найден в Redis', async () => {
      // Arrange
      cryptoMock.verifyRefreshToken.mockReturnValue(mockTokenPayload);
      redisMock.get.mockResolvedValue(null);

      // Act & Assert
      try {
        await authService.refreshAccessToken(mockTokens.refreshToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });

    it('должен выбросить UnauthorizedError если пользователь неактивен', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      cryptoMock.verifyRefreshToken.mockReturnValue(mockTokenPayload);
      redisMock.get.mockResolvedValue(mockTokens.refreshToken);
      prismaMock.user.findUnique.mockResolvedValue(inactiveUser);

      // Act & Assert
      try {
        await authService.refreshAccessToken(mockTokens.refreshToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });
  });

  describe('logout', () => {
    it('должен успешно выйти и удалить refresh token', async () => {
      // Arrange
      redisMock.del.mockResolvedValue(1);

      // Act
      const result = await authService.logout(mockUser.id);

      // Assert
      expect(result).toEqual({ success: true });
      expect(redisMock.del).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('должен успешно верифицировать валидный токен', async () => {
      // Arrange
      cryptoMock.verifyAccessToken.mockReturnValue(mockTokenPayload);
      prismaMock.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        isActive: true,
      });

      // Act
      const result = await authService.verifyToken(mockTokens.accessToken);

      // Assert
      expect(result).toEqual(mockTokenPayload);
    });

    it('должен выбросить UnauthorizedError при невалидном токене', async () => {
      // Arrange
      cryptoMock.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid');
      });

      // Act & Assert
      try {
        await authService.verifyToken('invalid');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });

    it('должен выбросить UnauthorizedError если пользователь не найден', async () => {
      // Arrange
      cryptoMock.verifyAccessToken.mockReturnValue(mockTokenPayload);
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await authService.verifyToken(mockTokens.accessToken);
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });
  });

  describe('getUserById', () => {
    it('должен вернуть пользователя по ID', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await authService.getUserById(mockUser.id);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('должен выбросить UnauthorizedError если не найден', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      try {
        await authService.getUserById('non-existent');
        throw new Error('Should have thrown');
      } catch (error: any) {
        expect(error.constructor.name).toBe('UnauthorizedError');
      }
    });
  });

  describe('revokeAllTokens', () => {
    it('должен отозвать все токены пользователя', async () => {
      // Arrange
      redisMock.del.mockResolvedValue(1);

      // Act
      await authService.revokeAllTokens(mockUser.id);

      // Assert
      expect(redisMock.del).toHaveBeenCalled();
    });
  });
});

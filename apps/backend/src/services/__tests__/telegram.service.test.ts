/**
 * @file telegram.service.test.ts
 * @description Unit tests for TelegramService
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('TelegramService', () => {
  // Mock implementations
  let axiosMock: any;
  let loggerMock: any;
  let telegramService: any;

  beforeEach(async () => {
    // Create axios mock
    axiosMock = {
      post: jest.fn().mockResolvedValue({ data: { ok: true } }),
    };

    // Create logger mock
    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    // Mock env
    const envMock = {
      TELEGRAM_BOT_TOKEN: 'test-bot-token',
    };

    // Mock modules
    jest.unstable_mockModule('axios', () => ({
      default: axiosMock,
    }));

    jest.unstable_mockModule('../../utils/logger.js', () => ({
      logger: loggerMock,
    }));

    jest.unstable_mockModule('../../config/env.js', () => ({
      env: envMock,
    }));

    // Set admin chat ID in process.env for tests
    process.env.TELEGRAM_ADMIN_CHAT_ID = '123456789';

    // Import after mocking
    const telegramModule = await import('../telegram.service.js');
    telegramService = telegramModule.telegramService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
  });

  describe('sendMessage', () => {
    it('должен отправить сообщение в Telegram', async () => {
      // Arrange
      const messageParams = {
        chat_id: 123456789,
        text: 'Test message',
        parse_mode: 'HTML' as const,
      };

      // Act
      await telegramService.sendMessage(messageParams);

      // Assert
      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        messageParams
      );
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Telegram message sent to chat 123456789'
      );
    });

    it('должен обработать ошибку при отправке', async () => {
      // Arrange
      const error = new Error('Network error');
      axiosMock.post.mockRejectedValueOnce(error);
      const messageParams = {
        chat_id: 123456789,
        text: 'Test message',
      };

      // Act & Assert
      try {
        await telegramService.sendMessage(messageParams);
        throw new Error('Should have thrown');
      } catch (err: any) {
        expect(err.message).toBe('Network error');
        expect(loggerMock.error).toHaveBeenCalledWith(
          'Failed to send Telegram message:',
          error
        );
      }
    });

    it('должен отправить с опциональными параметрами', async () => {
      // Arrange
      const messageParams = {
        chat_id: '987654321',
        text: 'Markdown message',
        parse_mode: 'Markdown' as const,
        disable_notification: true,
      };

      // Act
      await telegramService.sendMessage(messageParams);

      // Assert
      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        messageParams
      );
    });
  });

  describe('notifyNewOrder', () => {
    it('должен отправить уведомление о новом заказе админу', async () => {
      // Arrange
      const orderData = {
        orderNumber: 'ORD-001',
        customerName: 'Иван Иванов',
        total: 5000,
        items: [
          { productName: 'Крем для лица', quantity: 2, price: 1500 },
          { productName: 'Сыворотка', quantity: 1, price: 2000 },
        ],
      };

      // Act
      await telegramService.notifyNewOrder(orderData);

      // Assert
      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        expect.objectContaining({
          chat_id: '123456789',
          parse_mode: 'HTML',
          text: expect.stringContaining('Новый заказ #ORD-001'),
        })
      );

      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Клиент: Иван Иванов');
      expect(callArgs.text).toContain('Сумма: <b>5000₽</b>');
      expect(callArgs.text).toContain('Крем для лица x2 - 3000₽');
      expect(callArgs.text).toContain('Сыворотка x1 - 2000₽');
    });

    it('должен пропустить уведомление если adminChatId не настроен', async () => {
      // Arrange
      delete process.env.TELEGRAM_ADMIN_CHAT_ID;

      // Re-import service without admin chat ID
      jest.resetModules();
      const telegramModule = await import('../telegram.service.js');
      const serviceWithoutAdmin = telegramModule.telegramService;

      const orderData = {
        orderNumber: 'ORD-002',
        customerName: 'Петр Петров',
        total: 3000,
        items: [{ productName: 'Тоник', quantity: 1, price: 3000 }],
      };

      // Act
      await serviceWithoutAdmin.notifyNewOrder(orderData);

      // Assert
      expect(axiosMock.post).not.toHaveBeenCalled();
      expect(loggerMock.warn).toHaveBeenCalledWith(
        'TELEGRAM_ADMIN_CHAT_ID not configured, skipping notification'
      );
    });
  });

  describe('notifyOrderStatus', () => {
    it('должен отправить уведомление об изменении статуса заказа', async () => {
      // Arrange
      const params = {
        telegramId: 987654321,
        orderNumber: 'ORD-003',
        status: 'SHIPPED',
      };

      // Act
      await telegramService.notifyOrderStatus(params);

      // Assert
      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        expect.objectContaining({
          chat_id: 987654321,
          parse_mode: 'HTML',
          text: expect.stringContaining('Заказ #ORD-003'),
        })
      );

      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Статус изменён: <b>🚚 Отправлен</b>');
      expect(callArgs.text).toContain('Подробности: https://salminashop.ru/orders');
    });

    it('должен включить трек-номер если он предоставлен', async () => {
      // Arrange
      const params = {
        telegramId: 987654321,
        orderNumber: 'ORD-004',
        status: 'SHIPPED',
        trackingNumber: 'TRACK123456',
      };

      // Act
      await telegramService.notifyOrderStatus(params);

      // Assert
      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Трек-номер: <code>TRACK123456</code>');
    });

    it('должен корректно отобразить статус PAID', async () => {
      // Arrange
      const params = {
        telegramId: 111111111,
        orderNumber: 'ORD-005',
        status: 'PAID',
      };

      // Act
      await telegramService.notifyOrderStatus(params);

      // Assert
      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Статус изменён: <b>💳 Оплачен</b>');
    });

    it('должен корректно отобразить статус PROCESSING', async () => {
      // Arrange
      const params = {
        telegramId: 222222222,
        orderNumber: 'ORD-006',
        status: 'PROCESSING',
      };

      // Act
      await telegramService.notifyOrderStatus(params);

      // Assert
      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Статус изменён: <b>⚙️ В обработке</b>');
    });

    it('должен корректно отобразить статус CANCELLED', async () => {
      // Arrange
      const params = {
        telegramId: 333333333,
        orderNumber: 'ORD-007',
        status: 'CANCELLED',
      };

      // Act
      await telegramService.notifyOrderStatus(params);

      // Assert
      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Статус изменён: <b>❌ Отменён</b>');
    });

    it('должен использовать оригинальный статус для неизвестных значений', async () => {
      // Arrange
      const params = {
        telegramId: 444444444,
        orderNumber: 'ORD-008',
        status: 'UNKNOWN_STATUS',
      };

      // Act
      await telegramService.notifyOrderStatus(params);

      // Assert
      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Статус изменён: <b>UNKNOWN_STATUS</b>');
    });
  });

  describe('sendWelcomeMessage', () => {
    it('должен отправить приветственное сообщение новому пользователю', async () => {
      // Arrange
      const telegramId = 555555555;
      const firstName = 'Мария';

      // Act
      await telegramService.sendWelcomeMessage(telegramId, firstName);

      // Assert
      expect(axiosMock.post).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest-bot-token/sendMessage',
        expect.objectContaining({
          chat_id: telegramId,
          parse_mode: 'HTML',
          text: expect.stringContaining('Привет, Мария!'),
        })
      );

      const callArgs = axiosMock.post.mock.calls[0][1];
      expect(callArgs.text).toContain('Добро пожаловать в <b>Salmina Shop</b>');
      expect(callArgs.text).toContain('Широкий ассортимент товаров');
      expect(callArgs.text).toContain('Быстрая доставка');
      expect(callArgs.text).toContain('Удобная оплата');
      expect(callArgs.text).toContain('Поддержка 24/7');
    });
  });
});

/**
 * @file telegram.service.ts
 * @description Telegram Bot notification service
 */

import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: 'Markdown' | 'HTML';
  disable_notification?: boolean;
}

class TelegramService {
  private botToken: string;
  private apiUrl: string;
  private adminChatId?: string;

  constructor() {
    this.botToken = env.TELEGRAM_BOT_TOKEN;
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  }

  /**
   * Send message to Telegram chat
   */
  async sendMessage(params: TelegramMessage): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, params);
      logger.info(`Telegram message sent to chat ${params.chat_id}`);
    } catch (error) {
      logger.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  /**
   * Send order notification to admin
   */
  async notifyNewOrder(orderData: {
    orderNumber: string;
    customerName: string;
    total: number;
    items: Array<{ productName: string; quantity: number; price: number }>;
  }): Promise<void> {
    if (!this.adminChatId) {
      logger.warn('TELEGRAM_ADMIN_CHAT_ID not configured, skipping notification');
      return;
    }

    const itemsList = orderData.items
      .map(
        (item) =>
          `  • ${item.productName} x${item.quantity} - ${item.price * item.quantity}₽`,
      )
      .join('\n');

    const message = `
🛍 <b>Новый заказ #${orderData.orderNumber}</b>

👤 Клиент: ${orderData.customerName}
💰 Сумма: <b>${orderData.total}₽</b>

📦 Товары:
${itemsList}

🔗 Посмотреть в админке: https://admin.salminashop.ru/orders/${orderData.orderNumber}
    `.trim();

    await this.sendMessage({
      chat_id: this.adminChatId,
      text: message,
      parse_mode: 'HTML',
    });
  }

  /**
   * Send order status update to customer
   */
  async notifyOrderStatus(params: {
    telegramId: number;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
  }): Promise<void> {
    let message = `
📦 Заказ #${params.orderNumber}

Статус изменён: <b>${this.getStatusText(params.status)}</b>
    `.trim();

    if (params.trackingNumber) {
      message += `\n\n📮 Трек-номер: <code>${params.trackingNumber}</code>`;
    }

    message += '\n\n🔗 Подробности: https://salminashop.ru/orders';

    await this.sendMessage({
      chat_id: params.telegramId,
      text: message,
      parse_mode: 'HTML',
    });
  }

  /**
   * Get human-readable status text
   */
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PAID: '💳 Оплачен',
      PROCESSING: '⚙️ В обработке',
      SHIPPED: '🚚 Отправлен',
      CANCELLED: '❌ Отменён',
    };

    return statusMap[status] || status;
  }

  /**
   * Send welcome message to new user
   */
  async sendWelcomeMessage(telegramId: number, firstName: string): Promise<void> {
    const message = `
👋 Привет, ${firstName}!

Добро пожаловать в <b>Salmina Shop</b> - ваш магазин качественной косметики!

🛍 Что вас ждёт:
• Широкий ассортимент товаров
• Быстрая доставка
• Удобная оплата
• Поддержка 24/7

📱 Начните покупки прямо сейчас!
    `.trim();

    await this.sendMessage({
      chat_id: telegramId,
      text: message,
      parse_mode: 'HTML',
    });
  }
}

export const telegramService = new TelegramService();

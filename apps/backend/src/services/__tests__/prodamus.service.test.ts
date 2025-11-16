import { describe, it, expect, beforeEach } from '@jest/globals';
import { prodamusService } from '../prodamus.service.js';
import type { ProdamusWebhookData } from '../prodamus.service.js';

describe('ProdamusService', () => {
  describe('generatePaymentLink', () => {
    it('должен генерировать платёжную ссылку с корректными параметрами', () => {
      const params = {
        orderNumber: 'ORD-12345678-9012',
        customerName: 'Иван Иванов',
        customerEmail: 'ivan@example.com',
        customerPhone: '+79991234567',
        products: [
          { name: 'Тестовый товар', price: 1500, quantity: 1 },
          { name: 'Ещё товар', price: 500, quantity: 2 },
        ],
      };

      const paymentUrl = prodamusService.generatePaymentLink(params);

      // Проверяем через URLSearchParams для корректной работы с encoding
      const url = new URL(paymentUrl);

      expect(url.origin).toBe('https://demo.payform.ru');
      expect(url.searchParams.get('order_id')).toBe('ORD-12345678-9012');
      expect(url.searchParams.get('customer_name')).toBe('Иван Иванов');
      expect(url.searchParams.get('customer_email')).toBe('ivan@example.com');
      expect(url.searchParams.get('customer_phone')).toBe('+79991234567');
      expect(url.searchParams.get('sign')).toBeTruthy();
    });

    it('должен генерировать подпись для данных', () => {
      const params = {
        orderNumber: 'TEST-123',
        customerName: 'Test User',
        products: [
          { name: 'Product', price: 100, quantity: 1 },
        ],
      };

      const url1 = prodamusService.generatePaymentLink(params);
      const url2 = prodamusService.generatePaymentLink(params);

      // Одинаковые данные должны давать одинаковую подпись
      const sign1 = new URL(url1).searchParams.get('sign');
      const sign2 = new URL(url2).searchParams.get('sign');
      expect(sign1).toBe(sign2);
    });

    it('должен включать опциональные URL параметры', () => {
      const params = {
        orderNumber: 'ORD-123',
        customerName: 'Test',
        products: [{ name: 'Test', price: 100, quantity: 1 }],
        successUrl: 'https://example.com/success',
        failUrl: 'https://example.com/fail',
        callbackUrl: 'https://example.com/callback',
      };

      const paymentUrl = prodamusService.generatePaymentLink(params);

      expect(paymentUrl).toContain('success_url=');
      expect(paymentUrl).toContain('fail_url=');
      expect(paymentUrl).toContain('notification_url=');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('должен проверять корректную подпись webhook', () => {
      // Подготовим полные данные webhook (без подписи)
      const webhookDataWithoutSign = {
        date: '2024-11-16 10:00:00',
        order_id: 'internal_123',
        order_num: 'ORD-123',
        domain: 'test.payform.ru',
        sum: '1500.00',
        payment_type: 'card',
        payment_status: 'success',
        payment_status_description: 'Успешная оплата',
        currency: 'rub',
        products: '[]',
        payment_init: 'online',
        attempt: '1',
        sys: 'test',
      };

      // Генерируем подпись для всех полей
      const signature = (prodamusService as any).generateSignature(webhookDataWithoutSign);

      const webhookData: ProdamusWebhookData = {
        ...webhookDataWithoutSign,
        sign: signature,
      };

      const isValid = prodamusService.verifyWebhookSignature(webhookData);
      expect(isValid).toBe(true);
    });

    it('должен отклонять неверную подпись', () => {
      const webhookData: ProdamusWebhookData = {
        date: '2024-11-16 10:00:00',
        order_id: 'internal_123',
        order_num: 'ORD-123',
        domain: 'test.payform.ru',
        sum: '1500.00',
        payment_type: 'card',
        payment_status: 'success',
        payment_status_description: 'Успешная оплата',
        currency: 'rub',
        products: '[]',
        payment_init: 'online',
        attempt: '1',
        sys: 'test',
        sign: 'invalid_signature',
      };

      const isValid = prodamusService.verifyWebhookSignature(webhookData);
      expect(isValid).toBe(false);
    });

    it('должен возвращать false если подпись отсутствует', () => {
      const webhookData = {
        order_num: 'ORD-123',
        sum: '1500.00',
        // sign отсутствует
      } as any;

      const isValid = prodamusService.verifyWebhookSignature(webhookData);
      expect(isValid).toBe(false);
    });
  });

  describe('parseWebhookProducts', () => {
    it('должен парсить JSON массив товаров', () => {
      const productsJson = JSON.stringify([
        { name: 'Товар 1', price: 1500, quantity: 1 },
        { name: 'Товар 2', price: 500, quantity: 2 },
      ]);

      const products = prodamusService.parseWebhookProducts(productsJson);

      expect(products).toHaveLength(2);
      expect(products[0]).toEqual({
        name: 'Товар 1',
        price: 1500,
        quantity: 1,
      });
      expect(products[1]).toEqual({
        name: 'Товар 2',
        price: 500,
        quantity: 2,
      });
    });

    it('должен обрабатывать пустой массив', () => {
      const productsJson = '[]';
      const products = prodamusService.parseWebhookProducts(productsJson);

      expect(products).toHaveLength(0);
    });

    it('должен возвращать пустой массив при невалидном JSON', () => {
      const productsJson = 'not a json';
      const products = prodamusService.parseWebhookProducts(productsJson);

      expect(products).toHaveLength(0);
    });

    it('должен обрабатывать товары с разным форматом ключей', () => {
      const productsJson = JSON.stringify([
        { Name: 'Товар 1', Price: '1500', Quantity: '1' },
      ]);

      const products = prodamusService.parseWebhookProducts(productsJson);

      expect(products).toHaveLength(1);
      expect(products[0]).toEqual({
        name: 'Товар 1',
        price: 1500,
        quantity: 1,
      });
    });
  });

  describe('isPaymentSuccessful', () => {
    it('должен определять успешную оплату по статусу "success"', () => {
      const webhookData = {
        payment_status: 'success',
        payment_status_description: 'Payment completed',
      } as ProdamusWebhookData;

      const isSuccessful = prodamusService.isPaymentSuccessful(webhookData);
      expect(isSuccessful).toBe(true);
    });

    it('должен определять успешную оплату по описанию на русском', () => {
      const webhookData = {
        payment_status: 'completed',
        payment_status_description: 'Успешная оплата',
      } as ProdamusWebhookData;

      const isSuccessful = prodamusService.isPaymentSuccessful(webhookData);
      expect(isSuccessful).toBe(true);
    });

    it('должен определять неуспешную оплату', () => {
      const webhookData = {
        payment_status: 'failed',
        payment_status_description: 'Payment failed',
      } as ProdamusWebhookData;

      const isSuccessful = prodamusService.isPaymentSuccessful(webhookData);
      expect(isSuccessful).toBe(false);
    });

    it('должен быть case-insensitive', () => {
      const webhookData1 = {
        payment_status: 'SUCCESS',
        payment_status_description: '',
      } as ProdamusWebhookData;

      const webhookData2 = {
        payment_status: 'Success',
        payment_status_description: '',
      } as ProdamusWebhookData;

      expect(prodamusService.isPaymentSuccessful(webhookData1)).toBe(true);
      expect(prodamusService.isPaymentSuccessful(webhookData2)).toBe(true);
    });
  });
});

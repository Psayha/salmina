import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Prodamus Payment Service
 *
 * Handles payment link generation and webhook signature verification
 * for Prodamus payment gateway integration.
 *
 * @see https://help.prodamus.ru/payform/integracii/rest-api
 */

export interface ProductItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentLinkParams {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  products: ProductItem[];
  successUrl?: string;
  failUrl?: string;
  callbackUrl?: string;
}

export interface ProdamusWebhookData {
  date: string;
  order_id: string;
  order_num: string;
  domain: string;
  sum: string;
  customer_phone?: string;
  customer_email?: string;
  customer_extra?: string;
  payment_type: string;
  commission?: string;
  commission_sum?: string;
  attempt: string;
  sys: string;
  products: string; // JSON string
  payment_init: string;
  payment_status: string;
  payment_status_description: string;
  currency: string;
  callbackType?: string;
  link_expired?: string;
  sign: string; // Signature from Prodamus
}

class ProdamusService {
  private paymentFormUrl: string;
  private secretKey: string;

  constructor() {
    this.paymentFormUrl = process.env.PRODAMUS_PAYMENT_FORM_URL || '';
    this.secretKey = process.env.PRODAMUS_SECRET_KEY || '';

    if (!this.paymentFormUrl || !this.secretKey) {
      logger.warn('Prodamus payment gateway is not configured. Set PRODAMUS_PAYMENT_FORM_URL and PRODAMUS_SECRET_KEY in .env');
    }
  }

  /**
   * Generate payment link for order
   *
   * @param params Payment parameters
   * @returns Payment URL
   */
  generatePaymentLink(params: PaymentLinkParams): string {
    if (!this.paymentFormUrl || !this.secretKey) {
      throw new Error('Prodamus payment gateway is not configured');
    }

    // Prepare products data
    const products = params.products.map((product: ProductItem, index: number) => ({
      [`products[${index}][name]`]: product.name,
      [`products[${index}][price]`]: product.price.toFixed(2),
      [`products[${index}][quantity]`]: product.quantity.toString(),
    })).reduce((acc: Record<string, string>, item: Record<string, string>) => ({ ...acc, ...item }), {});

    // Build payment data
    const paymentData: Record<string, string> = {
      order_id: params.orderNumber,
      customer_name: params.customerName,
      ...products,
    };

    // Add optional parameters
    if (params.customerEmail) {
      paymentData.customer_email = params.customerEmail;
    }

    if (params.customerPhone) {
      paymentData.customer_phone = params.customerPhone;
    }

    if (params.successUrl) {
      paymentData.success_url = params.successUrl;
    }

    if (params.failUrl) {
      paymentData.fail_url = params.failUrl;
    }

    if (params.callbackUrl) {
      paymentData.notification_url = params.callbackUrl;
    }

    // Generate signature
    const signature = this.generateSignature(paymentData);
    paymentData.sign = signature;

    // Build URL with query parameters
    const queryParams = new URLSearchParams(paymentData);
    const paymentUrl = `${this.paymentFormUrl}?${queryParams.toString()}`;

    logger.info(`Generated payment link for order ${params.orderNumber}`);

    return paymentUrl;
  }

  /**
   * Generate signature for payment data
   *
   * @param data Payment data object
   * @returns HMAC SHA256 signature
   */
  private generateSignature(data: Record<string, string>): string {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();

    // Create signature string: key:value;key:value;...
    const signatureString = sortedKeys
      .map((key: string) => `${key}:${data[key]}`)
      .join(';');

    // Generate HMAC SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(signatureString)
      .digest('hex');

    return signature;
  }

  /**
   * Verify webhook signature from Prodamus
   *
   * @param webhookData Webhook data received from Prodamus
   * @returns true if signature is valid
   */
  verifyWebhookSignature(webhookData: ProdamusWebhookData): boolean {
    if (!this.secretKey) {
      logger.error('Cannot verify webhook signature: PRODAMUS_SECRET_KEY not configured');
      return false;
    }

    const receivedSignature = webhookData.sign;

    if (!receivedSignature) {
      logger.error('Webhook signature is missing');
      return false;
    }

    // Create data object without signature
    const dataToVerify: Record<string, string> = { ...webhookData as any };
    delete dataToVerify.sign;

    // Generate expected signature
    const expectedSignature = this.generateSignature(dataToVerify);

    // Compare signatures using constant-time comparison
    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(receivedSignature),
      );

      if (isValid) {
        logger.info(`Webhook signature verified successfully for order ${webhookData.order_num}`);
      } else {
        logger.error(`Invalid webhook signature for order ${webhookData.order_num}`);
      }

      return isValid;
    } catch (error) {
      logger.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Parse webhook products data
   *
   * @param productsJson JSON string with products data
   * @returns Array of product items
   */
  parseWebhookProducts(productsJson: string): ProductItem[] {
    try {
      const products = JSON.parse(productsJson);

      if (!Array.isArray(products)) {
        logger.error('Webhook products is not an array');
        return [];
      }

      return products.map((product: any) => ({
        name: product.name || product.Name || '',
        price: parseFloat(product.price || product.Price || '0'),
        quantity: parseInt(product.quantity || product.Quantity || '1', 10),
      }));
    } catch (error) {
      logger.error('Failed to parse webhook products:', error);
      return [];
    }
  }

  /**
   * Check if payment is successful based on webhook data
   *
   * @param webhookData Webhook data
   * @returns true if payment is successful
   */
  isPaymentSuccessful(webhookData: ProdamusWebhookData): boolean {
    // Prodamus sends payment_status for successful payments
    const successStatuses = ['success', 'успех', 'успешная оплата'];

    return successStatuses.some(
      (status) =>
        webhookData.payment_status?.toLowerCase().includes(status) ||
        webhookData.payment_status_description?.toLowerCase().includes(status),
    );
  }
}

export const prodamusService = new ProdamusService();

/**
 * @file order.ts
 * @description Order, order items, and order-related types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Order status enumeration
 * Defines possible states for an order
 */
export enum OrderStatus {
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

/**
 * Payment method enumeration
 * Available payment methods for orders
 */
export enum PaymentMethod {
  SBP = 'SBP', // Faster Payments System
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

/**
 * Payment status enumeration
 * Tracks the payment processing status
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

/**
 * Order entity type
 * Represents a customer order
 */
export interface Order {
  /** Unique order identifier (UUID) */
  id: string;
  /** Human-readable order number (unique) */
  orderNumber: string;
  /** User ID who placed the order */
  userId: string;
  /** Current order status */
  status: OrderStatus;
  /** Customer name */
  customerName: string;
  /** Customer phone number */
  customerPhone: string;
  /** Customer email address */
  customerEmail: string;
  /** Delivery address */
  customerAddress: string;
  /** Optional order comment/notes */
  comment?: string | null;
  /** Order subtotal before discounts */
  subtotal: number;
  /** Discount amount applied to items */
  discount: number;
  /** Final order total */
  total: number;
  /** Promocode ID (if applied, optional) */
  promocodeId?: string | null;
  /** Discount amount from promocode (optional) */
  promocodeDiscount?: number | null;
  /** Shipping tracking number (optional) */
  trackingNumber?: string | null;
  /** Payment method used */
  paymentMethod: PaymentMethod;
  /** Current payment status */
  paymentStatus: PaymentStatus;
  /** Payment provider ID/reference (optional) */
  paymentId?: string | null;
  /** Order creation timestamp */
  createdAt: Date;
  /** Order last update timestamp */
  updatedAt: Date;
  /** Timestamp when payment was completed (optional) */
  paidAt?: Date | null;
  /** Timestamp when order was shipped (optional) */
  shippedAt?: Date | null;
}

/**
 * Order item entity type
 * Represents a product item in an order (snapshot at purchase time)
 */
export interface OrderItem {
  /** Unique order item identifier (UUID) */
  id: string;
  /** Associated order ID */
  orderId: string;
  /** Product ID */
  productId: string;
  /** Product name at time of purchase */
  productName: string;
  /** Product article number */
  productArticle: string;
  /** Product image URL */
  productImage: string;
  /** Base product price at time of purchase */
  basePrice: number;
  /** Applied price (may include promotions) */
  appliedPrice: number;
  /** Whether the product had a promotion at purchase */
  hadPromotion: boolean;
  /** Quantity ordered */
  quantity: number;
  /** Item creation timestamp */
  createdAt: Date;
}

/**
 * Order with items
 * Complete order data including all items
 */
export interface OrderWithItems extends Order {
  /** Order items */
  items: OrderItem[];
}

/**
 * Create order DTO (Data Transfer Object)
 * Used for creating new orders from cart
 */
export interface CreateOrderDTO {
  /** Customer name */
  customerName: string;
  /** Customer phone number */
  customerPhone: string;
  /** Customer email */
  customerEmail: string;
  /** Delivery address */
  customerAddress: string;
  /** Optional order notes */
  comment?: string;
  /** Payment method */
  paymentMethod: PaymentMethod;
  /** Promocode to apply (optional) */
  promocodeCode?: string;
  /** Cart items to order */
  items: OrderItemCreateDTO[];
}

/**
 * Order item create DTO (Data Transfer Object)
 * Used when creating an order
 */
export interface OrderItemCreateDTO {
  /** Product ID */
  productId: string;
  /** Quantity */
  quantity: number;
  /** Applied price */
  appliedPrice: number;
  /** Whether product has promotion */
  hasPromotion?: boolean;
}

/**
 * Update order DTO (Data Transfer Object)
 * Used for updating order information (admin only)
 */
export interface UpdateOrderDTO {
  /** New order status (optional) */
  status?: OrderStatus;
  /** New payment status (optional) */
  paymentStatus?: PaymentStatus;
  /** Tracking number (optional) */
  trackingNumber?: string;
  /** Payment ID/reference (optional) */
  paymentId?: string;
  /** Order comment/notes (optional) */
  comment?: string;
}

/**
 * Order list item response
 * Used for order listing views
 */
export interface OrderListItem {
  /** Order identifier */
  id: string;
  /** Order number */
  orderNumber: string;
  /** Order status */
  status: OrderStatus;
  /** Customer name */
  customerName: string;
  /** Order total */
  total: number;
  /** Order creation date */
  createdAt: Date;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Number of items in order */
  itemCount: number;
}

/**
 * Order detail response
 * Complete order information for detail views
 */
export interface OrderDetail extends OrderWithItems {
  /** User information (if available) */
  user?: {
    id: string;
    firstName: string;
    lastName?: string | null;
  };
  /** Promocode information (if applied) */
  promocode?: {
    code: string;
    discountType: string;
    discountValue: number;
  };
}

/**
 * Order statistics
 * Used for dashboard/analytics
 */
export interface OrderStatistics {
  /** Total number of orders */
  totalOrders: number;
  /** Number of orders by status */
  ordersByStatus: Record<OrderStatus, number>;
  /** Number of orders by payment status */
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  /** Total revenue */
  totalRevenue: number;
  /** Average order value */
  averageOrderValue: number;
  /** Total items sold */
  totalItemsSold: number;
}

/**
 * Order filters for search and filtering
 */
export interface OrderFilters {
  /** Filter by order status */
  status?: OrderStatus[];
  /** Filter by payment status */
  paymentStatus?: PaymentStatus[];
  /** Filter by user ID */
  userId?: string;
  /** Minimum order amount */
  minAmount?: number;
  /** Maximum order amount */
  maxAmount?: number;
  /** Filter by date range start */
  fromDate?: Date;
  /** Filter by date range end */
  toDate?: Date;
  /** Sort field */
  sortBy?: 'createdAt' | 'total' | 'orderNumber';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Pagination page */
  page?: number;
  /** Items per page */
  limit?: number;
}

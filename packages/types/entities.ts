// Entity types matching Prisma schema

export type UserRole = "USER" | "ADMIN";
export type OrderStatus = "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED";
export type PaymentMethod = "SBP" | "CASH_ON_DELIVERY";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type DiscountType = "PERCENT" | "FIXED";
export type LegalDocumentType = "TERMS" | "PRIVACY" | "OFFER" | "DELIVERY_PAYMENT";

export interface User {
  id: string;
  telegramId: string;
  username?: string | null;
  firstName: string;
  lastName?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  isActive: boolean;
  hasAcceptedTerms: boolean;
  termsAcceptedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  promotionPrice?: number | null;
  discountPrice?: number | null;
  article: string;
  sku: string;
  weight: number;
  dimensions?: string | null;
  quantity: number;
  composition?: string | null;
  delivery?: string | null;
  characteristics?: Record<string, unknown> | null;
  application?: string | null;
  images: string[];
  isNew: boolean;
  isHit: boolean;
  isDiscount: boolean;
  hasPromotion: boolean;
  viewCount: number;
  orderCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  order: number;
  image?: string | null;
  showOnHome: boolean;
  homeOrder?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  comment?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  promocodeId?: string | null;
  promocodeDiscount?: number | null;
  trackingNumber?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date | null;
  shippedAt?: Date | null;
}

export interface Cart {
  id: string;
  userId?: string | null;
  sessionToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
}

export interface Promocode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}


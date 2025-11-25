/**
 * @file generated-enums.ts
 * @description Manually generated enum types from Prisma schema
 * These enums match the Prisma schema exactly and can be used
 * until prisma generate can run successfully.
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  SBP = 'SBP',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum LegalDocumentType {
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  OFFER = 'OFFER',
  DELIVERY_PAYMENT = 'DELIVERY_PAYMENT',
}

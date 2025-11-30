/**
 * API types matching backend responses
 */

// User types
export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  photoUrl?: string;
  role: 'USER' | 'ADMIN';
  hasAcceptedTerms: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  article?: string;
  weight: number;
  price: number;
  discountPrice?: number;
  promotionPrice?: number;
  quantity: number;
  images: string[];
  categoryId?: string;
  isActive: boolean;
  isNew?: boolean;
  isHit?: boolean;
  isDiscount?: boolean;
  hasPromotion: boolean;
  promotionLabel?: string;
  orderCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  showOnHome: boolean;
  homeOrder?: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  productArticle: string | null;
  basePrice: number;
  appliedPrice: number;
  hasPromotion: boolean;
  allowPromocode: boolean;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  availableQuantity: number;
  // Legacy field for backwards compatibility
  product?: Product;
}

export interface CartTotals {
  subtotal: number;
  itemsDiscount: number;
  promocodeDiscount: number;
  discount: number;
  total: number;
  itemsCount: number;
}

export interface Cart {
  id: string;
  sessionToken?: string;
  items: CartItem[];
  totals: CartTotals;
  createdAt: string;
  updatedAt: string;
}

// Order types
export type OrderStatus = 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productName: string;
  productArticle: string;
  productImage?: string;
  quantity: number;
  price: number;
  appliedPrice: number;
  hasPromotion: boolean;
  promotionLabel?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  itemsDiscount: number;
  promocodeDiscount: number;
  totalAmount: number;
  promocodeId?: string;
  trackingNumber?: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Promocode types
export interface Promocode {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
}

// Promotion types
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  previewImage?: string; // Small image for carousel thumbnail
  image?: string; // Main content image for story view
  link?: string;
  order: number;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  products?: Product[];
  _count?: {
    products: number;
  };
}

// Legal document types
export type LegalDocumentType = 'TERMS' | 'PRIVACY' | 'OFFER' | 'DELIVERY_PAYMENT';

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
// Generic API response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

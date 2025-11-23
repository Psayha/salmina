import { apiClient, ApiResponse } from '../client';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  comment?: string;
}

export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  createOrder: async (input: CreateOrderInput): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', input);
    return response.data.data;
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data.data;
  },
};

import { apiClient } from '../client';
import { ApiResponse } from '../types';

export enum LegalDocumentType {
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  OFFER = 'OFFER',
  DELIVERY_PAYMENT = 'DELIVERY_PAYMENT',
}

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const legalApi = {
  // Public endpoints
  getDocuments: async () => {
    const response = await apiClient.get<ApiResponse<LegalDocument[]>>('/legal');
    return response.data.data;
  },

  getDocument: async (type: LegalDocumentType) => {
    const response = await apiClient.get<ApiResponse<LegalDocument>>(`/legal/${type.toLowerCase()}`);
    return response.data.data;
  },

  // Get document for admin (includes inactive)
  getDocumentForAdmin: async (type: LegalDocumentType) => {
    const response = await apiClient.get<ApiResponse<LegalDocument | null>>(`/legal/admin/${type.toLowerCase()}`);
    return response.data.data;
  },

  // Admin endpoints
  createDocument: async (data: Partial<LegalDocument>) => {
    const response = await apiClient.post<ApiResponse<LegalDocument>>('/legal', data);
    return response.data.data;
  },

  updateDocument: async (id: string, data: Partial<LegalDocument>) => {
    const response = await apiClient.patch<ApiResponse<LegalDocument>>(`/legal/${id}`, data);
    return response.data.data;
  },

  deleteDocument: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/legal/${id}`);
    return response.data;
  },
};

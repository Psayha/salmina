/**
 * @file common.ts
 * @description Common shared types
 */

export type UUID = string;

export type Timestamp = Date | string;

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface SearchParams {
  query?: string;
  sortBy?: string;
  order?: SortOrder;
}

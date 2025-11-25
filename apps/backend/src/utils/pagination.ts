/**
 * @file pagination.ts
 * @description Pagination utility for database queries
 * @author AI Assistant
 * @created 2024-11-25
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Helper to parse and validate pagination parameters from query
 */
export const parsePaginationParams = (query: any): Required<PaginationParams> => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(Math.max(1, parseInt(query.limit) || 20), 100); // Max 100 items

  return { page, limit };
};

/**
 * Generic pagination utility for Prisma models
 * @param model - Prisma model (e.g., prisma.product)
 * @param params - Pagination parameters
 * @param where - Prisma where clause
 * @param include - Prisma include clause
 * @param orderBy - Prisma orderBy clause
 */
export async function paginate<T>(
  model: any,
  params: PaginationParams,
  where?: any,
  include?: any,
  orderBy?: any,
): Promise<PaginatedResponse<T>> {
  const { page, limit } = parsePaginationParams(params);
  const skip = (page - 1) * limit;

  // Execute count and findMany in parallel
  const [data, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Create pagination metadata without fetching data
 * Useful when you already have the data and just need metadata
 */
export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

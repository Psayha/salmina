/**
 * @file api.ts
 * @description API request/response and utility types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * API response wrapper
 * Standard wrapper for all API responses
 */
export interface ApiResponse<T> {
  /** Response status: success or error */
  status: 'success' | 'error';
  /** Response message */
  message: string;
  /** Response data payload */
  data?: T;
  /** Error details (if status is error) */
  error?: ApiError;
  /** Response timestamp */
  timestamp: Date;
}

/**
 * API error details
 * Detailed error information
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Paginated response
 * Standard paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Total number of items */
  total: number;
  /** Current page (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of pages */
  pages: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Pagination parameters
 * Standard pagination parameters for list endpoints
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Sort parameters
 * Standard sorting parameters
 */
export interface SortParams {
  /** Field to sort by */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * List query parameters
 * Combined pagination and sorting parameters
 */
export interface ListQueryParams extends PaginationParams, SortParams {}

/**
 * API validation error
 * Validation error with field-level details
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string;
  /** Validation error message */
  message: string;
  /** Validation error code */
  code: string;
  /** Received value */
  value?: unknown;
}

/**
 * API validation error response
 * Response containing validation errors
 */
export interface ValidationErrorResponse extends ApiError {
  /** Array of field validation errors */
  validationErrors: ValidationError[];
}

/**
 * Request context
 * Context information about incoming request
 */
export interface RequestContext {
  /** Request ID for tracking */
  requestId: string;
  /** Authenticated user ID (if available) */
  userId?: string;
  /** User role (if authenticated) */
  userRole?: string;
  /** Request timestamp */
  timestamp: Date;
  /** Request path */
  path: string;
  /** HTTP method */
  method: string;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
}

/**
 * Health check response
 * Response from health check endpoint
 */
export interface HealthCheckResponse {
  /** Service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Service version */
  version: string;
  /** Current timestamp */
  timestamp: Date;
  /** Uptime in milliseconds */
  uptime: number;
  /** Database connection status */
  database: 'connected' | 'disconnected';
  /** Optional additional health metrics */
  metrics?: Record<string, unknown>;
}

/**
 * Success response
 * Generic success response wrapper
 */
export interface SuccessResponse<T = null> extends ApiResponse<T> {
  status: 'success';
}

/**
 * Error response
 * Generic error response wrapper
 */
export interface ErrorResponse extends ApiResponse<null> {
  status: 'error';
}

/**
 * File upload response
 * Response from file upload endpoint
 */
export interface FileUploadResponse {
  /** File identifier */
  id: string;
  /** File name */
  name: string;
  /** File URL */
  url: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Upload timestamp */
  uploadedAt: Date;
}

/**
 * Batch operation result
 * Result of a batch operation
 */
export interface BatchOperationResult<T> {
  /** Number of successful operations */
  successCount: number;
  /** Number of failed operations */
  failureCount: number;
  /** Successful items */
  successful: T[];
  /** Failed items with error details */
  failed: {
    item: T;
    error: string;
  }[];
}

/**
 * Search results
 * Generic search results response
 */
export interface SearchResults<T> {
  /** Array of search result items */
  items: T[];
  /** Total number of results */
  total: number;
  /** Search query used */
  query: string;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * API error codes
 * Standard error codes used throughout the API
 */
export enum ApiErrorCode {
  /** Generic bad request */
  BAD_REQUEST = 'BAD_REQUEST',
  /** Unauthorized access */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** Forbidden access */
  FORBIDDEN = 'FORBIDDEN',
  /** Resource not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Conflict (e.g., duplicate) */
  CONFLICT = 'CONFLICT',
  /** Validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Internal server error */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Service unavailable */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * HTTP status codes
 * Standard HTTP status codes
 */
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Download file response
 * Response headers for file downloads
 */
export interface DownloadFileResponse {
  /** File content as buffer/stream */
  content: Buffer | NodeJS.ReadableStream;
  /** File name */
  fileName: string;
  /** MIME type */
  mimeType: string;
  /** File size (optional) */
  fileSize?: number;
}

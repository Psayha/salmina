/**
 * @file common.ts
 * @description Common types and utilities used across the application
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Generic ID type
 * Can be string (UUID) or number depending on entity
 */
export type ID = string | number;

/**
 * Nullable type utility
 * Makes a type nullable
 */
export type Nullable<T> = T | null;

/**
 * Optional type utility
 * Makes a type optional
 */
export type Optional<T> = T | undefined;

/**
 * Async result type
 * Represents a result that can be successful or failed
 */
export type AsyncResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Timestamp object
 * Contains creation and update timestamps
 */
export interface Timestamps {
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Audit fields
 * Standard audit fields for tracking changes
 */
export interface AuditFields extends Timestamps {
  /** User ID who created the record */
  createdBy?: string;
  /** User ID who last updated the record */
  updatedBy?: string;
}

/**
 * Soft delete fields
 * Fields for soft delete functionality
 */
export interface SoftDeleteFields {
  /** When the record was deleted (null if not deleted) */
  deletedAt?: Date | null;
  /** User ID who deleted the record */
  deletedBy?: string;
}

/**
 * Entity base
 * Base interface for all entities
 */
export interface Entity {
  /** Unique identifier */
  id: ID;
  /** Creation and update timestamps */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cursor pagination
 * Pagination using cursor instead of page number
 */
export interface CursorPagination {
  /** Cursor to start from */
  cursor?: string;
  /** Number of items to fetch */
  limit: number;
  /** Sort order */
  direction?: 'forward' | 'backward';
}

/**
 * Cursor paginated response
 * Response with cursor pagination
 */
export interface CursorPaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Cursor for next page */
  nextCursor?: string;
  /** Whether there are more items */
  hasMore: boolean;
  /** Total count (optional, may be expensive to calculate) */
  total?: number;
}

/**
 * Range filter
 * Filter for range queries
 */
export interface RangeFilter<T> {
  /** Minimum value (inclusive) */
  min?: T;
  /** Maximum value (inclusive) */
  max?: T;
}

/**
 * Date range
 * Represents a date range
 */
export interface DateRange {
  /** Start date */
  from: Date;
  /** End date */
  to: Date;
}

/**
 * Localized string
 * String with multiple language variants
 */
export interface LocalizedString {
  /** Default/English version */
  en: string;
  /** Russian version (optional) */
  ru?: string;
  /** Additional languages */
  [key: string]: string | undefined;
}

/**
 * Address information
 * Standard address structure
 */
export interface Address {
  /** Street address */
  street: string;
  /** City/Town */
  city: string;
  /** State/Province */
  state?: string;
  /** Postal code */
  postalCode: string;
  /** Country */
  country: string;
  /** Additional address line (optional) */
  addressLine2?: string;
}

/**
 * Phone number
 * Phone number with country code
 */
export interface PhoneNumber {
  /** Country code (e.g., +1, +7) */
  countryCode: string;
  /** Phone number without country code */
  number: string;
}

/**
 * Coordinates
 * Geographical coordinates
 */
export interface Coordinates {
  /** Latitude */
  latitude: number;
  /** Longitude */
  longitude: number;
}

/**
 * Location
 * Location with coordinates and address
 */
export interface Location {
  /** Geographical coordinates */
  coordinates: Coordinates;
  /** Address information (optional) */
  address?: Address;
  /** Location name (optional) */
  name?: string;
}

/**
 * Money
 * Monetary amount with currency
 */
export interface Money {
  /** Amount */
  amount: number;
  /** Currency code (ISO 4217) */
  currency: string;
}

/**
 * Percentage
 * Percentage value
 */
export interface Percentage {
  /** Percentage value (0-100) */
  value: number;
  /** Unit (default: %) */
  unit?: '%' | 'percent';
}

/**
 * Dimension
 * Size/dimension measurement
 */
export interface Dimension {
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Depth (optional) */
  depth?: number;
  /** Unit of measurement (cm, mm, m, etc.) */
  unit: string;
}

/**
 * Weight
 * Weight measurement
 */
export interface Weight {
  /** Weight value */
  value: number;
  /** Unit of measurement (kg, g, oz, lb, etc.) */
  unit: string;
}

/**
 * Status indicator
 * Generic status with optional details
 */
export interface StatusIndicator {
  /** Status value */
  status: string;
  /** Status label for display */
  label: string;
  /** Color for UI representation */
  color?: string;
  /** Additional details */
  details?: string;
}

/**
 * Sort direction
 * Common sort directions
 */
export type SortDirection = 'asc' | 'desc' | 'ascending' | 'descending';

/**
 * Equality comparison
 * Types for equality comparisons
 */
export type EqualityOperator = 'eq' | 'ne' | 'not';

/**
 * Comparison operators
 * Types for various comparisons
 */
export type ComparisonOperator =
  | EqualityOperator
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

/**
 * Generic filter operation
 * Filter operation for queries
 */
export interface FilterOperation<T> {
  /** Comparison operator */
  operator: ComparisonOperator;
  /** Value to compare */
  value: T;
}

/**
 * Batch request item
 * Item in a batch operation request
 */
export interface BatchRequestItem<T> {
  /** Item identifier */
  id: string;
  /** Operation to perform (create, update, delete) */
  operation: 'create' | 'update' | 'delete';
  /** Data for the operation */
  data: T;
}

/**
 * Batch response item
 * Item in a batch operation response
 */
export interface BatchResponseItem<T> {
  /** Item identifier */
  id: string;
  /** Operation status */
  status: 'success' | 'error';
  /** Result data if successful */
  data?: T;
  /** Error message if failed */
  error?: string;
}

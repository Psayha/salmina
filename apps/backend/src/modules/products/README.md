# Products Module

Complete products management module with Clean Architecture for the Telegram Shop backend.

## Overview

This module provides comprehensive product management functionality including:

- Product listing with advanced filtering and pagination
- Search across multiple fields
- Category-based filtering
- Price range filtering
- Stock management
- Badge filtering (New, Hit, Discount, Promotion)
- Related products
- View count tracking
- Admin CRUD operations

## Architecture

```
products/
├── products.types.ts        # TypeScript interfaces and types
├── products.validation.ts   # Zod validation schemas
├── products.service.ts      # Business logic layer
├── products.controller.ts   # HTTP request handlers
├── products.routes.ts       # Route definitions with middleware
├── index.ts                 # Module exports
└── README.md               # This file
```

## API Endpoints

### Public Endpoints

#### GET /api/products
Get all products with filters, sorting, and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `sortBy` (string, default: 'new') - Sort by: 'price', 'popular', 'new', 'name'
- `order` (string, default: 'desc') - Sort order: 'asc', 'desc'
- `categoryId` (uuid) - Filter by category
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `inStock` (boolean) - Only products in stock
- `lowStock` (boolean) - Only products with low stock (≤10)
- `isNew` (boolean) - Only new products
- `isHit` (boolean) - Only hit products
- `isDiscount` (boolean) - Only discounted products
- `hasPromotion` (boolean) - Only products with promotion

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "categoryId": "uuid",
        "categoryName": "Category Name",
        "categorySlug": "category-slug",
        "name": "Product Name",
        "slug": "product-slug",
        "description": "Product description",
        "price": 1000,
        "promotionPrice": null,
        "discountPrice": 800,
        "finalPrice": 800,
        "discountPercent": 20,
        "article": "ART-001",
        "sku": "SKU-001",
        "weight": 0.5,
        "dimensions": "10x10x10",
        "quantity": 100,
        "images": ["url1", "url2"],
        "isNew": true,
        "isHit": false,
        "isDiscount": true,
        "hasPromotion": false,
        "viewCount": 150,
        "orderCount": 25,
        "isActive": true,
        "createdAt": "2024-11-13T00:00:00.000Z",
        "updatedAt": "2024-11-13T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Products retrieved successfully"
}
```

#### GET /api/products/search
Search products by query string.

**Query Parameters:**
- `q` (string) - Search query (searches in name, description, article, SKU, composition)
- All parameters from GET /api/products

**Example:**
```
GET /api/products/search?q=шампунь&categoryId=uuid&minPrice=500&maxPrice=2000&sortBy=price&order=asc
```

#### GET /api/products/:slug
Get product by slug (increments view count asynchronously).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "categoryId": "uuid",
    "categoryName": "Category Name",
    "categorySlug": "category-slug",
    "name": "Product Name",
    "slug": "product-slug",
    "description": "Product description",
    "price": 1000,
    "promotionPrice": null,
    "discountPrice": 800,
    "finalPrice": 800,
    "discountPercent": 20,
    "article": "ART-001",
    "sku": "SKU-001",
    "weight": 0.5,
    "dimensions": "10x10x10",
    "quantity": 100,
    "composition": "Product composition",
    "delivery": "Delivery information",
    "characteristics": {
      "color": "Red",
      "size": "Medium"
    },
    "application": "How to use",
    "images": ["url1", "url2"],
    "isNew": true,
    "isHit": false,
    "isDiscount": true,
    "hasPromotion": false,
    "viewCount": 151,
    "orderCount": 25,
    "isActive": true,
    "createdAt": "2024-11-13T00:00:00.000Z",
    "updatedAt": "2024-11-13T00:00:00.000Z"
  },
  "message": "Product retrieved successfully"
}
```

#### GET /api/products/:id/related
Get related products (same category).

**Query Parameters:**
- `limit` (number, default: 4, max: 20) - Number of related products

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of product items (same format as GET /api/products)
  ],
  "message": "Related products retrieved successfully"
}
```

### Admin Endpoints (Require Authentication + Admin Role)

#### POST /api/products
Create a new product.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "categoryId": "uuid",
  "name": "Product Name",
  "slug": "product-slug",
  "description": "Product description",
  "price": 1000,
  "promotionPrice": null,
  "discountPrice": 800,
  "article": "ART-001",
  "sku": "SKU-001",
  "weight": 0.5,
  "dimensions": "10x10x10",
  "quantity": 100,
  "composition": "Product composition",
  "delivery": "Delivery information",
  "characteristics": {
    "color": "Red",
    "size": "Medium"
  },
  "application": "How to use",
  "images": ["url1", "url2"],
  "isNew": true,
  "isHit": false,
  "isDiscount": true,
  "hasPromotion": false,
  "isActive": true
}
```

**Validation Rules:**
- `slug` must be unique and contain only lowercase letters, numbers, and hyphens
- `article` must be unique and contain only uppercase letters, numbers, and hyphens
- `sku` must be unique and contain only uppercase letters, numbers, and hyphens
- `price` must be positive
- `promotionPrice` and `discountPrice` must be less than `price`
- If `hasPromotion` is true, `promotionPrice` must be provided
- If `isDiscount` is true, `discountPrice` must be provided
- At least 1 image is required, maximum 10 images

#### PATCH /api/products/:id
Update a product (all fields optional).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 1200,
  "quantity": 150
  // Any other fields to update
}
```

#### DELETE /api/products/:id
Delete a product (soft delete - sets isActive to false).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Product deleted successfully"
}
```

#### PATCH /api/products/:id/stock
Update product stock quantity.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "quantity": 200
}
```

## Business Logic

### Price Calculation

The module handles three types of prices with priority:

1. **Promotion Price** (highest priority) - Used when `hasPromotion` is true
2. **Discount Price** (medium priority) - Used when `isDiscount` is true
3. **Regular Price** (base price)

The `finalPrice` is automatically calculated based on this priority.

**Example:**
```typescript
// Product with promotion
price: 1000
promotionPrice: 700
discountPrice: 800
hasPromotion: true
// finalPrice = 700 (promotion takes priority)

// Product with only discount
price: 1000
promotionPrice: null
discountPrice: 800
hasPromotion: false
// finalPrice = 800 (discount is used)

// Product with no discounts
price: 1000
promotionPrice: null
discountPrice: null
// finalPrice = 1000 (base price)
```

### View Count Tracking

When a product is retrieved by slug, the view count is incremented asynchronously:
- The increment happens in the background (non-blocking)
- The response is not delayed by the view count update
- If the increment fails, it's logged but doesn't affect the response

### Stock Filtering

- `inStock` - Products with quantity > 0
- `lowStock` - Products with quantity ≤ 10 and > 0

### Search

The search query searches across multiple fields:
- Product name
- Description
- Article number
- SKU
- Composition

Search is case-insensitive and uses PostgreSQL's `LIKE` operator.

### Sorting Options

- `price` - Sort by price (asc/desc)
- `popular` - Sort by order count, then view count, then creation date (desc)
- `new` - Sort by creation date (desc/asc)
- `name` - Sort by product name (asc/desc)

### Related Products

Related products are:
- From the same category
- Exclude the current product
- Active products only
- Sorted by: order count > view count > creation date
- Limited to specified number (default 4, max 20)

## Usage Examples

### Frontend Integration

```typescript
// Get products with filters
const response = await fetch('/api/products?page=1&limit=20&categoryId=uuid&isNew=true&sortBy=price&order=asc');
const { data } = await response.json();

// Search products
const searchResponse = await fetch('/api/products/search?q=шампунь&inStock=true');
const { data: searchData } = await searchResponse.json();

// Get product by slug
const productResponse = await fetch('/api/products/shampo-dlya-volos');
const { data: product } = await productResponse.json();

// Get related products
const relatedResponse = await fetch('/api/products/uuid/related?limit=4');
const { data: relatedProducts } = await relatedResponse.json();

// Create product (admin)
const createResponse = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoryId: 'uuid',
    name: 'New Product',
    slug: 'new-product',
    // ... other fields
  })
});

// Update product (admin)
const updateResponse = await fetch('/api/products/uuid', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    price: 1200,
    quantity: 150
  })
});

// Update stock (admin)
const stockResponse = await fetch('/api/products/uuid/stock', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quantity: 200
  })
});

// Delete product (admin)
const deleteResponse = await fetch('/api/products/uuid', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Error Handling

The module uses custom error classes:

- `NotFoundError` (404) - Product not found
- `ConflictError` (409) - Unique constraint violation (slug, article, SKU)
- `BadRequestError` (400) - Invalid price logic or data
- `ValidationError` (422) - Invalid input data
- `UnauthorizedError` (401) - Not authenticated
- `ForbiddenError` (403) - Not authorized (not admin)

## Validation

All inputs are validated using Zod schemas:

- UUID format for IDs
- Slug format (lowercase, numbers, hyphens)
- Article/SKU format (uppercase, numbers, hyphens)
- Price validation (positive numbers)
- Quantity validation (non-negative integers)
- Image URLs validation
- Price logic validation (promotionPrice < price, etc.)

## Testing

### Manual Testing with cURL

```bash
# Get products
curl -X GET "http://localhost:3000/api/products?page=1&limit=10"

# Search products
curl -X GET "http://localhost:3000/api/products/search?q=шампунь"

# Get product by slug
curl -X GET "http://localhost:3000/api/products/shampo-dlya-volos"

# Get related products
curl -X GET "http://localhost:3000/api/products/uuid/related?limit=4"

# Create product (admin)
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "uuid",
    "name": "Test Product",
    "slug": "test-product",
    "description": "Test description",
    "price": 1000,
    "article": "TEST-001",
    "sku": "SKU-001",
    "weight": 0.5,
    "quantity": 100,
    "images": ["https://example.com/image.jpg"],
    "isActive": true
  }'

# Update product (admin)
curl -X PATCH "http://localhost:3000/api/products/uuid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1200,
    "quantity": 150
  }'

# Update stock (admin)
curl -X PATCH "http://localhost:3000/api/products/uuid/stock" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 200
  }'

# Delete product (admin)
curl -X DELETE "http://localhost:3000/api/products/uuid" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Integration

To integrate this module into your Express app:

```typescript
// src/index.ts
import { productsRoutes } from './modules/products';

// Register routes
app.use('/api/products', productsRoutes);
```

## Dependencies

- `express` - Web framework
- `@prisma/client` - Database ORM
- `zod` - Schema validation
- Custom middleware:
  - `authenticate` - JWT authentication
  - `requireAdmin` - Admin role authorization
  - `validate` - Request validation

## Performance Considerations

1. **Pagination** - All list endpoints use pagination to limit response size
2. **Async View Count** - View count increment is non-blocking
3. **Database Indexes** - The Prisma schema includes indexes for:
   - `slug` (unique)
   - `article` (unique)
   - `sku` (unique)
   - `categoryId`
   - `isActive`
   - `isNew`, `isHit`, `isDiscount`
   - `hasPromotion`

4. **Efficient Queries** - Uses Prisma's query optimization
5. **Parallel Queries** - Count and data queries run in parallel

## Security

1. **Authentication** - Admin routes require valid JWT token
2. **Authorization** - Only admins can create, update, or delete products
3. **Validation** - All inputs are validated before processing
4. **Soft Delete** - Products are never permanently deleted
5. **SQL Injection** - Protected by Prisma's parameterized queries
6. **Type Safety** - Full TypeScript support with strict mode

## Future Enhancements

Potential improvements:

1. Product variants (size, color, etc.)
2. Product reviews and ratings
3. Bulk import/export
4. Image upload handling
5. Product recommendations (ML-based)
6. Inventory alerts
7. Price history tracking
8. Product tags/labels
9. SEO metadata
10. Multi-language support

## License

Part of the Telegram Shop project.

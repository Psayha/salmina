# Products Module Integration Guide

This guide shows how to integrate the Products module into your Express application.

## Step 1: Register Routes

Update your main application file (`src/index.ts`) to register the products routes:

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { logger } from "./utils/logger";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import { productsRoutes } from "./modules/products"; // Add this import

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.get("/api", (req, res) => {
  res.json({ message: "Telegram Shop API v1.1" });
});

// Register module routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes); // Add this line

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
});
```

## Step 2: Verify Database Migration

Ensure your Prisma schema is up to date and migrations are applied:

```bash
# Generate Prisma client
cd apps/backend
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Or create a new migration if schema changed
npx prisma migrate dev --name add_products
```

## Step 3: Test the API

### Using cURL

```bash
# Test public endpoint - Get products
curl -X GET "http://localhost:3000/api/products?page=1&limit=10" | jq

# Test search
curl -X GET "http://localhost:3000/api/products/search?q=test" | jq

# Test admin endpoint - Create product (requires authentication)
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "YOUR_CATEGORY_ID",
    "name": "Test Product",
    "slug": "test-product",
    "description": "Test description",
    "price": 1000,
    "article": "TEST-001",
    "sku": "SKU-001",
    "weight": 0.5,
    "quantity": 100,
    "images": ["https://example.com/image.jpg"]
  }' | jq
```

### Using Postman

1. Import the following collection:

**Get Products:**
- Method: GET
- URL: `http://localhost:3000/api/products`
- Query Params:
  - `page`: 1
  - `limit`: 20
  - `sortBy`: new
  - `order`: desc

**Search Products:**
- Method: GET
- URL: `http://localhost:3000/api/products/search`
- Query Params:
  - `q`: search term

**Create Product (Admin):**
- Method: POST
- URL: `http://localhost:3000/api/products`
- Headers:
  - `Authorization`: Bearer YOUR_ACCESS_TOKEN
  - `Content-Type`: application/json
- Body (raw JSON):
```json
{
  "categoryId": "uuid",
  "name": "Test Product",
  "slug": "test-product",
  "description": "Test description",
  "price": 1000,
  "article": "TEST-001",
  "sku": "SKU-001",
  "weight": 0.5,
  "quantity": 100,
  "images": ["https://example.com/image.jpg"]
}
```

## Step 4: Frontend Integration

### React/Next.js Example

```typescript
// lib/api/products.ts
import { ProductsListResponse, ProductDetail } from '@/types/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'popular' | 'new' | 'name';
  order?: 'asc' | 'desc';
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  isNew?: boolean;
  isHit?: boolean;
  isDiscount?: boolean;
  hasPromotion?: boolean;
}

/**
 * Get products list with filters
 */
export async function getProducts(params: GetProductsParams = {}): Promise<ProductsListResponse> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/products?${queryParams}`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Search products
 */
export async function searchProducts(query: string, params: GetProductsParams = {}): Promise<ProductsListResponse> {
  const queryParams = new URLSearchParams({ q: query });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/products/search?${queryParams}`);

  if (!response.ok) {
    throw new Error('Failed to search products');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/api/products/${slug}`);

  if (!response.ok) {
    throw new Error('Product not found');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get related products
 */
export async function getRelatedProducts(productId: string, limit: number = 4): Promise<ProductDetail[]> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/related?limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch related products');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create product (admin)
 */
export async function createProduct(productData: any, accessToken: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update product (admin)
 */
export async function updateProduct(productId: string, productData: any, accessToken: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete product (admin)
 */
export async function deleteProduct(productId: string, accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }
}

/**
 * Update stock (admin)
 */
export async function updateProductStock(productId: string, quantity: number, accessToken: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/stock`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update stock');
  }

  const data = await response.json();
  return data.data;
}
```

### React Component Example

```typescript
// components/ProductList.tsx
import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/api/products';
import type { ProductListItem } from '@/types/products';

export function ProductList() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await getProducts({ page, limit: 20, sortBy: 'new', order: 'desc' });
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.images[0]} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="price">
              {product.discountPercent && (
                <span className="discount">{product.discountPercent}% OFF</span>
              )}
              <span className="final-price">{product.finalPrice} ₽</span>
              {product.finalPrice < product.price && (
                <span className="original-price">{product.price} ₽</span>
              )}
            </div>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## Step 5: Environment Variables

Ensure these environment variables are set:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/telegram_shop

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Admin
ADMIN_TELEGRAM_IDS=123456789,987654321

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3001
```

## Step 6: Seed Database (Optional)

Create a seed script to populate the database with sample data:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create category
  const category = await prisma.category.create({
    data: {
      name: 'Шампуни',
      slug: 'shampoo',
      description: 'Шампуни для волос',
      isActive: true,
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'Шампунь для нормальных волос',
        slug: 'shampoo-normal-hair',
        description: 'Качественный шампунь для ежедневного использования',
        price: 1000,
        discountPrice: 800,
        article: 'SH-001',
        sku: 'SKU-SH-001',
        weight: 0.5,
        quantity: 100,
        images: ['https://example.com/shampoo1.jpg'],
        isNew: true,
        isDiscount: true,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'Шампунь для сухих волос',
        slug: 'shampoo-dry-hair',
        description: 'Увлажняющий шампунь для сухих волос',
        price: 1200,
        promotionPrice: 900,
        article: 'SH-002',
        sku: 'SKU-SH-002',
        weight: 0.5,
        quantity: 50,
        images: ['https://example.com/shampoo2.jpg'],
        isHit: true,
        hasPromotion: true,
        isActive: true,
      },
    }),
  ]);

  console.log('Seed completed:', { category, products });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:
```bash
npx prisma db seed
```

## Troubleshooting

### Common Issues

1. **404 on all product routes**
   - Ensure routes are registered before the 404 handler
   - Check that `app.use('/api/products', productsRoutes)` is added

2. **Validation errors**
   - Check that request body matches the expected schema
   - Ensure all required fields are provided

3. **Authentication errors on admin routes**
   - Verify JWT token is valid and not expired
   - Check that user has ADMIN role

4. **Database connection errors**
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Run `npx prisma migrate deploy`

5. **CORS errors**
   - Update FRONTEND_URL in .env
   - Check CORS configuration in index.ts

## Next Steps

1. Implement Categories module
2. Implement Cart module
3. Implement Orders module
4. Add product images upload
5. Add product analytics
6. Add caching layer (Redis)
7. Add rate limiting
8. Add API documentation (Swagger)

## Support

For issues or questions, please refer to the main project README or create an issue in the repository.

# Users Module - Quick Start Guide

## 1. Add to Main App (5 minutes)

Edit `/Users/valesios/Desktop/salmina/apps/backend/src/index.ts`:

```typescript
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { logger } from "./utils/logger";

// Import auth and user routes
import { authRoutes } from "./modules/auth";
import { userRoutes } from "./modules/users";

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

// Mount authentication routes
app.use("/api/auth", authRoutes);

// Mount user routes
app.use("/api/users", userRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📝 Environment: ${env.NODE_ENV}`);
  logger.info(`📚 API Documentation: http://localhost:${env.PORT}/api`);
});
```

## 2. Test the Endpoints (2 minutes)

### Step 1: Authenticate to get a token

```bash
# Login with Telegram (replace with real initData)
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "your-telegram-init-data"}'

# Response:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJhbGc...",
#     "refreshToken": "eyJhbGc...",
#     "user": { ... }
#   }
# }
```

Save the `accessToken` from the response.

### Step 2: Test user endpoints

```bash
# Set your token as a variable
TOKEN="your-access-token-here"

# Get current user profile
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Update profile
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "email": "user@example.com"
  }'

# Accept terms
curl -X POST http://localhost:3000/api/users/me/accept-terms \
  -H "Authorization: Bearer $TOKEN"
```

### Step 3: Test admin endpoints (requires ADMIN role)

```bash
# Set admin token
ADMIN_TOKEN="your-admin-token-here"

# Get all users
curl -X GET "http://localhost:3000/api/users?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get user by ID
curl -X GET http://localhost:3000/api/users/USER_UUID \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update user role
curl -X PATCH http://localhost:3000/api/users/USER_UUID/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'

# Deactivate user
curl -X DELETE http://localhost:3000/api/users/USER_UUID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 3. Frontend Integration (10 minutes)

### Create API client

```typescript
// lib/api/users.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userApi = {
  getCurrentUser: () =>
    api.get('/api/users/me').then(res => res.data.data),

  updateProfile: (data: { phone?: string; email?: string }) =>
    api.patch('/api/users/me', data).then(res => res.data.data),

  acceptTerms: () =>
    api.post('/api/users/me/accept-terms').then(res => res.data.data),

  // Admin methods
  getAllUsers: (params: any) =>
    api.get('/api/users', { params }).then(res => res.data.data),

  getUserById: (userId: string) =>
    api.get(`/api/users/${userId}`).then(res => res.data.data),

  updateUserRole: (userId: string, role: string) =>
    api.patch(`/api/users/${userId}/role`, { role }).then(res => res.data.data),

  deactivateUser: (userId: string) =>
    api.delete(`/api/users/${userId}`).then(res => res.data.data),
};
```

### Use in React component

```typescript
// components/UserProfile.tsx
import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api/users';

export function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userApi.getCurrentUser().then(setUser);
  }, []);

  const handleAcceptTerms = async () => {
    await userApi.acceptTerms();
    const updated = await userApi.getCurrentUser();
    setUser(updated);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>@{user.username}</p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>

      {!user.hasAcceptedTerms && (
        <button onClick={handleAcceptTerms}>
          Accept Terms
        </button>
      )}
    </div>
  );
}
```

## 4. Verify Everything Works

### Checklist

- [ ] Server starts without errors
- [ ] Can authenticate and get token
- [ ] GET /api/users/me returns current user
- [ ] PATCH /api/users/me updates profile
- [ ] POST /api/users/me/accept-terms works
- [ ] Admin can access GET /api/users
- [ ] Admin can update user roles
- [ ] Admin can deactivate users
- [ ] Regular users get 403 on admin endpoints
- [ ] Invalid tokens get 401 responses
- [ ] Validation errors return 422 with details

## 5. Production Deployment

### Environment Variables

Ensure these are set in production:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=very-secure-random-string-min-32-chars
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
TELEGRAM_BOT_TOKEN=your-bot-token
ADMIN_TELEGRAM_IDS=123456789,987654321
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Security

```typescript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Monitoring

```typescript
// Add request logging
import morgan from 'morgan';

app.use(morgan('combined'));

// Add error tracking (Sentry, etc.)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: env.NODE_ENV,
});
```

## Common Issues & Solutions

### Issue: "User not authenticated"
**Solution:** Check Authorization header format: `Bearer <token>`

### Issue: "Forbidden" on admin routes
**Solution:** Ensure user has ADMIN role and TELEGRAM_ID is in ADMIN_TELEGRAM_IDS

### Issue: Validation errors
**Solution:** Check request body format matches schema. Phone must be E.164 format.

### Issue: CORS errors
**Solution:** Add frontend URL to CORS whitelist in env

## Next Steps

1. Add integration tests
2. Set up CI/CD pipeline
3. Configure monitoring and alerts
4. Add API documentation (Swagger/OpenAPI)
5. Implement rate limiting per user
6. Add audit logging for admin actions
7. Set up database backups
8. Configure load balancer

## Support

For issues or questions:
- Check README.md for detailed documentation
- Check INTEGRATION.md for advanced examples
- Review error logs in console
- Check database connections
- Verify environment variables

## Quick Reference

**Module Location:** `/Users/valesios/Desktop/salmina/apps/backend/src/modules/users/`

**Files:**
- `users.service.ts` - Business logic
- `users.controller.ts` - HTTP handlers
- `users.routes.ts` - Route definitions
- `users.types.ts` - TypeScript types
- `users.validation.ts` - Zod schemas

**Import:**
```typescript
import { userRoutes, userService, UserDTO } from './modules/users';
```

**API Base:** `/api/users`

**Auth Required:** Yes (all endpoints)

**Admin Required:** Yes (for list, get by ID, role update, deactivate)

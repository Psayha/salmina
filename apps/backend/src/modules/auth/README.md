# Authentication Module

Complete authentication module for the backend with Clean Architecture principles.

## Overview

This module provides secure authentication using Telegram Mini App initData validation and JWT tokens. It includes:

- Telegram authentication validation
- JWT access and refresh tokens
- Token refresh mechanism
- Session management with Redis
- User creation and updates
- Current user retrieval

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

```
auth/
├── auth.types.ts       # Type definitions and interfaces
├── auth.validation.ts  # Zod validation schemas
├── auth.service.ts     # Business logic layer
├── auth.controller.ts  # HTTP request handlers
├── auth.routes.ts      # Express route definitions
└── index.ts           # Module exports
```

## Files

### auth.types.ts

Defines TypeScript interfaces and types:

- `AuthResponse` - Login response with tokens and user data
- `RefreshResponse` - Token refresh response
- `UserData` - Sanitized user data for client
- `TelegramUser` - Telegram user data structure
- `TokenPayload` - JWT token payload structure
- `toUserData()` - Helper to convert Prisma User to UserData

### auth.validation.ts

Zod validation schemas:

- `telegramAuthSchema` - Validates Telegram initData
- `refreshTokenSchema` - Validates refresh token requests
- `logoutSchema` - Validates logout requests

### auth.service.ts

Business logic implementation:

- `authenticateWithTelegram(initData)` - Validate Telegram data and return tokens
- `refreshAccessToken(refreshToken)` - Generate new access token
- `logout(userId)` - Invalidate user's refresh token
- `verifyToken(token)` - Verify and decode JWT token
- `getUserById(userId)` - Get user data by ID
- `revokeAllTokens(userId)` - Revoke all tokens for a user

Key features:
- Validates Telegram initData signature using HMAC-SHA256
- Checks auth_date to prevent replay attacks (24 hour max age)
- Creates new users or updates existing ones
- Stores refresh tokens in Redis with 7-day TTL
- Generates both access and refresh tokens
- Handles admin user detection from environment variables

### auth.controller.ts

HTTP request handlers:

- `authenticateWithTelegram()` - POST /api/auth/telegram
- `refreshAccessToken()` - POST /api/auth/refresh
- `logout()` - POST /api/auth/logout
- `getCurrentUser()` - GET /api/auth/me
- `verifyToken()` - POST /api/auth/verify

All methods handle errors properly and return consistent JSON responses.

### auth.routes.ts

Express route definitions with middleware:

- Routes are protected with authentication middleware where needed
- Validation middleware ensures request data integrity
- All routes are properly documented with JSDoc comments
- Includes request/response examples in comments

## API Endpoints

### POST /api/auth/telegram

Authenticate with Telegram initData.

**Request:**
```json
{
  "initData": "query_id=xxx&user={\"id\":123,\"first_name\":\"John\"}&auth_date=1699999999&hash=xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "telegramId": "123456789",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "photoUrl": "https://...",
      "phone": null,
      "email": null,
      "role": "USER",
      "isActive": true,
      "hasAcceptedTerms": false,
      "createdAt": "2024-11-13T12:00:00.000Z"
    }
  },
  "message": "Authentication successful"
}
```

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "telegramId": "123456789",
      ...
    }
  },
  "message": "Token refreshed successfully"
}
```

### POST /api/auth/logout

Logout user (requires authentication).

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
  "message": "Logout successful"
}
```

### GET /api/auth/me

Get current user info (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "photoUrl": "https://...",
    "phone": null,
    "email": null,
    "role": "USER",
    "isActive": true,
    "hasAcceptedTerms": false,
    "createdAt": "2024-11-13T12:00:00.000Z"
  },
  "message": "User data retrieved successfully"
}
```

### POST /api/auth/verify

Verify access token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "payload": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "telegramId": "123456789",
      "role": "USER"
    }
  },
  "message": "Token is valid"
}
```

## Security Features

1. **Telegram Signature Validation**
   - Validates initData using HMAC-SHA256
   - Prevents tampering with authentication data
   - Based on official Telegram documentation

2. **Replay Attack Prevention**
   - Checks auth_date timestamp
   - Rejects authentication data older than 24 hours

3. **Secure Token Storage**
   - Refresh tokens stored in Redis with TTL
   - Tokens can be revoked at any time
   - Automatic expiration after 7 days

4. **JWT Best Practices**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Separate secrets for access and refresh tokens

5. **User Validation**
   - Checks if user account is active
   - Validates user existence during token operations

## Usage Example

### Integration with Express App

```typescript
import express from 'express';
import { authRoutes } from './modules/auth';

const app = express();

// Mount auth routes
app.use('/api/auth', authRoutes);
```

### Frontend Integration

```typescript
// Login with Telegram
const initData = window.Telegram.WebApp.initData;
const response = await fetch('/api/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ initData }),
});

const { data } = await response.json();
const { accessToken, refreshToken } = data;

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Use access token for API requests
const apiResponse = await fetch('/api/products', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// Refresh token when access token expires
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken }),
});

const { data: refreshData } = await refreshResponse.json();
localStorage.setItem('accessToken', refreshData.accessToken);
```

## Environment Variables

Required environment variables:

```env
# JWT Secrets
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Redis
REDIS_URL=redis://localhost:6379

# Admin Users (comma-separated Telegram IDs)
ADMIN_TELEGRAM_IDS=123456789,987654321
```

## Error Handling

All errors are properly handled and returned with consistent format:

```json
{
  "success": false,
  "error": {
    "code": "TELEGRAM_AUTH_FAILED",
    "message": "Invalid Telegram authentication data",
    "statusCode": 401
  }
}
```

Common error codes:
- `TELEGRAM_AUTH_FAILED` - Invalid Telegram initData
- `INVALID_TOKEN` - Invalid or expired JWT token
- `TOKEN_EXPIRED` - Token has expired
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User account disabled or insufficient permissions
- `VALIDATION_ERROR` - Request validation failed

## Testing

### Manual Testing with curl

```bash
# Test Telegram authentication
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"query_id=xxx&user=xxx&auth_date=xxx&hash=xxx"}'

# Test token refresh
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your_refresh_token"}'

# Test get current user
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer your_access_token"

# Test logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer your_access_token"
```

## Dependencies

- `@prisma/client` - Database ORM
- `redis` - Token storage
- `jsonwebtoken` - JWT tokens
- `zod` - Validation
- `express` - HTTP framework

## Best Practices

1. **Always validate tokens** - Never trust client data
2. **Use HTTPS in production** - Protect tokens in transit
3. **Rotate secrets regularly** - Change JWT secrets periodically
4. **Monitor failed authentications** - Detect potential attacks
5. **Implement rate limiting** - Prevent brute force attacks
6. **Log security events** - Track authentication attempts
7. **Handle token expiration gracefully** - Implement automatic refresh

## Future Enhancements

Potential improvements:

- [ ] Add rate limiting for authentication endpoints
- [ ] Implement 2FA for admin users
- [ ] Add session management (multiple devices)
- [ ] Implement token blacklisting for immediate revocation
- [ ] Add OAuth2 support for other providers
- [ ] Implement password-based authentication as fallback
- [ ] Add email verification
- [ ] Implement "remember me" functionality
- [ ] Add device fingerprinting
- [ ] Implement suspicious activity detection

## License

Proprietary - All rights reserved

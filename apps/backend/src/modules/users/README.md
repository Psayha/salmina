# Users Module

Complete user management module built with Clean Architecture principles.

## Structure

```
users/
├── index.ts              # Module exports
├── users.types.ts        # TypeScript interfaces and DTOs
├── users.validation.ts   # Zod validation schemas
├── users.service.ts      # Business logic layer
├── users.controller.ts   # HTTP request handlers
└── users.routes.ts       # Express route definitions
```

## Features

### User Operations
- Get current user profile
- Update user profile (phone, email)
- Accept legal terms
- List all users with pagination and filters (admin only)
- Get user by ID (admin only)
- Update user role (admin only)
- Deactivate/reactivate user accounts (admin only)

### Security
- JWT authentication required for all endpoints
- Role-based authorization (admin routes)
- Input validation with Zod
- Sanitized responses (no sensitive data)
- Prevents admins from modifying their own role/status

### Data Integrity
- Validates phone numbers and email formats
- Prevents duplicate term acceptance
- Tracks term acceptance timestamps
- Proper error handling with custom error classes

## API Endpoints

### Current User Endpoints

#### GET /api/users/me
Get current authenticated user profile.

**Authentication:** Required
**Authorization:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "photoUrl": "https://...",
    "phone": "+1234567890",
    "email": "john@example.com",
    "role": "USER",
    "isActive": true,
    "hasAcceptedTerms": true,
    "termsAcceptedAt": "2024-11-13T...",
    "createdAt": "2024-11-13T...",
    "updatedAt": "2024-11-13T..."
  },
  "message": "User profile retrieved successfully"
}
```

#### PATCH /api/users/me
Update current user profile.

**Authentication:** Required
**Authorization:** Any authenticated user

**Request Body:**
```json
{
  "phone": "+1234567890",  // optional
  "email": "john@example.com"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Updated user object */ },
  "message": "User profile updated successfully"
}
```

#### POST /api/users/me/accept-terms
Accept legal terms.

**Authentication:** Required
**Authorization:** Any authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "termsAcceptedAt": "2024-11-13T..."
  },
  "message": "Terms accepted successfully"
}
```

### Admin Endpoints

#### GET /api/users
Get all users with pagination and filters.

**Authentication:** Required
**Authorization:** Admin only

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `role` (string, optional) - Filter by role: "USER" or "ADMIN"
- `isActive` (boolean, optional) - Filter by active status
- `hasAcceptedTerms` (boolean, optional) - Filter by terms acceptance
- `search` (string, optional) - Search by username, name, phone, email

**Example:** `/api/users?page=1&limit=20&role=USER&isActive=true&search=john`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      { /* User object */ },
      { /* User object */ }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "Users retrieved successfully"
}
```

#### GET /api/users/:id
Get user by ID.

**Authentication:** Required
**Authorization:** Admin only

**URL Parameters:**
- `id` (UUID) - User ID

**Response:**
```json
{
  "success": true,
  "data": { /* User object */ },
  "message": "User retrieved successfully"
}
```

#### PATCH /api/users/:id/role
Update user role.

**Authentication:** Required
**Authorization:** Admin only

**URL Parameters:**
- `id` (UUID) - User ID

**Request Body:**
```json
{
  "role": "USER" // or "ADMIN"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* Updated user object */ },
  "message": "User role updated successfully"
}
```

**Note:** Admins cannot change their own role.

#### DELETE /api/users/:id
Deactivate user account.

**Authentication:** Required
**Authorization:** Admin only

**URL Parameters:**
- `id` (UUID) - User ID

**Response:**
```json
{
  "success": true,
  "data": { /* Deactivated user object */ },
  "message": "User deactivated successfully"
}
```

**Note:** Admins cannot deactivate their own account.

#### POST /api/users/:id/reactivate
Reactivate user account.

**Authentication:** Required
**Authorization:** Admin only

**URL Parameters:**
- `id` (UUID) - User ID

**Response:**
```json
{
  "success": true,
  "data": { /* Reactivated user object */ },
  "message": "User reactivated successfully"
}
```

## Usage Example

### Integrating with Express App

```typescript
import express from 'express';
import { userRoutes } from './modules/users';

const app = express();

// Mount user routes
app.use('/api/users', userRoutes);
```

### Using the Service Layer

```typescript
import { userService } from './modules/users';

// Get user by ID
const user = await userService.getUserById('user-uuid');

// Update user profile
const updatedUser = await userService.updateUserProfile('user-uuid', {
  phone: '+1234567890',
  email: 'john@example.com'
});

// Accept terms
const result = await userService.acceptTerms('user-uuid');

// Get all users (admin)
const users = await userService.getAllUsers(
  { page: 1, limit: 20 },
  { role: 'USER', isActive: true, search: 'john' }
);

// Update user role (admin)
const admin = await userService.updateUserRole('user-uuid', 'ADMIN');

// Deactivate user (admin)
const deactivated = await userService.deactivateUser('user-uuid');
```

## Error Handling

The module uses custom error classes from `common/errors/AppError.ts`:

- `NotFoundError` - User not found (404)
- `BadRequestError` - Invalid request data (400)
- `ForbiddenError` - Insufficient permissions (403)
- `ValidationError` - Validation failed (422)

All errors are handled by the global error handler middleware.

## Validation

All inputs are validated using Zod schemas:

- Phone numbers must match E.164 format
- Email addresses must be valid
- UUIDs must be valid v4 format
- Role must be "USER" or "ADMIN"
- Pagination limits enforced (max 100 per page)

## Database Schema

Uses Prisma ORM with PostgreSQL. Relevant User model fields:

```prisma
model User {
  id                String    @id @default(uuid())
  telegramId        BigInt    @unique
  username          String?
  firstName         String
  lastName          String?
  photoUrl          String?
  phone             String?
  email             String?
  role              UserRole  @default(USER)
  isActive          Boolean   @default(true)
  hasAcceptedTerms  Boolean   @default(false)
  termsAcceptedAt   DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum UserRole {
  USER
  ADMIN
}
```

## Testing

### Example Test Cases

```typescript
describe('UserService', () => {
  it('should get user by ID', async () => {
    const user = await userService.getUserById('valid-uuid');
    expect(user).toBeDefined();
    expect(user.id).toBe('valid-uuid');
  });

  it('should throw NotFoundError for non-existent user', async () => {
    await expect(
      userService.getUserById('non-existent-uuid')
    ).rejects.toThrow(NotFoundError);
  });

  it('should update user profile', async () => {
    const updated = await userService.updateUserProfile('valid-uuid', {
      phone: '+1234567890'
    });
    expect(updated.phone).toBe('+1234567890');
  });

  it('should accept terms', async () => {
    const result = await userService.acceptTerms('valid-uuid');
    expect(result.success).toBe(true);
    expect(result.termsAcceptedAt).toBeDefined();
  });

  it('should prevent duplicate term acceptance', async () => {
    await expect(
      userService.acceptTerms('user-who-already-accepted')
    ).rejects.toThrow(BadRequestError);
  });
});
```

## Architecture Principles

### Clean Architecture Layers

1. **Routes Layer** (`users.routes.ts`)
   - HTTP route definitions
   - Middleware application
   - Request/response mapping

2. **Controller Layer** (`users.controller.ts`)
   - HTTP request handling
   - Input extraction
   - Response formatting

3. **Service Layer** (`users.service.ts`)
   - Business logic
   - Data validation
   - Database operations

4. **Types Layer** (`users.types.ts`)
   - DTOs and interfaces
   - Type conversions
   - Data sanitization

5. **Validation Layer** (`users.validation.ts`)
   - Input validation schemas
   - Type inference

### Dependency Flow

```
Routes → Controller → Service → Database (Prisma)
                ↓
          Validation
                ↓
             Types
```

### Best Practices Implemented

- Single Responsibility Principle
- Dependency Injection (via singletons)
- Input validation at boundaries
- Proper error handling
- Logging for observability
- Type safety with TypeScript
- No business logic in controllers
- Sanitized data in responses
- RESTful API design
- Comprehensive JSDoc comments

## Production Considerations

### Security
- Always use HTTPS in production
- Set proper CORS policies
- Implement rate limiting
- Use environment variables for secrets
- Validate all user inputs
- Sanitize outputs

### Performance
- Pagination prevents large data loads
- Database indexes on frequently queried fields
- Efficient query construction
- Redis caching for frequently accessed data

### Monitoring
- All operations logged with Winston
- Error tracking with stack traces
- Performance metrics
- User activity tracking

### Scalability
- Stateless design
- Database connection pooling
- Horizontal scaling ready
- Microservices compatible

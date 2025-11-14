# Users Module Integration Guide

## Quick Start

### 1. Mount Routes in Express App

Add the users routes to your main Express application:

```typescript
// src/index.ts or src/app.ts
import express from 'express';
import { userRoutes } from './modules/users';
import { authRoutes } from './modules/auth';

const app = express();

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount user routes
app.use('/api/users', userRoutes);

export default app;
```

### 2. Ensure Middleware is Configured

Make sure you have the required middleware configured before mounting routes:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
```

### 3. Test the Endpoints

#### Test Current User Profile

```bash
# Get current user profile
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Update current user profile
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "email": "john@example.com"
  }'

# Accept terms
curl -X POST http://localhost:3000/api/users/me/accept-terms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Admin Endpoints

```bash
# Get all users (admin only)
curl -X GET "http://localhost:3000/api/users?page=1&limit=20&role=USER" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

# Get user by ID (admin only)
curl -X GET http://localhost:3000/api/users/USER_UUID \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

# Update user role (admin only)
curl -X PATCH http://localhost:3000/api/users/USER_UUID/role \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'

# Deactivate user (admin only)
curl -X DELETE http://localhost:3000/api/users/USER_UUID \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

# Reactivate user (admin only)
curl -X POST http://localhost:3000/api/users/USER_UUID/reactivate \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

## Frontend Integration

### React/Next.js Example

```typescript
// lib/api/users.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API methods
export const userApi = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data.data;
  },

  // Update current user profile
  updateProfile: async (data: { phone?: string; email?: string }) => {
    const response = await api.patch('/api/users/me', data);
    return response.data.data;
  },

  // Accept terms
  acceptTerms: async () => {
    const response = await api.post('/api/users/me/accept-terms');
    return response.data.data;
  },

  // Get all users (admin)
  getAllUsers: async (params: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/api/users', { params });
    return response.data.data;
  },

  // Get user by ID (admin)
  getUserById: async (userId: string) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.data;
  },

  // Update user role (admin)
  updateUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
    const response = await api.patch(`/api/users/${userId}/role`, { role });
    return response.data.data;
  },

  // Deactivate user (admin)
  deactivateUser: async (userId: string) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data.data;
  },

  // Reactivate user (admin)
  reactivateUser: async (userId: string) => {
    const response = await api.post(`/api/users/${userId}/reactivate`);
    return response.data.data;
  },
};
```

### React Component Example

```typescript
// components/UserProfile.tsx
import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api/users';

export function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: { phone?: string; email?: string }) => {
    try {
      const updated = await userApi.updateProfile(data);
      setUser(updated);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleAcceptTerms = async () => {
    try {
      await userApi.acceptTerms();
      await loadUser(); // Reload user data
      alert('Terms accepted successfully');
    } catch (error) {
      console.error('Failed to accept terms:', error);
      alert('Failed to accept terms');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <div>
        <p>Name: {user.firstName} {user.lastName}</p>
        <p>Username: @{user.username}</p>
        <p>Email: {user.email}</p>
        <p>Phone: {user.phone}</p>
        <p>Role: {user.role}</p>
        <p>Terms Accepted: {user.hasAcceptedTerms ? 'Yes' : 'No'}</p>
      </div>

      {!user.hasAcceptedTerms && (
        <button onClick={handleAcceptTerms}>
          Accept Terms
        </button>
      )}
    </div>
  );
}
```

### Admin Panel Example

```typescript
// components/AdminUserList.tsx
import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api/users';

export function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAllUsers({
        page,
        limit: 20,
        ...filters,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await userApi.deactivateUser(userId);
      await loadUsers(); // Reload list
      alert('User deactivated successfully');
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      alert('Failed to deactivate user');
    }
  };

  const handleUpdateRole = async (userId: string, role: 'USER' | 'ADMIN') => {
    if (!confirm(`Are you sure you want to change this user's role to ${role}?`)) return;

    try {
      await userApi.updateUserRole(userId, role);
      await loadUsers(); // Reload list
      alert('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  return (
    <div>
      <h1>User Management</h1>

      {/* Filters */}
      <div>
        <select onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        <select onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* User List */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>@{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                {user.isActive ? (
                  <button onClick={() => handleDeactivateUser(user.id)}>
                    Deactivate
                  </button>
                ) : (
                  <button onClick={() => userApi.reactivateUser(user.id).then(loadUsers)}>
                    Reactivate
                  </button>
                )}

                <button onClick={() => handleUpdateRole(
                  user.id,
                  user.role === 'USER' ? 'ADMIN' : 'USER'
                )}>
                  Change Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <div>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <span>Page {pagination.page} of {pagination.totalPages}</span>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

## Database Migration

If you need to add or modify user-related fields, run migrations:

```bash
# Generate migration
npx prisma migrate dev --name add_user_fields

# Apply migration to production
npx prisma migrate deploy
```

## Environment Variables

Ensure these environment variables are set:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Telegram
TELEGRAM_BOT_TOKEN="your-bot-token"
ADMIN_TELEGRAM_IDS="123456789,987654321"

# Server
PORT=3000
NODE_ENV="production"
API_URL="https://api.yourdomain.com"
FRONTEND_URL="https://yourdomain.com"
```

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] HTTPS enabled in production
- [ ] CORS configured for your frontend domain only
- [ ] Rate limiting enabled (use express-rate-limit)
- [ ] Helmet middleware configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protected (Prisma handles this)
- [ ] XSS protection enabled
- [ ] Authentication required on protected routes
- [ ] Admin-only routes properly secured

## Troubleshooting

### Common Issues

**Issue:** "User not authenticated" error
- **Solution:** Ensure JWT token is being sent in Authorization header
- Check token expiry and refresh if needed

**Issue:** "Forbidden" error on admin routes
- **Solution:** Verify user has ADMIN role
- Check ADMIN_TELEGRAM_IDS environment variable

**Issue:** Validation errors
- **Solution:** Check request body format matches schema
- Ensure phone numbers use E.164 format
- Verify email format is valid

**Issue:** Database connection errors
- **Solution:** Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run migrations if needed

## Performance Tips

1. **Enable caching** for frequently accessed user data
2. **Use pagination** for large user lists
3. **Add database indexes** on frequently queried fields
4. **Implement connection pooling** for database
5. **Use Redis** for session storage
6. **Enable compression** for API responses

## Monitoring

Add logging and monitoring for:

- User authentication attempts
- Profile updates
- Admin actions (role changes, deactivations)
- Failed login attempts
- API response times
- Database query performance

Use tools like:
- Winston (logging)
- Prometheus (metrics)
- Sentry (error tracking)
- Datadog (APM)

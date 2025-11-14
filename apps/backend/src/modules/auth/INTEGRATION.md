# Auth Module Integration Guide

This guide shows how to integrate the authentication module into your Express application.

## Quick Start

### 1. Mount Auth Routes

In your main `index.ts` or `app.ts`:

```typescript
import express from 'express';
import { authRoutes } from './modules/auth';

const app = express();

// Mount authentication routes
app.use('/api/auth', authRoutes);
```

### 2. Protect Routes with Authentication

Use the `authenticate` middleware to protect routes:

```typescript
import { Router } from 'express';
import { authenticate } from './common/middleware/auth.middleware';

const router = Router();

// Public route - no authentication
router.get('/products', (req, res) => {
  // Anyone can access
});

// Protected route - requires authentication
router.post('/orders', authenticate, (req, res) => {
  // Only authenticated users can access
  const userId = req.user?.userId;
  // ... create order
});
```

### 3. Use User Data in Controllers

Access authenticated user data in your controllers:

```typescript
import { AuthRequest } from './common/middleware/auth.middleware';

async function createOrder(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = req.user.userId;
  const userRole = req.user.role;

  // Use user data to create order
  const order = await orderService.create({
    userId,
    // ... other order data
  });

  res.json({ data: order });
}
```

### 4. Protect Admin Routes

Use the `requireAdmin` middleware for admin-only routes:

```typescript
import { Router } from 'express';
import { authenticate, requireAdmin } from './common/middleware/auth.middleware';

const router = Router();

// Admin-only route
router.get('/admin/users',
  authenticate,
  requireAdmin,
  async (req, res) => {
    // Only admins can access
    const users = await prisma.user.findMany();
    res.json({ data: users });
  }
);
```

## Frontend Integration

### Telegram Mini App Setup

```typescript
// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();

// Get initData for authentication
const initData = tg.initData;

if (!initData) {
  console.error('No Telegram initData available');
  return;
}

// Authenticate with backend
async function login() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const { data } = await response.json();

    // Store tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    // Store user data
    localStorage.setItem('user', JSON.stringify(data.user));

    console.log('Logged in as:', data.user.firstName);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

### API Client with Auto Token Refresh

```typescript
class ApiClient {
  private baseUrl = 'http://localhost:3001/api';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from storage
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Make authenticated request
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;

    // Add auth header if token exists
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    return response;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, clear tokens
        this.clearTokens();
        return false;
      }

      const { data } = await response.json();

      // Update access token
      this.accessToken = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await this.request('/auth/me');

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    const { data } = await response.json();
    return data;
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Clear tokens from memory and storage
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// Export singleton instance
export const api = new ApiClient();
```

### Usage Example

```typescript
// Login
await login();

// Make authenticated requests
const response = await api.request('/products');
const { data } = await response.json();

// Get current user
const user = await api.getCurrentUser();
console.log('Current user:', user);

// Create order (authenticated)
const orderResponse = await api.request('/orders', {
  method: 'POST',
  body: JSON.stringify({
    items: [{ productId: 'xxx', quantity: 1 }],
  }),
});

// Logout
await api.logout();
```

## React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setUser(data);
      } else {
        // Token invalid, try refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const { data } = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  async function login() {
    const initData = window.Telegram.WebApp.initData;

    const response = await fetch('http://localhost:3001/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    if (response.ok) {
      const { data } = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      return data.user;
    }

    throw new Error('Login failed');
  }

  async function logout() {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    logout,
  };
}
```

### React Component Usage

```typescript
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please login</h1>
        <button onClick={login}>Login with Telegram</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Testing

### Manual Testing with curl

```bash
# 1. Get initData from Telegram Mini App (in browser console)
echo window.Telegram.WebApp.initData

# 2. Test authentication
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "query_id=AAG3YwwzAAAAALdjDDMZd4j4&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22username%22%3A%22johndoe%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1699999999&hash=xxx"
  }'

# 3. Save tokens from response
ACCESS_TOKEN="your_access_token_here"
REFRESH_TOKEN="your_refresh_token_here"

# 4. Test authenticated endpoint
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 5. Test token refresh
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"

# 6. Test logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Troubleshooting

### "Invalid Telegram authentication data" error

**Cause:** Telegram initData signature validation failed.

**Solutions:**
1. Ensure `TELEGRAM_BOT_TOKEN` environment variable is set correctly
2. Check that initData hasn't been modified
3. Verify initData is fresh (less than 24 hours old)
4. Make sure you're using the correct bot token for your Mini App

### "Token has expired" error

**Cause:** Access token expired (default: 15 minutes).

**Solution:** Use the refresh token to get a new access token:

```typescript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken }),
});
```

### "Refresh token has been revoked" error

**Cause:** Refresh token not found in Redis or user logged out.

**Solution:** User needs to login again with Telegram initData.

### Redis connection errors

**Cause:** Redis server not running or wrong connection URL.

**Solutions:**
1. Start Redis: `redis-server`
2. Check `REDIS_URL` environment variable
3. Verify Redis is accessible: `redis-cli ping`

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Rotate JWT secrets regularly
- [ ] Monitor failed authentication attempts
- [ ] Implement rate limiting on auth endpoints
- [ ] Use strong Redis password in production
- [ ] Enable Redis persistence
- [ ] Set up Redis replication
- [ ] Monitor Redis memory usage
- [ ] Log security events
- [ ] Implement account lockout after failed attempts
- [ ] Add CORS restrictions
- [ ] Validate all user input
- [ ] Keep dependencies updated

## Support

For issues or questions:
1. Check the [README.md](./README.md) documentation
2. Review error logs in the console
3. Enable debug logging: `NODE_ENV=development`
4. Check Telegram Bot API documentation
5. Verify environment variables are set correctly

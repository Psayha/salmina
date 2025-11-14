# Quick Start Guide - Authentication Module

Get the authentication module up and running in 5 minutes.

## Step 1: Verify Environment Variables

Add these to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-access-token-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Redis
REDIS_URL=redis://localhost:6379

# Admin Users (comma-separated Telegram IDs)
ADMIN_TELEGRAM_IDS=123456789,987654321

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```

## Step 2: Start Required Services

```bash
# Start PostgreSQL (if not running)
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Start Redis (required for token storage)
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

## Step 3: Run Database Migration

```bash
cd apps/backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

## Step 4: Mount Auth Routes in Your App

Edit your `apps/backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './modules/auth';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

## Step 5: Start the Backend

```bash
cd apps/backend
npm run dev
```

You should see:

```
✅ Database connected successfully
✅ Redis Client ready
🚀 Server running on http://localhost:3001
```

## Step 6: Test Authentication

### Option A: Using Telegram Mini App (Recommended)

1. Open your Telegram Mini App
2. In browser console, get initData:
```javascript
const initData = window.Telegram.WebApp.initData;
console.log(initData);
```

3. Test authentication:
```javascript
fetch('http://localhost:3001/api/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ initData })
})
.then(r => r.json())
.then(data => {
  console.log('Login success:', data);
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
});
```

### Option B: Using curl (for testing)

```bash
# Replace with your actual initData from Telegram
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "initData": "query_id=xxx&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%7D&auth_date=1699999999&hash=xxx"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "telegramId": "123456789",
      "firstName": "John",
      "role": "USER",
      ...
    }
  },
  "message": "Authentication successful"
}
```

## Step 7: Test Protected Endpoints

```bash
# Save the access token
ACCESS_TOKEN="your_access_token_here"

# Test /me endpoint
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Step 8: Protect Your Routes

Add authentication to your existing routes:

```typescript
import { Router } from 'express';
import { authenticate } from './common/middleware/auth.middleware';

const router = Router();

// Public route
router.get('/api/products', getProducts);

// Protected route - requires authentication
router.post('/api/orders', authenticate, createOrder);

// Admin-only route
router.get('/api/admin/users', authenticate, requireAdmin, getUsers);
```

Access user data in controllers:

```typescript
import { AuthRequest } from './common/middleware/auth.middleware';

async function createOrder(req: AuthRequest, res: Response) {
  const userId = req.user?.userId; // User ID from JWT
  const userRole = req.user?.role;  // User role

  // Create order for authenticated user
  const order = await prisma.order.create({
    data: {
      userId,
      // ... other order data
    }
  });

  res.json({ data: order });
}
```

## Common Issues & Solutions

### Issue: "Invalid Telegram authentication data"

**Solution:**
- Check `TELEGRAM_BOT_TOKEN` is correct
- Verify initData is fresh (< 24 hours old)
- Make sure initData hasn't been modified

### Issue: "Redis connection failed"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not, start Redis
brew services start redis  # macOS
sudo systemctl start redis # Linux
```

### Issue: "Database connection failed"

**Solution:**
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Run migrations
npm run db:migrate
```

### Issue: "Token has expired"

**Solution:**
- This is normal for access tokens (15 min TTL)
- Use refresh token to get new access token
- Implement automatic token refresh in frontend

### Issue: CORS errors

**Solution:**
Add CORS configuration in `index.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Frontend Integration (React Example)

Create `src/lib/auth.ts`:

```typescript
const API_URL = 'http://localhost:3001/api';

export async function loginWithTelegram() {
  const initData = window.Telegram.WebApp.initData;

  const response = await fetch(`${API_URL}/auth/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData })
  });

  if (!response.ok) throw new Error('Login failed');

  const { data } = await response.json();

  // Store tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);

  return data.user;
}

export async function getCurrentUser() {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Failed to get user');

  const { data } = await response.json();
  return data;
}

export async function logout() {
  const token = localStorage.getItem('accessToken');

  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
```

Use in your app:

```typescript
import { loginWithTelegram, getCurrentUser, logout } from './lib/auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auto-login on mount
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Not logged in, show login button
      });
  }, []);

  async function handleLogin() {
    const user = await loginWithTelegram();
    setUser(user);
  }

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome, {user.firstName}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Telegram</button>
      )}
    </div>
  );
}
```

## Verify Everything Works

### Checklist

- [ ] Backend starts without errors
- [ ] Database is connected
- [ ] Redis is connected
- [ ] Can authenticate with Telegram initData
- [ ] Receive access and refresh tokens
- [ ] Can access /api/auth/me with token
- [ ] Can refresh access token
- [ ] Can logout successfully
- [ ] Protected routes require authentication
- [ ] Invalid tokens are rejected
- [ ] User data is stored in database
- [ ] Admin users have correct role

### Test Commands

```bash
# 1. Check health
curl http://localhost:3001/health

# 2. Check Redis
redis-cli ping

# 3. Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. View logs
npm run dev
```

## Next Steps

Now that authentication is working:

1. **Add More Modules**: Create product, order, cart modules
2. **Add Rate Limiting**: Protect against brute force attacks
3. **Add Logging**: Track authentication events
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: Set up production environment

## Support & Documentation

- **Full Documentation**: See [README.md](./README.md)
- **Integration Guide**: See [INTEGRATION.md](./INTEGRATION.md)
- **API Reference**: See [README.md](./README.md#api-endpoints)
- **Architecture**: See [SUMMARY.md](./SUMMARY.md)

## Congratulations!

You now have a complete, production-ready authentication system with:

✅ Telegram authentication
✅ JWT tokens (access + refresh)
✅ Redis token storage
✅ User management
✅ Protected routes
✅ Type-safe code
✅ Comprehensive error handling

Start building your application features!

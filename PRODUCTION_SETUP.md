# Production Setup Guide

## Infrastructure

- **Frontend**: https://salminashop.ru
- **Backend API**: https://app.salminashop.ru
- **Server**: VPS at `/var/www/telegram-shop`
- **Process Manager**: PM2

## Environment Variables

### Backend (.env in /var/www/telegram-shop)

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://salminashop.ru

# Database, Redis, JWT, Telegram - see .env.example for details
```

### Frontend

Frontend automatically detects production environment based on hostname:
- When accessed via `salminashop.ru`, uses `https://app.salminashop.ru/api`
- When accessed via `localhost:3000`, uses `http://localhost:3001/api`
- Can be overridden with `NEXT_PUBLIC_API_URL` environment variable

## Deployment

Deployment is automated via GitHub Actions (`.github/workflows/deploy-production.yml`):

1. Push to `main` branch triggers deployment
2. Code is pulled to VPS
3. Dependencies installed
4. Backend and frontend built
5. PM2 processes restarted

## Troubleshooting

### Issue: "Что-то пошло не так" error in Telegram Mini App

**Symptoms**: ErrorBoundary shows error screen when opening app via Telegram

**Root Cause**:
- TypeError: `undefined is not an object (evaluating 'p.map')`
- API fetch errors not handled gracefully
- Missing null checks in `apps/frontend/app/page.tsx`

**Fix Applied** (2025-11-22):
1. Added optional chaining and fallback values in `page.tsx:38-39`:
   ```typescript
   setProducts(productsResponse?.items || []);
   setCategories([{ id: 'all', name: 'Все товары', slug: 'all' }, ...(categoriesResponse || [])]);
   ```
2. Removed `throw error` from `autoLoginWithTelegram` in `apps/frontend/store/useAuthStore.ts`
3. Added Eruda mobile DevTools for production debugging (`apps/frontend/components/Eruda.tsx`)

**Files Modified**:
- `apps/frontend/app/page.tsx` - Safe API response handling
- `apps/frontend/store/useAuthStore.ts` - Remove error throw
- `apps/frontend/app/layout.tsx` - Add Eruda component
- `apps/frontend/components/Eruda.tsx` - Mobile debugging tool

### Issue: Cannot login via Telegram in production

**Cause**: Frontend trying to connect to wrong API URL (localhost instead of production)

**Fix Applied** (2025-11-22):
1. Frontend auto-detection added in `apps/frontend/lib/api/client.ts`
2. Backend CORS updated to allow multiple origins in `apps/backend/src/index.ts`
3. Ensure `FRONTEND_URL=https://salminashop.ru` is set in backend .env on server

### Issue: CORS errors

**Allowed Origins**:
- `https://salminashop.ru`
- `https://www.salminashop.ru`
- `http://localhost:3000` (development)
- Value from `FRONTEND_URL` environment variable

Check backend logs for CORS warnings.

## Health Checks

- Backend health: https://app.salminashop.ru/health
- Frontend: https://salminashop.ru

## Debugging Tools

### Eruda Mobile DevTools

Production site includes Eruda - a mobile DevTools console for debugging:
- Automatically loads on app start
- Floating button in bottom-right corner
- Access to Console, Network, Elements, Resources tabs
- Essential for debugging Telegram Mini App issues

### SSH Commands for Production Debugging

```bash
# Connect to server
ssh USER@SERVER_IP

# Navigate to project
cd /var/www/telegram-shop

# Check PM2 status
pm2 status

# View backend logs
pm2 logs telegram-shop-backend --lines 100

# View frontend logs
pm2 logs telegram-shop-frontend --lines 100

# View all logs in real-time
pm2 logs

# Check environment variables
cat .env | grep -E "NODE_ENV|FRONTEND_URL|PORT"

# Check latest deployment
git log --oneline -5

# Restart services
pm2 restart telegram-shop-backend
pm2 restart telegram-shop-frontend

# Rebuild frontend after code changes
cd apps/frontend
pnpm build
cd /var/www/telegram-shop
pm2 restart telegram-shop-frontend
```

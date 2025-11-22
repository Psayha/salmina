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

### Issue: Cannot login via Telegram in production

**Cause**: Frontend trying to connect to wrong API URL (localhost instead of production)

**Fix**:
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

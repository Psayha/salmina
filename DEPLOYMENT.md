# 🚀 Deployment & Setup Guide

Полное руководство от локальной разработки до production deployment.

---

## 📊 Текущий Статус

**Frontend:** ✅ Ready for production
- TypeScript: 0 errors
- Production build: Successful
- 11 pages, 15 components

**Backend:** ✅ Ready for production
- TypeScript: 0 errors
- Production build: Successful
- 9 модулей, 51 endpoints реализованы

**CI/CD:** ✅ Configured
- GitHub Actions workflows ready
- Automated testing pipeline
- Automated deployment pipeline

**Статус:** Проект полностью готов к deployment! 🚀

---

## 🏃 Quick Start (Локальная Разработка)

### 1. Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd salmina

# Установить зависимости
pnpm install
```

### 2. Настройка окружения

```bash
# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local

# Backend
cp apps/backend/.env.example apps/backend/.env
```

**Отредактируйте `apps/backend/.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/telegram_shop"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="generated-secret-32-chars-min"
JWT_REFRESH_SECRET="another-secret-32-chars-min"
TELEGRAM_BOT_TOKEN="your-bot-token"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

**Генерация JWT secrets:**
```bash
openssl rand -base64 32
```

### 3. Запуск базы данных

```bash
# Запустить PostgreSQL и Redis
docker-compose up -d

# Проверить
docker-compose ps
```

### 4. Backend setup

```bash
cd apps/backend

# Применить миграции
pnpm prisma migrate dev

# Загрузить тестовые данные
pnpm prisma db seed

# Запустить backend
pnpm dev
```

Backend: http://localhost:3001

### 5. Frontend setup

```bash
# В новом терминале
cd apps/frontend
pnpm dev
```

Frontend: http://localhost:3000

### 6. Telegram Bot Setup (для Telegram Mini App)

1. Создать бота через @BotFather: `/newbot`
2. Получить токен → добавить в `apps/backend/.env`
3. Создать Mini App: `/newapp`
4. Web App URL: `http://localhost:3000`
5. Menu button: `/setmenubutton`

---

## 📋 Production Requirements

- [ ] Backend API готов и задеплоен
- [ ] PostgreSQL база данных настроена
- [ ] Redis сервер настроен
- [ ] Domain name зарегистрирован
- [ ] SSL сертификат получен
- [ ] Telegram Bot создан и настроен

---

## 🏗️ Архитектура Production

```
┌─────────────────┐
│   Cloudflare    │ ← CDN + SSL + DDoS Protection
└────────┬────────┘
         │
┌────────▼────────┐
│   Nginx/Caddy   │ ← Reverse Proxy
└────┬────────┬───┘
     │        │
┌────▼─────┐ ┌▼──────────┐
│ Frontend │ │  Backend  │
│ Next.js  │ │  Express  │
│  :3000   │ │   :3001   │
└──────────┘ └───┬───────┘
                 │
         ┌───────▼───────┐
         │  PostgreSQL   │
         │     :5432     │
         └───────────────┘
         ┌───────────────┐
         │     Redis     │
         │     :6379     │
         └───────────────┘
```

---

## 🖥️ Option 1: VPS Deployment (Recommended)

### 1. Подготовка сервера

```bash
# Подключиться к серверу
ssh root@your-server-ip

# Обновить систему
apt update && apt upgrade -y

# Установить необходимое ПО
apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Установить pnpm
npm install -g pnpm

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установить Docker Compose
apt install -y docker-compose
```

### 2. Клонирование репозитория

```bash
# Создать директорию для приложения
mkdir -p /var/www/telegram-shop
cd /var/www/telegram-shop

# Клонировать репозиторий
git clone <your-repo-url> .

# Установить зависимости
pnpm install
```

### 3. Настройка окружения

```bash
# Backend environment
cat > apps/backend/.env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/telegram_shop_prod"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"
TELEGRAM_BOT_TOKEN="your-bot-token"
NODE_ENV=production
PORT=3001
CORS_ORIGIN="https://yourdomain.com"
EOF

# Frontend environment
cat > apps/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENV=production
EOF
```

### 4. Запуск баз данных

```bash
# Запустить PostgreSQL и Redis через Docker
docker-compose up -d postgres redis

# Применить миграции
cd apps/backend
pnpm prisma migrate deploy
pnpm prisma db seed
cd ../..
```

### 5. Сборка приложений

```bash
# Собрать backend
cd apps/backend
pnpm build
cd ../..

# Собрать frontend
cd apps/frontend
pnpm build
cd ../..
```

### 6. Настройка PM2 для Backend

```bash
# Установить PM2
npm install -g pm2

# Создать ecosystem файл
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'telegram-shop-backend',
      script: 'apps/backend/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'telegram-shop-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: 'apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
EOF

# Запустить приложения
pm2 start ecosystem.config.js

# Настроить автозапуск
pm2 startup
pm2 save
```

### 7. Настройка Nginx

```bash
# Создать конфигурацию
cat > /etc/nginx/sites-available/telegram-shop << 'EOF'
# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активировать конфигурацию
ln -s /etc/nginx/sites-available/telegram-shop /etc/nginx/sites-enabled/

# Проверить конфигурацию
nginx -t

# Перезапустить Nginx
systemctl restart nginx
```

### 8. Настройка SSL с Let's Encrypt

```bash
# Получить SSL сертификаты
certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Автообновление (уже настроено автоматически)
```

### 9. Настройка Telegram Bot

```bash
# Установить webhook для Mini App
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.yourdomain.com/api/telegram/webhook"}'

# Настроить Mini App URL в BotFather
# /setmenubutton -> выбрать бота -> URL: https://yourdomain.com
```

---

## ☁️ Option 2: Vercel + Railway

### Frontend (Vercel)

```bash
# Установить Vercel CLI
npm install -g vercel

# Деплой frontend
cd apps/frontend
vercel --prod

# Настроить environment variables в Vercel Dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Backend (Railway)

```bash
# Установить Railway CLI
npm install -g @railway/cli

# Login
railway login

# Создать новый проект
railway init

# Deploy
railway up

# Добавить PostgreSQL
railway add --plugin postgresql

# Добавить Redis
railway add --plugin redis

# Настроить environment variables в Railway Dashboard
```

---

## 🐳 Option 3: Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: telegram_shop_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - app-network

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/telegram_shop_prod
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com
    depends_on:
      - backend
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

```bash
# Запуск
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Мониторинг и логирование

### PM2 мониторинг

```bash
# Просмотр логов
pm2 logs

# Мониторинг
pm2 monit

# Веб-интерфейс
pm2 install pm2-logrotate
pm2 web
```

### Sentry (Error tracking)

```bash
# Установить Sentry SDK
pnpm add @sentry/nextjs @sentry/node

# Настроить в apps/frontend/sentry.client.config.ts
# Настроить в apps/backend/src/config/sentry.ts
```

### Prometheus + Grafana (Метрики)

```bash
# Добавить в docker-compose.prod.yml
```

---

## 🔒 Security Checklist

- [ ] SSL сертификаты установлены
- [ ] CORS правильно настроен
- [ ] Rate limiting включен
- [ ] Helmet.js настроен (backend)
- [ ] Environment variables защищены
- [ ] Database backups настроены
- [ ] Firewall настроен (только 80, 443, 22)
- [ ] Fail2ban установлен
- [ ] JWT secrets сгенерированы безопасно
- [ ] PostgreSQL доступен только локально
- [ ] Redis доступен только локально

---

## 🔄 CI/CD с GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/telegram-shop
            git pull
            pnpm install
            pnpm build
            pm2 reload ecosystem.config.js
```

---

## 📦 Backup Strategy

### Database Backup

```bash
# Создать backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/telegram-shop"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

# PostgreSQL backup
docker exec postgres pg_dump -U postgres telegram_shop_prod > \
  $BACKUP_DIR/db_$TIMESTAMP.sql

# Compress
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Добавить в crontab (ежедневно в 2:00)
echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
```

---

## 🧪 Post-Deployment Testing

```bash
# Health check
curl https://api.yourdomain.com/health

# Test API
curl https://api.yourdomain.com/api/products

# Test frontend
curl -I https://yourdomain.com

# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://yourdomain.com
```

---

## 📞 Troubleshooting

### Backend не запускается

```bash
# Проверить логи PM2
pm2 logs telegram-shop-backend

# Проверить подключение к БД
docker logs postgres

# Проверить порты
netstat -tulpn | grep 3001
```

### Frontend не загружается

```bash
# Проверить логи PM2
pm2 logs telegram-shop-frontend

# Проверить Nginx
nginx -t
systemctl status nginx

# Проверить логи Nginx
tail -f /var/log/nginx/error.log
```

### SSL проблемы

```bash
# Проверить сертификаты
certbot certificates

# Обновить вручную
certbot renew --dry-run
```

---

## 🎯 Performance Optimization

1. **Enable Gzip в Nginx**
2. **Configure CDN (Cloudflare)**
3. **Enable Redis caching**
4. **Optimize images (CDN)**
5. **Enable HTTP/2**
6. **Minify assets**
7. **Enable service workers**

---

**Готово к production! 🚀**

Для вопросов и поддержки: см. [README.md](README.md)

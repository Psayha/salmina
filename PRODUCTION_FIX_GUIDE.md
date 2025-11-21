# 🔧 Production Server Fix Guide

**Дата аудита:** 21 ноября 2025
**Статус:** Сервер работает, но требуется донастройка
**Ветка с исправлениями:** `claude/audit-build-review-01STdfiqgSELHqkCsWJd35C3`

## 📊 Результаты Аудита

### ✅ Работает Хорошо
- Node.js 20.19.5, pnpm 8.15.0, PM2 6.0.13 ✓
- PM2 процессы запущены 4 дня без перезапусков ✓
- Nginx активен, SSL сертификаты валидны до 14.02.2026 ✓
- Frontend и Backend доступны (HTTP 200) ✓
- PostgreSQL и Redis работают через Docker ✓

### ❌ Требует Исправления
1. **КРИТИЧНО:** .env файл отсутствует
2. Backend ошибки подключения к PostgreSQL
3. Frontend warning о multiple lockfiles (уже исправлено в коде)
4. Нужно обновить код с нашими исправлениями

---

## 🚀 Инструкции по Исправлению

### Шаг 1: Создать .env файл

**Проблема:** Отсутствует .env файл с переменными окружения.

**Решение:**

```bash
cd /var/www/telegram-shop

# Скопировать template
cp .env.example .env

# Отредактировать
nano .env
```

**Установить следующие значения:**

```env
# ===========================================
# PRODUCTION CONFIGURATION
# ===========================================

# General
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://salminashop.ru

# Database (проверьте в docker-compose.yml)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/telegram_shop

# PostgreSQL (из docker-compose.yml)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=telegram_shop
POSTGRES_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT Authentication (ВАЖНО: используем JWT_SECRET, не JWT_ACCESS_SECRET!)
# Сгенерируйте новые ключи: openssl rand -base64 32
JWT_SECRET=<ЗАМЕНИТЬ-НА-РЕАЛЬНЫЙ-КЛЮЧ>
JWT_REFRESH_SECRET=<ЗАМЕНИТЬ-НА-РЕАЛЬНЫЙ-КЛЮЧ>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Telegram Bot (из текущей конфигурации PM2)
TELEGRAM_BOT_TOKEN=<ВАШИЙ-РЕАЛЬНЫЙ-ТОКЕН>
TELEGRAM_APP_URL=https://t.me/your_bot/app
TELEGRAM_ADMIN_IDS=<ВАШИ-ADMIN-IDS>

# Payment Gateway (Prodamus)
PRODAMUS_API_KEY=<ВАШИЙ-API-KEY>
PRODAMUS_SECRET_KEY=<ВАШИЙ-SECRET-KEY>
PRODAMUS_WEBHOOK_URL=https://app.salminashop.ru/api/webhooks/prodamus
PRODAMUS_SUCCESS_URL=https://salminashop.ru/checkout/success
PRODAMUS_FAIL_URL=https://salminashop.ru/checkout/fail

# File Upload
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif

# Session
SESSION_TOKEN_EXPIRES_DAYS=30
CART_EXPIRES_DAYS=30

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
CORS_ORIGINS=https://salminashop.ru,https://app.salminashop.ru

# Security
BCRYPT_ROUNDS=10

# Production
DOMAIN=salminashop.ru
SSL_ENABLED=true
```

**Сгенерировать JWT ключи:**

```bash
# Запустите дважды для JWT_SECRET и JWT_REFRESH_SECRET
openssl rand -base64 32
```

---

### Шаг 2: Проверить Docker Containers

```bash
# Проверить running containers
docker ps

# Должны быть запущены PostgreSQL и Redis
# Если нет - запустить:
docker-compose up -d
```

**Проверить подключение к БД:**

```bash
# PostgreSQL
docker exec -it <postgres-container-name> psql -U postgres -d telegram_shop

# Redis
docker exec -it <redis-container-name> redis-cli ping
```

---

### Шаг 3: Обновить код с исправлениями

```bash
cd /var/www/telegram-shop

# Получить нашу ветку с исправлениями
git fetch origin
git checkout claude/audit-build-review-01STdfiqgSELHqkCsWJd35C3
git pull

# Установить зависимости
pnpm install
```

**Что исправлено в ветке:**
- ✅ JWT variable names (JWT_ACCESS_SECRET → JWT_SECRET)
- ✅ jest.setup.js обновлен с правильными переменными
- ✅ Удален конфликтующий package-lock.json из frontend
- ✅ Добавлен @types/node в packages/types
- ✅ Prisma version зафиксирована на 5.22.0
- ✅ axios синхронизирован (1.13.2)
- ✅ Добавлен prisma generate в deploy-production.yml
- ✅ Добавлены test:coverage скрипты
- ✅ Убран prisma/migrations из .gitignore

---

### Шаг 4: Сгенерировать Prisma Client

```bash
cd /var/www/telegram-shop/apps/backend

# Попробовать сгенерировать Prisma Client
pnpm prisma generate

# Если 403 Forbidden (проблема CDN Prisma):
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 pnpm prisma generate

# Если все еще не работает - binaries уже закэшированы в node_modules,
# просто продолжайте
```

**Примечание:** Prisma CDN временно блокирует загрузку binaries (403). Но на production VPS binaries уже есть в node_modules и работают.

---

### Шаг 5: Пересобрать приложение

```bash
cd /var/www/telegram-shop/apps/backend
pnpm build

cd /var/www/telegram-shop/apps/frontend
pnpm build
```

---

### Шаг 6: Перезапустить PM2 процессы

```bash
cd /var/www/telegram-shop

# Перезапустить процессы
pm2 restart telegram-shop-backend
pm2 restart telegram-shop-frontend

# Сохранить конфигурацию
pm2 save

# Проверить статус
pm2 status
pm2 logs --lines 50
```

---

### Шаг 7: Проверить работу

```bash
# Проверить health endpoints
curl https://salminashop.ru
curl https://app.salminashop.ru/health

# Проверить логи
pm2 logs telegram-shop-backend --lines 20
pm2 logs telegram-shop-frontend --lines 20

# Проверить PostgreSQL подключение
# Не должно быть ошибок "Error in PostgreSQL connection"
```

---

## 🐛 Troubleshooting

### Problem: PM2 процесс не запускается

```bash
# Просмотреть логи ошибок
pm2 logs telegram-shop-backend --err --lines 50

# Проверить, что .env файл существует
ls -la /var/www/telegram-shop/.env

# Проверить переменные окружения
pm2 env 1  # для backend
```

### Problem: "Missing required environment variable"

Убедитесь, что .env файл содержит все обязательные переменные:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `TELEGRAM_BOT_TOKEN`

### Problem: PostgreSQL connection errors

```bash
# Проверить, что PostgreSQL container запущен
docker ps | grep postgres

# Запустить, если остановлен
docker-compose up -d

# Проверить логи container
docker logs <postgres-container-id>

# Проверить DATABASE_URL в .env
cat /var/www/telegram-shop/.env | grep DATABASE_URL
```

### Problem: Frontend warning о lockfiles

Это уже исправлено в коде. После обновления и rebuild warning исчезнет.

### Problem: "Cannot find module" ошибки

```bash
# Переустановить зависимости
cd /var/www/telegram-shop
rm -rf node_modules
pnpm install

# Пересобрать
pnpm build

# Перезапустить
pm2 restart all
```

---

## 📊 Проверка после исправлений

### Чеклист:

- [ ] .env файл создан с правильными переменными
- [ ] JWT переменные используют JWT_SECRET (не JWT_ACCESS_SECRET)
- [ ] Docker containers (PostgreSQL, Redis) запущены
- [ ] Код обновлен с ветки claude/audit-build-review-01STdfiqgSELHqkCsWJd35C3
- [ ] pnpm install выполнен
- [ ] Backend build успешен
- [ ] Frontend build успешен
- [ ] PM2 процессы перезапущены
- [ ] Нет ошибок в PM2 логах
- [ ] Frontend доступен: https://salminashop.ru (200)
- [ ] Backend доступен: https://app.salminashop.ru/health (200)
- [ ] Нет PostgreSQL connection errors в логах

---

## 🔒 Security Recommendations

### 1. Настроить fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Ограничить доступ к .env и .git

```bash
# В .gitignore уже есть .env
# Убедитесь, что .env не коммитится:
git status

# Права доступа
chmod 600 /var/www/telegram-shop/.env
```

### 3. Rate limiting в Nginx

Добавить в Nginx конфигурацию:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... остальная конфигурация
}
```

### 4. Обновить SSL сертификаты автоматически

```bash
# Проверить auto-renewal
sudo certbot renew --dry-run
```

---

## 📞 После Выполнения

1. Запустите аудит повторно:
   ```bash
   bash /var/www/telegram-shop/scripts/audit-production-server.sh > audit-after-fix.txt 2>&1
   ```

2. Сравните результаты:
   - .env файл должен существовать ✓
   - Нет ошибок в PM2 логах ✓
   - Frontend и Backend доступны ✓

3. Сообщите о результатах для финального деплоя.

---

## 🎯 Следующие Шаги

После исправления всех проблем:

1. Протестировать все функции:
   - Регистрация/логин
   - Добавление товаров в корзину
   - Оформление заказа
   - Telegram bot интеграция

2. Настроить мониторинг:
   - PM2 monitoring: `pm2 monitor`
   - Логи: настроить ротацию логов
   - Alerts: настроить уведомления об ошибках

3. Деплой на main:
   - Создать PR из ветки claude/audit-build-review-01STdfiqgSELHqkCsWJd35C3
   - Мержить в main
   - Настроить GitHub Actions с secrets
   - Автоматический деплой заработает

---

**Удачи! Если возникнут проблемы - пришлите логи.**

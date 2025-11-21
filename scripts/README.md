# Production Server Audit

Этот скрипт проводит comprehensive аудит production сервера перед деплоем.

## 📋 Что проверяет скрипт

1. **Системная информация** - OS, диск, память, CPU
2. **Установленное ПО** - Node.js, pnpm, PM2, PostgreSQL, Redis, Nginx
3. **Структура проекта** - каталоги, git, builds
4. **Переменные окружения** - .env файл и критичные переменные
5. **PM2 процессы** - статус, логи, memory usage
6. **Сервисы** - PostgreSQL, Redis, Nginx
7. **Nginx конфигурация** - проверка настроек
8. **База данных** - подключение, migrations
9. **SSL сертификаты** - Let's Encrypt, срок действия
10. **Логи** - последние ошибки Nginx
11. **Сетевые подключения** - открытые порты
12. **Доступность** - проверка frontend и backend

## 🚀 Как запустить

### 1. Скопируйте скрипт на production сервер

```bash
# Локально
scp scripts/audit-production-server.sh user@your-server:/tmp/

# Или через git на сервере
cd /var/www/telegram-shop
git pull origin claude/audit-build-review-01STdfiqgSELHqkCsWJd35C3
```

### 2. Запустите скрипт на сервере

```bash
# Подключитесь к серверу
ssh user@your-server

# Запустите аудит
bash /var/www/telegram-shop/scripts/audit-production-server.sh

# Или сохраните в файл для анализа
bash /var/www/telegram-shop/scripts/audit-production-server.sh > audit-report.txt 2>&1
```

### 3. Проанализируйте результаты

Отправьте результаты аудита разработчику для анализа.

## 🔍 На что обратить внимание

### ✅ Должно быть установлено:
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PM2
- PostgreSQL
- Redis
- Nginx

### ✅ Должны существовать:
- `/var/www/telegram-shop/` - корень проекта
- `/var/www/telegram-shop/.env` - переменные окружения
- `/var/www/telegram-shop/apps/backend/dist/` - backend build
- `/var/www/telegram-shop/apps/frontend/.next/` - frontend build
- `/var/www/telegram-shop/node_modules/` - зависимости
- `/etc/nginx/sites-enabled/telegram-shop` - nginx конфиг

### ✅ PM2 процессы должны быть запущены:
- `telegram-shop-backend` - на порту 3001
- `telegram-shop-frontend` - на порту 3000

### ✅ Сервисы должны быть активны:
- PostgreSQL (порт 5432)
- Redis (порт 6379)
- Nginx (порты 80, 443)

### ✅ Переменные окружения в .env:
- `NODE_ENV=production`
- `PORT=3001`
- `DATABASE_URL` - подключение к PostgreSQL
- `JWT_SECRET` - ключ для JWT токенов
- `JWT_REFRESH_SECRET` - ключ для refresh токенов
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `REDIS_URL` - подключение к Redis

### ✅ Должны быть доступны:
- https://salminashop.ru (HTTP 200)
- https://app.salminashop.ru/health (HTTP 200)

## 🐛 Частые проблемы и решения

### Problem: PM2 процессы не запущены

```bash
cd /var/www/telegram-shop

# Запустить backend
pm2 start apps/backend/dist/index.js --name telegram-shop-backend

# Запустить frontend
pm2 start npm --name telegram-shop-frontend -- run start --prefix apps/frontend

# Сохранить конфигурацию
pm2 save
```

### Problem: .env файл отсутствует

```bash
cd /var/www/telegram-shop
cp .env.example .env
# Отредактировать .env с правильными значениями
nano .env
```

### Problem: node_modules отсутствует

```bash
cd /var/www/telegram-shop
pnpm install --frozen-lockfile
```

### Problem: Builds отсутствуют

```bash
cd /var/www/telegram-shop

# Backend build
cd apps/backend
pnpm prisma generate
pnpm build

# Frontend build
cd ../frontend
pnpm build
```

### Problem: PostgreSQL не активен

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Problem: Redis не активен

```bash
sudo systemctl start redis
sudo systemctl enable redis
```

### Problem: Nginx конфигурация некорректна

```bash
# Проверить синтаксис
sudo nginx -t

# Перезагрузить конфигурацию
sudo systemctl reload nginx
```

### Problem: SSL сертификаты отсутствуют

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx

# Получить сертификаты
sudo certbot --nginx -d salminashop.ru -d www.salminashop.ru -d app.salminashop.ru
```

## 📊 После аудита

1. **Проанализируйте результаты** - отметьте все проблемы
2. **Исправьте критичные проблемы** - используйте решения выше
3. **Запустите аудит повторно** - убедитесь, что все ✓
4. **Задеплойте обновления** - через GitHub Actions или вручную

## 🔄 Ручной деплой (если GitHub Actions не настроен)

```bash
cd /var/www/telegram-shop

# Обновить код
git pull origin main

# Установить зависимости
pnpm install --frozen-lockfile

# Сгенерировать Prisma Client
cd apps/backend
pnpm prisma generate

# Собрать backend
pnpm build

# Собрать frontend
cd ../frontend
pnpm build

# Перезапустить сервисы
cd /var/www/telegram-shop
pm2 restart telegram-shop-backend
pm2 restart telegram-shop-frontend
pm2 save

# Проверить статус
pm2 status
```

## 📞 Поддержка

Если возникли проблемы, отправьте:
1. Полный вывод скрипта аудита
2. Логи PM2: `pm2 logs --lines 50`
3. Логи Nginx: `sudo tail -50 /var/log/nginx/error.log`

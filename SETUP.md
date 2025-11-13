# 🚀 Инструкция по настройке проекта

## Шаг 1: Установка зависимостей

```bash
# Установка pnpm (если не установлен)
npm install -g pnpm

# Установка зависимостей проекта
pnpm install
```

## Шаг 2: Настройка окружения

### Backend (.env в корне проекта)

Создайте файл `.env` в корне проекта:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=telegram_shop
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/telegram_shop?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_BOT_USERNAME=your-bot-username

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001

# Admin
ADMIN_TELEGRAM_IDS=123456789
```

### Frontend (.env.local)

Создайте файл `apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your-bot-username
```

## Шаг 3: Запуск Docker

```bash
# Запуск PostgreSQL и Redis
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## Шаг 4: Настройка базы данных

```bash
# Генерация Prisma Client
pnpm db:generate

# Применение миграций
pnpm db:migrate

# (Опционально) Открыть Prisma Studio для просмотра БД
pnpm db:studio
```

## Шаг 5: Запуск приложения

### Вариант 1: Запуск отдельно

```bash
# Terminal 1 - Frontend
pnpm dev

# Terminal 2 - Backend
pnpm dev:backend
```

### Вариант 2: Запуск одновременно

```bash
pnpm dev:all
```

## Шаг 6: Проверка

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health
- Prisma Studio: http://localhost:5555 (после `pnpm db:studio`)

---

## 🛠️ Полезные команды

```bash
# Линтинг
pnpm lint

# Проверка типов
pnpm type-check

# Сборка
pnpm build

# Остановка Docker
docker-compose down

# Остановка Docker с удалением данных
docker-compose down -v
```

---

## ⚠️ Troubleshooting

### Проблема: Port already in use

```bash
# Измените порты в .env или docker-compose.yml
```

### Проблема: Database connection failed

```bash
# Убедитесь что Docker запущен
docker-compose ps

# Проверьте DATABASE_URL в .env
```

### Проблема: Prisma Client not generated

```bash
# Удалите node_modules и переустановите
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
pnpm db:generate
```

---

## 📚 Дополнительная документация

См. `files/` для полной документации проекта.


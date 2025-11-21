# ⚡ Quick Start - Запуск за 5 минут

Простая инструкция для запуска проекта локально.

---

## 📋 Что нужно установить

1. **Node.js 20+** - https://nodejs.org/
2. **pnpm** - `npm install -g pnpm`
3. **Docker Desktop** - https://www.docker.com/products/docker-desktop/

---

## 🚀 Запуск проекта

### Шаг 1: Клонировать репозиторий (если еще не сделано)

```bash
git clone https://github.com/Psayha/salmina.git
cd salmina
```

### Шаг 2: Установить зависимости

```bash
pnpm install
```

### Шаг 3: Запустить базы данных (PostgreSQL + Redis)

```bash
# Запустить Docker Desktop
# Затем выполнить:
docker-compose up -d

# Проверить что контейнеры запустились:
docker-compose ps
```

Должны быть запущены:
- `postgres` (порт 5432)
- `redis` (порт 6379)

### Шаг 4: Настроить Backend

```bash
cd apps/backend

# Создать .env файл
cp .env.example .env

# Отредактировать .env - ВАЖНО!
# Открыть apps/backend/.env в редакторе и проверить:
```

**Минимальная конфигурация для локального запуска:**

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/telegram_shop"
REDIS_URL="redis://localhost:6379"

# JWT Secrets (сгенерировать: openssl rand -base64 32)
JWT_SECRET="your-secret-here-min-32-chars"
JWT_REFRESH_SECRET="another-secret-here-min-32-chars"

# Telegram Bot (получить от @BotFather)
TELEGRAM_BOT_TOKEN="your-bot-token"

# Server
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

**Сгенерировать JWT secrets:**

```bash
# macOS/Linux:
openssl rand -base64 32

# Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Создать базу данных:**

```bash
# Сгенерировать Prisma Client
pnpm prisma generate

# Применить миграции
pnpm prisma migrate dev

# Загрузить тестовые данные
pnpm prisma db seed
```

**Запустить Backend:**

```bash
pnpm dev
```

✅ Backend запущен на http://localhost:3001

### Шаг 5: Запустить Frontend

**В НОВОМ терминале:**

```bash
cd apps/frontend

# Запустить frontend
pnpm dev
```

✅ Frontend запущен на http://localhost:3000

---

## 🎉 Готово!

Откройте браузер: **http://localhost:3000**

---

## 🔍 Проверка что все работает

### Backend API:

```bash
# Health check
curl http://localhost:3001/health

# Получить категории
curl http://localhost:3001/api/categories

# Получить товары
curl http://localhost:3001/api/products
```

### Frontend:
- Откройте http://localhost:3000
- Должна загрузиться главная страница магазина

### База данных (Prisma Studio):

```bash
cd apps/backend
pnpm prisma studio
```

Откроется http://localhost:5555 - GUI для просмотра базы данных.

---

## 🛠️ Полезные команды

```bash
# Остановить базы данных
docker-compose stop

# Снова запустить базы данных
docker-compose start

# Посмотреть логи
docker-compose logs -f

# Остановить и удалить все (⚠️ удалит данные!)
docker-compose down -v

# Пересоздать базу данных
cd apps/backend
pnpm prisma migrate reset
pnpm prisma db seed
```

---

## ❓ Проблемы?

### Порт уже занят (5432 или 6379)

**Вариант 1:** Остановить локальные PostgreSQL/Redis

```bash
# macOS
brew services stop postgresql
brew services stop redis

# Linux
sudo systemctl stop postgresql
sudo systemctl stop redis
```

**Вариант 2:** Изменить порты в `docker-compose.yml`

### Docker не запускается

1. Убедитесь что Docker Desktop запущен
2. Перезапустите Docker Desktop
3. Проверьте что Docker работает: `docker --version`

### Backend не подключается к БД

1. Проверьте что контейнеры запущены: `docker-compose ps`
2. Проверьте DATABASE_URL в `apps/backend/.env`
3. Перезапустите контейнеры: `docker-compose restart`

### Prisma ошибки

```bash
# Удалить и пересоздать
rm -rf node_modules/.prisma
cd apps/backend
pnpm prisma generate
pnpm prisma migrate reset
```

---

## 📚 Что дальше?

- **Посмотреть API документацию**: [API_INTEGRATION.md](API_INTEGRATION.md)
- **Настроить Telegram Bot**: [DEPLOYMENT.md](DEPLOYMENT.md) → "Telegram Bot Setup"
- **Задеплоить на сервер**: [DEPLOYMENT.md](DEPLOYMENT.md) → "Production Deployment"

---

**Нужна помощь?** Смотрите полную документацию в [README.md](README.md)

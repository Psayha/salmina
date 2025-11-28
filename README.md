# Telegram Shop - Salmina

Интернет-магазин косметики в формате Telegram Mini App.

**Версия:** 1.1.0
**Статус:** Production

## Production URLs

- **Shop:** https://salminashop.ru
- **API:** https://app.salminashop.ru
- **Admin:** https://admin.salminashop.ru

## Технологии

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript 5.6
- Tailwind CSS 4
- Zustand (state management)
- React Query

### Backend
- Node.js 20+
- Express.js 4.19
- TypeScript 5.6
- Prisma ORM 5.22
- PostgreSQL 15
- Redis 7
- JWT authentication

### DevOps
- Docker Compose
- GitHub Actions (CI/CD)
- PM2 (process manager)
- Nginx (reverse proxy + SSL)

## Структура проекта

```
salmina/
├── apps/
│   ├── frontend/          # Next.js приложение
│   └── backend/           # Express API сервер
├── packages/
│   ├── shared/            # Общие утилиты
│   └── types/             # Shared TypeScript типы
├── docs/                  # Документация
├── files/                 # Техническое задание
└── scripts/               # Скрипты
```

## Быстрый старт

### Требования
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### Установка

```bash
# 1. Установка зависимостей
pnpm install

# 2. Настройка окружения
cp .env.example .env
# Отредактируйте .env файл

# 3. Запуск Docker (PostgreSQL + Redis)
docker-compose up -d

# 4. Миграция базы данных
cd apps/backend
pnpm db:migrate
pnpm db:seed
cd ../..

# 5. Запуск
pnpm dev:all
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Скрипты

```bash
# Разработка
pnpm dev              # Frontend
pnpm dev:backend      # Backend
pnpm dev:all          # Оба одновременно

# Сборка
pnpm build            # Все приложения

# Тестирование
pnpm test             # Запуск тестов
pnpm test:coverage    # С отчетом покрытия

# Линтинг
pnpm lint
pnpm type-check

# База данных
pnpm db:generate      # Генерация Prisma Client
pnpm db:migrate       # Миграции
pnpm db:studio        # Prisma Studio GUI
```

## API Модули

Backend содержит 9 модулей с 51 endpoint:

| Модуль | Endpoints | Описание |
|--------|-----------|----------|
| Auth | 5 | JWT + Telegram аутентификация |
| Users | 8 | Управление пользователями |
| Products | 8 | Каталог товаров |
| Categories | 6 | Категории |
| Cart | 5 | Корзина |
| Orders | 6 | Заказы |
| Promocodes | 5 | Промокоды |
| Promotions | 4 | Акции и баннеры |
| Legal | 4 | Юридические документы |

Полная документация API: [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md)

## Безопасность

Реализованные защиты:
- Rate Limiting (защита от DDoS)
- XSS Protection (санитизация входных данных)
- JWT аутентификация с refresh tokens
- CORS whitelist
- Helmet (security headers)
- Zod validation
- RBAC (role-based access control)
- Prisma ORM (защита от SQL injection)

## Тестирование

```bash
pnpm test
```

- 79/79 unit тестов (100% passing)
- 91.95% покрытие для сервисов

## Документация

| Документ | Описание |
|----------|----------|
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Быстрый старт |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment |
| [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) | API endpoints |
| [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md) | Настройка Telegram Bot |
| [docs/PRODAMUS_SETUP.md](docs/PRODAMUS_SETUP.md) | Настройка Prodamus |
| [docs/GITHUB_ACTIONS_SETUP.md](docs/GITHUB_ACTIONS_SETUP.md) | CI/CD |

## Конфигурация

Основные переменные окружения (см. `.env.example`):

```bash
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/telegram_shop

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
ADMIN_TELEGRAM_IDS=123456789,987654321

# Prodamus (опционально)
PRODAMUS_PAYMENT_FORM_URL=
PRODAMUS_SECRET_KEY=
```

## Лицензия

Private project

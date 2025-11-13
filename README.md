# 🛍️ Telegram Shop - Интернет-магазин косметики

**Версия:** 1.1.0  
**Платформа:** Telegram Mini App  
**Статус:** В разработке

---

## 📋 Описание

Профессиональный интернет-магазин косметики в формате Telegram Mini App с полным функционалом: каталог товаров, корзина, заказы, админ-панель, интеграция с платежными системами.

---

## 🏗️ Структура проекта

```
telegram-shop/
├── apps/
│   ├── frontend/          # Next.js 14+ App Router
│   └── backend/           # Node.js + Express API
├── packages/
│   ├── shared/            # Общий код
│   └── types/             # TypeScript типы
├── docs/                  # Документация
├── files/                 # ТЗ и документация проекта
└── docker-compose.yml     # Docker окружение
```

---

## 🚀 Быстрый старт

### Требования

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### Установка

```bash
# Установка зависимостей
pnpm install

# Запуск Docker (PostgreSQL + Redis)
docker-compose up -d

# Генерация Prisma Client
pnpm db:generate

# Применение миграций БД
pnpm db:migrate

# Запуск frontend
pnpm dev

# Запуск backend (в другом терминале)
pnpm dev:backend
```

---

## 📚 Документация

Полная документация находится в папке `files/`:

- `technical-specification-v1.1.md` - Полное техническое задание
- `context7-v1.1.md` - Контекст для AI-ассистентов
- `claude-code-prompt.md` - Промпты для разработки
- `CHANGELOG-v1.1.md` - История изменений
- `README-v1.1.md` - Обзор проекта

---

## 🛠️ Технологический стек

### Frontend
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Zustand (state management)
- React Hook Form + Zod
- @telegram-apps/sdk
- Framer Motion

### Backend
- Node.js 20+
- Express.js
- TypeScript (strict mode)
- Prisma ORM
- PostgreSQL 15+
- Redis
- JWT authentication

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)

---

## 📝 Скрипты

```bash
# Разработка
pnpm dev              # Frontend
pnpm dev:backend      # Backend
pnpm dev:all          # Оба одновременно

# Сборка
pnpm build            # Все приложения
pnpm build:frontend   # Только frontend
pnpm build:backend    # Только backend

# Линтинг и проверка типов
pnpm lint
pnpm type-check

# База данных
pnpm db:generate      # Генерация Prisma Client
pnpm db:migrate       # Применение миграций
pnpm db:studio        # Prisma Studio
```

---

## 🔧 Конфигурация

Скопируйте `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
```

---

## 📊 База данных

Схема базы данных описана в `apps/backend/prisma/schema.prisma`.

Основные таблицы:
- `users` - Пользователи
- `products` - Товары
- `categories` - Категории
- `orders` - Заказы
- `cart_items` - Корзина
- `promotions` - Акции
- `legal_documents` - Юридические документы
- `wishlist_shares` - Публичные wishlist

---

## 🎯 Этапы разработки

- [x] Phase 1: Foundation (инфраструктура)
- [ ] Phase 2: Backend Core
- [ ] Phase 3: Frontend Core
- [ ] Phase 4: Admin Panel
- [ ] Phase 5: Integrations
- [ ] Phase 6: Testing
- [ ] Phase 7: Deployment
- [ ] Phase 8: Polish

---

## 📄 Лицензия

Private project

---

## 👥 Контакты

Проект разрабатывается согласно техническому заданию v1.1.


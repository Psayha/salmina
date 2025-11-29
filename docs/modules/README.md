# 📦 Backend Modules Documentation

Документация по всем модулям backend.

---

## 📁 Расположение модулей

Все модули находятся в: `/apps/backend/src/modules/`

---

## ✅ Реализованные модули (Phase 3 Complete)

### 🔐 Authentication Module

**Путь:** `/apps/backend/src/modules/auth/`

**Документация:**
- [README.md](../../apps/backend/src/modules/auth/README.md) - Полная документация модуля
- [QUICK_START.md](../../apps/backend/src/modules/auth/QUICK_START.md) - Быстрый старт
- [INTEGRATION.md](../../apps/backend/src/modules/auth/INTEGRATION.md) - Интеграция с frontend
- [SUMMARY.md](../../apps/backend/src/modules/auth/SUMMARY.md) - Краткий обзор
- [FILES.md](../../apps/backend/src/modules/auth/FILES.md) - Описание файлов

**Функционал:**
- Аутентификация через Telegram initData
- JWT токены (access + refresh)
- Хранение токенов в Redis
- Обновление токенов
- Logout

**Endpoints (5):**
- `POST /api/auth/telegram`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/verify`

---

### 👤 Users Module

**Путь:** `/apps/backend/src/modules/users/`

**Документация:**
- [README.md](../../apps/backend/src/modules/users/README.md) - Полная документация
- [QUICKSTART.md](../../apps/backend/src/modules/users/QUICKSTART.md) - Быстрый старт
- [INTEGRATION.md](../../apps/backend/src/modules/users/INTEGRATION.md) - Интеграция

**Функционал:**
- Управление профилем пользователя
- Принятие условий использования
- Администрирование пользователей (ADMIN)
- Управление ролями (ADMIN)

**Endpoints (8):**
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/accept-terms`
- `GET /api/users` (admin)
- `GET /api/users/:id` (admin)
- `PATCH /api/users/:id` (admin)
- `PATCH /api/users/:id/role` (admin)
- `DELETE /api/users/:id` (admin)

---

### 📦 Products Module

**Путь:** `/apps/backend/src/modules/products/`

**Документация:**
- [README.md](../../apps/backend/src/modules/products/README.md) - Полная документация
- [INTEGRATION.md](../../apps/backend/src/modules/products/INTEGRATION.md) - Интеграция
- [SUMMARY.md](../../apps/backend/src/modules/products/SUMMARY.md) - Обзор

**Функционал:**
- CRUD операции с товарами
- Поиск по множеству полей
- Фильтрация (категория, цена, наличие, метки)
- Сортировка (цена, популярность, новинки)
- Трехуровневое ценообразование
- Управление остатками
- Связанные товары

**Endpoints (8):**
- `GET /api/products`
- `GET /api/products/search`
- `GET /api/products/:slug`
- `GET /api/products/:id/related`
- `POST /api/products` (admin)
- `PATCH /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `PATCH /api/products/:id/stock` (admin)

---

### 📁 Categories Module

**Путь:** `/apps/backend/src/modules/categories/`

**Функционал:**
- Древовидная структура категорий
- Категории для главной страницы
- Подсчет товаров в категории
- CRUD операции (ADMIN)

**Endpoints (6):**
- `GET /api/categories`
- `GET /api/categories/home`
- `GET /api/categories/:slug`
- `POST /api/categories` (admin)
- `PATCH /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

**Документация:** В коде (types, service, controller, validation)

---

### 🛒 Cart Module

**Путь:** `/apps/backend/src/modules/cart/`

**Функционал:**
- Управление корзиной (session + user support)
- Добавление/удаление товаров
- Обновление количества
- Применение промокодов
- Подсчет стоимости с учетом скидок

**Endpoints (5):**
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`
- `DELETE /api/cart`

**Документация:** В коде (types, service, controller, validation, routes)

---

### 📋 Orders Module

**Путь:** `/apps/backend/src/modules/orders/`

**Функционал:**
- Создание заказов из корзины
- Управление статусами (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- История заказов пользователя
- Администрирование заказов (ADMIN)
- Transaction handling (stock update)
- Tracking информация

**Endpoints (6):**
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id/status` (admin)
- `PATCH /api/orders/:id/tracking` (admin)
- `DELETE /api/orders/:id` (admin)

**Документация:** В коде (types, service, controller, validation, routes)

---

### 🎟️ Promocodes Module

**Путь:** `/apps/backend/src/modules/promocodes/`

**Функционал:**
- CRUD промокодов (ADMIN)
- Валидация и применение промокодов
- Типы скидок (процент, фиксированная сумма)
- Лимиты использования
- Даты действия

**Endpoints (5):**
- `GET /api/promocodes` (admin)
- `POST /api/promocodes` (admin)
- `PATCH /api/promocodes/:id` (admin)
- `DELETE /api/promocodes/:id` (admin)
- `POST /api/promocodes/validate` (public)

**Документация:** В коде (index.ts - inline routes)

---

### 🎉 Promotions Module

**Путь:** `/apps/backend/src/modules/promotions/`

**Функционал:**
- Управление акциями и баннерами
- Типы промо (banner, sale, bundle, seasonal)
- Расписание показа (validFrom/validTo)
- Целевые категории
- Публикация/деактивация

**Endpoints (4):**
- `GET /api/promotions`
- `POST /api/promotions` (admin)
- `PATCH /api/promotions/:id` (admin)
- `DELETE /api/promotions/:id` (admin)

**Документация:** В коде (index.ts - inline routes)

---

### 📄 Legal Module

**Путь:** `/apps/backend/src/modules/legal/`

**Функционал:**
- Юридические документы (Terms, Privacy, Refund, Shipping)
- Версионирование документов
- Публикация и активация
- История изменений

**Endpoints (4):**
- `GET /api/legal` (public)
- `GET /api/legal/:type` (public)
- `POST /api/legal` (admin)
- `PATCH /api/legal/:id` (admin)

**Документация:** В коде (index.ts - inline routes)

---

### 📤 Upload Module

**Путь:** `/apps/backend/src/modules/upload/`

**Функционал:**
- Загрузка изображений товаров
- Валидация типов файлов
- Изменение размеров изображений
- Удаление файлов

**Endpoints (3):**
- `POST /api/upload/images` (admin)
- `DELETE /api/upload/images/:filename` (admin)
- `GET /api/upload/images/:filename`

**Документация:** В коде

---

### 📊 Stats Module

**Путь:** `/apps/backend/src/modules/stats/`

**Функционал:**
- Общая статистика магазина
- Количество заказов, пользователей, товаров
- Суммы продаж

**Endpoints (1):**
- `GET /api/stats` (admin)

**Документация:** В коде

---

### 🔒 Security Module

**Путь:** `/apps/backend/src/modules/security/`

**Функционал:**
- Проверка безопасности системы
- Мониторинг подозрительной активности
- Управление блокировками

**Endpoints (2):**
- `GET /api/security/status` (admin)
- `POST /api/security/check` (admin)

**Документация:** В коде

---

### 💾 Backup Module

**Путь:** `/apps/backend/src/modules/backup/`

**Функционал:**
- Создание резервных копий базы данных
- Список доступных бэкапов
- Восстановление из бэкапа

**Endpoints (3):**
- `GET /api/backup` (admin) - список бэкапов
- `POST /api/backup` (admin) - создать бэкап
- `POST /api/backup/restore/:id` (admin) - восстановить

**Документация:** В коде

---

## 📊 Сводная таблица модулей

| Модуль | Статус | Endpoints | Документация |
|--------|--------|-----------|--------------|
| Auth | ✅ Complete | 5 | Полная (5 файлов) |
| Users | ✅ Complete | 8 | Полная (3 файла) |
| Products | ✅ Complete | 8 | Полная (3 файла) |
| Categories | ✅ Complete | 6 | В коде |
| Cart | ✅ Complete | 5 | В коде |
| Orders | ✅ Complete | 6 | В коде |
| Promocodes | ✅ Complete | 5 | В коде |
| Promotions | ✅ Complete | 4 | В коде |
| Legal | ✅ Complete | 4 | В коде |
| Upload | ✅ Complete | 3 | В коде |
| Stats | ✅ Complete | 1 | В коде |
| Security | ✅ Complete | 2 | В коде |
| Backup | ✅ Complete | 3 | В коде |

**Итого:** 13 модулей, 60+ endpoints ✅

---

## 🏗️ Архитектура модулей

Все модули следуют Clean Architecture:

```
module/
├── module.types.ts      # Interfaces, DTOs, Enums
├── module.validation.ts # Zod schemas
├── module.service.ts    # Business logic
├── module.controller.ts # HTTP handlers
├── module.routes.ts     # Express routes
└── index.ts            # Module exports (or inline routes)
```

**Принципы:**
- Separation of Concerns
- Dependency Injection готовность
- Type Safety (strict TypeScript)
- Validation с Zod
- Error handling с AppError
- Clean Code

---

## 🔗 Связанная документация

- [API_INTEGRATION.md](../../API_INTEGRATION.md) - Все API endpoints с примерами
- [PHASE_3_COMPLETE.md](../../PHASE_3_COMPLETE.md) - Отчет по Phase 3 (Backend)
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Setup и deployment guide

---

**Статус:** Production ✅
**Версия:** 1.1.0
**Последнее обновление:** 2025-11-29

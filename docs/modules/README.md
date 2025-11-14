# 📦 Backend Modules Documentation

Документация по модулям backend находится непосредственно в исходном коде для удобства разработки.

---

## 📁 Расположение модулей

Все модули находятся в: `/apps/backend/src/modules/`

---

## 🔐 Authentication Module

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

**Endpoints:**
- `POST /api/auth/telegram`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/verify`

---

## 👤 Users Module

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

**Endpoints:**
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/accept-terms`
- `GET /api/users` (admin)
- `GET /api/users/:id` (admin)
- `PATCH /api/users/:id/role` (admin)
- `DELETE /api/users/:id` (admin)

---

## 📦 Products Module

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

**Endpoints:**
- `GET /api/products`
- `GET /api/products/search`
- `GET /api/products/:slug`
- `GET /api/products/:id/related`
- `POST /api/products` (admin)
- `PATCH /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `PATCH /api/products/:id/stock` (admin)

---

## 📁 Categories Module

**Путь:** `/apps/backend/src/modules/categories/`

**Документация:**
- Файлы с документацией: `categories.types.ts`, `categories.service.ts`

**Функционал:**
- Древовидная структура категорий
- Категории для главной страницы
- Подсчет товаров в категории
- CRUD операции (ADMIN)

**Endpoints:**
- `GET /api/categories`
- `GET /api/categories/home`
- `GET /api/categories/:slug`
- `POST /api/categories` (admin)
- `PATCH /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

---

## 🛒 Cart Module

**Статус:** В разработке

**Путь:** `/apps/backend/src/modules/cart/`

**Планируемый функционал:**
- Управление корзиной
- Добавление/удаление товаров
- Применение промокодов
- Подсчет стоимости

---

## 📋 Orders Module

**Статус:** В разработке

**Путь:** `/apps/backend/src/modules/orders/`

**Планируемый функционал:**
- Создание заказов
- Управление статусами
- История заказов
- Tracking информация

---

## 🎟️ Promocodes Module

**Статус:** В разработке

**Путь:** `/apps/backend/src/modules/promocodes/`

**Планируемый функционал:**
- CRUD промокодов
- Валидация и применение
- Статистика использования

---

## 🎉 Promotions Module

**Статус:** В разработке

**Путь:** `/apps/backend/src/modules/promotions/`

**Планируемый функционал:**
- Управление акциями
- Баннеры
- Расписание показа

---

## 📄 Legal Module

**Статус:** В разработке

**Путь:** `/apps/backend/src/modules/legal/`

**Планируемый функционал:**
- Юридические документы
- Версионирование
- Отслеживание принятия

---

## 📊 Сводная таблица модулей

| Модуль | Статус | Endpoints | Документация |
|--------|--------|-----------|--------------|
| Auth | ✅ Complete | 5 | Полная |
| Users | ✅ Complete | 8 | Полная |
| Products | ✅ Complete | 8 | Полная |
| Categories | ✅ Complete | 6 | В коде |
| Cart | ⏳ Planned | - | - |
| Orders | ⏳ Planned | - | - |
| Promocodes | ⏳ Planned | - | - |
| Promotions | ⏳ Planned | - | - |
| Legal | ⏳ Planned | - | - |

---

## 🔗 Связанная документация

- [Phase 2 Report](../project/PHASE_2_REPORT.md) - Отчет по Phase 2
- [API Documentation](http://localhost:3001/api) - Живая документация API
- [Quick Start](../../QUICK_START.md) - Быстрый старт проекта

---

**Примечание:** Документация модулей намеренно хранится в папках модулей для удобства разработчиков. Это позволяет видеть документацию рядом с кодом.

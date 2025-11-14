# 📚 Документация Telegram Shop

Центральный индекс всей документации проекта.

---

## 🗂️ Структура документации

```
docs/
├── project/          # Отчеты о разработке
├── development/      # Настройка и разработка
├── deployment/       # Деплой и инфраструктура
└── modules/          # Документация модулей backend
```

---

## 🚀 Быстрый старт

**Главный файл:** [../QUICK_START.md](../QUICK_START.md)

Запуск проекта за 5 минут:
1. Установка зависимостей
2. Настройка .env
3. Запуск Docker
4. Миграции БД
5. Запуск backend/frontend

---

## 📋 Основная документация

### Корневая папка проекта (`/`)

| Файл | Описание |
|------|----------|
| [README.md](../README.md) | **Главный файл проекта** - обзор, установка, ссылки |
| [QUICK_START.md](../QUICK_START.md) | Быстрый старт за 5 минут |

### Техническое задание (`/files/`)

| Файл | Описание |
|------|----------|
| [technical-specification-v1.1.md](../files/technical-specification-v1.1.md) | **Полное техническое задание** |
| [context7-v1.1.md](../files/context7-v1.1.md) | Контекст для AI-ассистентов |
| [claude-code-prompt.md](../files/claude-code-prompt.md) | Промпты для разработки |
| [README-v1.1.md](../files/README-v1.1.md) | Обзор проекта v1.1 |
| [README-USAGE.md](../files/README-USAGE.md) | Инструкции по использованию |
| [CHANGELOG-v1.1.md](../files/CHANGELOG-v1.1.md) | История изменений |

---

## 📊 Отчеты о разработке (`/docs/project/`)

| Файл | Описание | Статус |
|------|----------|--------|
| [PROGRESS_REPORT.md](project/PROGRESS_REPORT.md) | Отчет Phase 1 (Foundation) | ✅ Complete |
| [PHASE_2_REPORT.md](project/PHASE_2_REPORT.md) | **Отчет Phase 2 (Backend Core)** | ✅ Complete |

### Phase 2 Report - Ключевые достижения:
- 4 модуля backend (Auth, Users, Products, Categories)
- 33+ API endpoints
- 10,000+ строк кода
- Clean Architecture
- Полная документация

---

## 🛠️ Разработка (`/docs/development/`)

| Файл | Описание |
|------|----------|
| [SETUP.md](development/SETUP.md) | Первоначальная настройка проекта |
| [MIGRATION.md](development/MIGRATION.md) | Инструкции по миграциям |

---

## 🚢 Деплой (`/docs/deployment/`)

| Файл | Описание |
|------|----------|
| [DOCKER_SETUP.md](deployment/DOCKER_SETUP.md) | **Полная инструкция по Docker** |

Включает:
- Установка Docker Desktop
- Управление контейнерами
- PostgreSQL и Redis
- Troubleshooting
- Production considerations

---

## 📦 Backend Модули (`/docs/modules/`)

**Главный файл:** [modules/README.md](modules/README.md)

### ✅ Реализованные модули

#### 🔐 Authentication Module
**Путь:** `/apps/backend/src/modules/auth/`

Документация:
- [README.md](../apps/backend/src/modules/auth/README.md) - Полная документация
- [QUICK_START.md](../apps/backend/src/modules/auth/QUICK_START.md) - Быстрый старт
- [INTEGRATION.md](../apps/backend/src/modules/auth/INTEGRATION.md) - Интеграция с frontend
- [SUMMARY.md](../apps/backend/src/modules/auth/SUMMARY.md) - Краткий обзор
- [FILES.md](../apps/backend/src/modules/auth/FILES.md) - Описание файлов

**Endpoints:** 5 (Telegram auth, refresh, logout, me, verify)

---

#### 👤 Users Module
**Путь:** `/apps/backend/src/modules/users/`

Документация:
- [README.md](../apps/backend/src/modules/users/README.md) - Полная документация
- [QUICKSTART.md](../apps/backend/src/modules/users/QUICKSTART.md) - Быстрый старт
- [INTEGRATION.md](../apps/backend/src/modules/users/INTEGRATION.md) - Интеграция

**Endpoints:** 8 (Profile, terms, admin CRUD)

---

#### 📦 Products Module
**Путь:** `/apps/backend/src/modules/products/`

Документация:
- [README.md](../apps/backend/src/modules/products/README.md) - Полная документация
- [INTEGRATION.md](../apps/backend/src/modules/products/INTEGRATION.md) - Интеграция
- [SUMMARY.md](../apps/backend/src/modules/products/SUMMARY.md) - Обзор

**Endpoints:** 8 (CRUD, search, filters, related)

---

#### 📁 Categories Module
**Путь:** `/apps/backend/src/modules/categories/`

**Endpoints:** 6 (Tree, home, CRUD)

Документация в коде (types, service, controller)

---

### ⏳ В разработке

- **Cart Module** - Корзина покупок
- **Orders Module** - Управление заказами
- **Promocodes Module** - Промокоды и скидки
- **Promotions Module** - Акции и баннеры
- **Legal Module** - Юридические документы

---

## 🎯 Дорожная карта документации

### ✅ Готово:
- [x] Главный README.md
- [x] Quick Start Guide
- [x] Phase 1 & 2 Reports
- [x] Docker Setup Guide
- [x] Auth Module (5 docs)
- [x] Users Module (3 docs)
- [x] Products Module (3 docs)
- [x] Module Index
- [x] Documentation Index (этот файл)

### 📝 В процессе:
- [ ] Categories Module docs
- [ ] API Reference (Swagger/OpenAPI)
- [ ] Architecture Decision Records (ADR)

### 🎯 Планируется:
- [ ] Frontend documentation
- [ ] Testing guide
- [ ] Deployment guide
- [ ] Contributing guide
- [ ] Security guide
- [ ] Performance guide

---

## 🔍 Поиск документации

### По типу:
- **Getting Started:** [QUICK_START.md](../QUICK_START.md)
- **Technical Spec:** [technical-specification-v1.1.md](../files/technical-specification-v1.1.md)
- **Backend API:** [modules/README.md](modules/README.md)
- **Infrastructure:** [deployment/DOCKER_SETUP.md](deployment/DOCKER_SETUP.md)
- **Progress:** [project/PHASE_2_REPORT.md](project/PHASE_2_REPORT.md)

### По модулю:
- **Auth:** [apps/backend/src/modules/auth/README.md](../apps/backend/src/modules/auth/README.md)
- **Users:** [apps/backend/src/modules/users/README.md](../apps/backend/src/modules/users/README.md)
- **Products:** [apps/backend/src/modules/products/README.md](../apps/backend/src/modules/products/README.md)
- **Categories:** [apps/backend/src/modules/categories/](../apps/backend/src/modules/categories/)

### По задаче:
- **Запустить проект:** [QUICK_START.md](../QUICK_START.md)
- **Настроить Docker:** [deployment/DOCKER_SETUP.md](deployment/DOCKER_SETUP.md)
- **Аутентификация:** [apps/backend/src/modules/auth/INTEGRATION.md](../apps/backend/src/modules/auth/INTEGRATION.md)
- **Работа с API:** См. README модулей
- **Миграции БД:** [development/MIGRATION.md](development/MIGRATION.md)

---

## 📊 Статистика документации

| Категория | Файлов | Строк |
|-----------|--------|-------|
| Проектная документация | 8 | ~15,000 |
| Отчеты разработки | 2 | ~8,000 |
| Модули backend | 15+ | ~10,000 |
| Инфраструктура | 3 | ~2,000 |
| **Всего** | **28+** | **~35,000** |

---

## 💡 Советы по навигации

1. **Начните с:** [README.md](../README.md) - главный обзор
2. **Запустить проект:** [QUICK_START.md](../QUICK_START.md)
3. **Изучить API:** [modules/README.md](modules/README.md)
4. **Узнать прогресс:** [project/PHASE_2_REPORT.md](project/PHASE_2_REPORT.md)
5. **Настроить Docker:** [deployment/DOCKER_SETUP.md](deployment/DOCKER_SETUP.md)

---

## 🔗 Полезные ссылки

- [GitHub Repository](https://github.com/your-repo)
- [Live API](http://localhost:3001/api) (когда запущен)
- [Prisma Studio](http://localhost:5555) (pnpm db:studio)
- [Technical Specification](../files/technical-specification-v1.1.md)

---

**Последнее обновление:** 2024-11-13
**Версия проекта:** 1.1.0
**Статус:** Phase 2 Complete ✅

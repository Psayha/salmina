# Документация

## Руководства

| Документ | Описание |
|----------|----------|
| [QUICKSTART.md](QUICKSTART.md) | Быстрый старт для локальной разработки |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment на VPS |
| [API_INTEGRATION.md](API_INTEGRATION.md) | API endpoints и примеры использования |

## Интеграции

| Документ | Описание |
|----------|----------|
| [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) | Настройка Telegram Bot |
| [PRODAMUS_SETUP.md](PRODAMUS_SETUP.md) | Настройка платежной системы Prodamus |
| [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) | CI/CD с GitHub Actions |

## Дополнительно

| Документ | Описание |
|----------|----------|
| [PRODUCTION_FIX_GUIDE.md](PRODUCTION_FIX_GUIDE.md) | Решение проблем на production |
| [development/SETUP.md](development/SETUP.md) | Детальная настройка окружения |
| [development/MIGRATION.md](development/MIGRATION.md) | Работа с миграциями БД |
| [deployment/DOCKER_SETUP.md](deployment/DOCKER_SETUP.md) | Docker конфигурация |

## Backend модули

Документация модулей находится в `apps/backend/src/modules/*/README.md`:

### Core модули (с документацией)
- [Auth](../apps/backend/src/modules/auth/README.md) - JWT + Telegram аутентификация
- [Users](../apps/backend/src/modules/users/README.md) - Управление пользователями
- [Products](../apps/backend/src/modules/products/README.md) - Каталог товаров

### Дополнительные модули
- **Categories** - Древовидная структура категорий
- **Cart** - Корзина (session + user support)
- **Orders** - Заказы и их статусы
- **Promocodes** - Промокоды и скидки
- **Promotions** - Акции и баннеры
- **Legal** - Юридические документы
- **Upload** - Загрузка файлов (изображения)
- **Stats** - Статистика (админ)
- **Security** - Безопасность
- **Backup** - Резервное копирование (админ)

**Итого:** 13 модулей, 70+ endpoints

Подробная документация: [modules/README.md](modules/README.md)

# Документация Salmina Shop

Навигация по документации проекта.

## Быстрый старт

| Документ | Описание |
|----------|----------|
| [QUICKSTART.md](QUICKSTART.md) | Запуск проекта за 5 минут |
| [development/SETUP.md](development/SETUP.md) | Детальная настройка dev-окружения |
| [development/MIGRATION.md](development/MIGRATION.md) | Работа с миграциями БД |

## Deployment

| Документ | Описание |
|----------|----------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment на VPS |
| [deployment/DOCKER_SETUP.md](deployment/DOCKER_SETUP.md) | Docker конфигурация |
| [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) | CI/CD с GitHub Actions |
| [PRODUCTION_FIX_GUIDE.md](PRODUCTION_FIX_GUIDE.md) | Troubleshooting production |

## API и интеграции

| Документ | Описание |
|----------|----------|
| [API_INTEGRATION.md](API_INTEGRATION.md) | API endpoints и примеры |
| [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) | Telegram Bot и Mini App |
| [PRODAMUS_SETUP.md](PRODAMUS_SETUP.md) | Платежная система Prodamus |

## Backend модули

Подробная документация: [modules/README.md](modules/README.md)

| Модуль | Endpoints | Описание |
|--------|-----------|----------|
| Auth | 5 | JWT + Telegram аутентификация |
| Users | 8 | Управление пользователями |
| Products | 8 | Каталог товаров |
| Categories | 6 | Древовидные категории |
| Cart | 5 | Корзина с промокодами |
| Orders | 6 | Заказы и оплата |
| Promocodes | 5 | Промокоды и скидки |
| Promotions | 4 | Акции и баннеры |
| Legal | 4 | Юридические документы |
| Upload | 3 | Загрузка файлов |
| Stats | 1 | Статистика (admin) |
| Security | 2 | Безопасность |
| Backup | 3 | Резервное копирование |

**Всего:** 13 модулей, 60+ endpoints

## Безопасность

Полный отчет о безопасности: [AUDIT_REPORT.md](../AUDIT_REPORT.md)

### Реализованные защиты
- Rate Limiting на всех endpoints
- XSS Protection (DOMPurify + sanitizeBody middleware)
- Timing-safe HMAC-SHA256 верификация
- Magic bytes валидация файлов
- Prisma transactions для race conditions
- Per-user promocode limits
- Price revalidation при создании заказа

## Ссылки

- **Production:** https://salminashop.ru
- **API:** https://app.salminashop.ru
- **Главный README:** [README.md](../README.md)

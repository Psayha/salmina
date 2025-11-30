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

### Все модули (13 шт)

| Модуль | Описание | Endpoints |
|--------|----------|-----------|
| **Auth** | JWT + Telegram аутентификация | 5 |
| **Users** | Управление пользователями | 8 |
| **Products** | Каталог товаров | 8 |
| **Categories** | Древовидная структура категорий | 6 |
| **Cart** | Корзина (session + user support, flat DTO) | 5 |
| **Orders** | Заказы и их статусы | 6 |
| **Promocodes** | Промокоды и скидки | 5 |
| **Promotions** | Акции и баннеры | 4 |
| **Legal** | Юридические документы | 4 |
| **Upload** | Загрузка файлов (изображения) | 3 |
| **Stats** | Статистика (админ) | 1 |
| **Security** | Безопасность | 2 |
| **Backup** | Резервное копирование (админ) | 3 |

**Итого:** 13 модулей, 70+ endpoints

## Frontend компоненты

### UI Kit (10 компонентов)
- **Button** - Кнопка с вариантами
- **CategoryPill** - Кнопка категории
- **ErrorMessage** - Обработка ошибок
- **icons** - SVG иконки
- **ImagePlaceholder** - Плейсхолдер изображения
- **Loading** - Компоненты загрузки
- **Modal** - Модальные окна
- **Skeleton** - Skeleton loading
- **Toast** - Уведомления

### Основные компоненты (27 компонентов)
- **Header** - Шапка с корзиной и поиском
- **BottomNav** - Нижняя навигация с badge
- **ProductCard** - Карточка товара с анимациями
- **ProductCardSkeleton** - Skeleton для карточки товара
- **Stories** - Instagram-style stories
- **StorySkeleton** - Skeleton для stories
- **PageTransition** - Анимации переходов страниц
- **MenuModal** - Модальное меню
- **SearchModal** - Модальный поиск
- **ErrorBoundary** - Error boundary
- **Providers** - React Query + App Init
- **AuthProvider** - Провайдер авторизации
- **ThemeProvider** - Темная/светлая тема
- **LoadingScreen** - Экран загрузки

### Админ компоненты (7 компонентов)
- **AdminHeader** - Шапка админки
- **AdminSidebar** - Боковое меню
- **AdminBottomNav** - Нижняя навигация админки
- **AdminCardGrid** - Сетка карточек
- **DataTable** - Таблица данных
- **ImageUpload** - Загрузка изображений
- **ProductSelector** - Выбор товаров

## Frontend страницы (32 шт)

### Пользовательские (20 страниц)
- `/` - Главная (stories + категории + товары)
- `/search` - Поиск с фильтрами и skeleton
- `/category/[slug]` - Страница категории
- `/product/[slug]` - Товар с collapsible sections и compact bottom bar
- `/cart` - Корзина с iOS-style bottom bar
- `/checkout` - Оформление заказа
- `/checkout/success` - Успешный заказ
- `/favorites` - Избранное со skeleton loading
- `/orders` - История заказов
- `/profile` - Профиль пользователя
- `/settings` - Настройки
- `/support` - Поддержка

### Админ-панель (12 страниц)
- `/admin` - Дашборд
- `/admin/products` - Товары
- `/admin/products/new` - Новый товар
- `/admin/products/[slug]` - Редактирование товара
- `/admin/categories` - Категории
- `/admin/categories/new` - Новая категория
- `/admin/categories/[id]` - Редактирование категории
- `/admin/orders` - Заказы
- `/admin/orders/[id]` - Детали заказа
- `/admin/users` - Пользователи
- `/admin/promocodes` - Промокоды
- `/admin/promotions` - Акции
- `/admin/legal` - Юридические документы
- `/admin/uploads` - Файлы
- `/admin/analytics` - Аналитика
- `/admin/health` - Мониторинг

## Zustand Stores (3 шт)

### useAuthStore
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithTelegram: (initData: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}
```

### useCartStore
```typescript
interface CartState {
  cart: Cart | null;
  itemsCount: number;  // Реактивное state property
  total: number;       // Реактивное state property
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}
```

### useFavoritesStore
```typescript
interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}
```

## API Types

### CartItem (Flat DTO)
```typescript
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  productArticle: string | null;
  basePrice: number;
  appliedPrice: number;
  hasPromotion: boolean;
  allowPromocode: boolean;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  availableQuantity: number;
}
```

Подробная документация: [modules/README.md](modules/README.md)

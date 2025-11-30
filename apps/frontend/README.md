# Telegram Shop - Frontend

Современный интернет-магазин косметики в формате Telegram Mini App с минималистичным glassmorphism дизайном.

## Технологии

- **Next.js 16** - App Router, Server/Client Components
- **React 19** - Concurrent features
- **TypeScript 5.6** - Строгая типизация
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zustand** - State management с persist middleware
- **React Query** - Server state management
- **Axios** - HTTP client с interceptors
- **Telegram Mini Apps SDK** - WebApp интеграция
- **Framer Motion** - Анимации и переходы
- **React Hook Form + Zod** - Формы и валидация

## Структура проекта

```
apps/frontend/
├── app/                          # Next.js App Router (32 страницы)
│   ├── admin/                    # Админ-панель (12 страниц)
│   │   ├── analytics/            # Аналитика
│   │   ├── categories/           # Управление категориями
│   │   ├── health/               # Состояние системы
│   │   ├── legal/                # Юридические документы
│   │   ├── orders/               # Управление заказами
│   │   ├── products/             # Управление товарами
│   │   ├── promocodes/           # Промокоды
│   │   ├── promotions/           # Акции и баннеры
│   │   ├── uploads/              # Загруженные файлы
│   │   ├── users/                # Пользователи
│   │   └── page.tsx              # Дашборд
│   ├── cart/                     # Корзина с iOS-style bottom bar
│   ├── category/[slug]/          # Страница категории
│   ├── checkout/                 # Оформление заказа
│   │   └── success/              # Успешное оформление
│   ├── favorites/                # Избранное со skeleton loading
│   ├── orders/                   # История заказов
│   ├── product/[slug]/           # Страница товара с collapsible sections
│   ├── profile/                  # Профиль пользователя
│   ├── search/                   # Поиск с фильтрами и skeleton
│   ├── settings/                 # Настройки
│   ├── support/                  # Поддержка
│   ├── layout.tsx                # Root layout с Providers
│   ├── page.tsx                  # Главная страница
│   ├── globals.css               # Глобальные стили + pinch-zoom disable
│   └── global-error.tsx          # Глобальная обработка ошибок
├── components/                   # React компоненты (37 шт)
│   ├── ui/                       # UI Kit компоненты (10 шт)
│   │   ├── Button.tsx            # Кнопка с вариантами
│   │   ├── CategoryPill.tsx      # Кнопка категории
│   │   ├── ErrorMessage.tsx      # Обработка ошибок
│   │   ├── icons.tsx             # SVG иконки
│   │   ├── ImagePlaceholder.tsx  # Плейсхолдер изображения
│   │   ├── Loading.tsx           # Компоненты загрузки
│   │   ├── Modal.tsx             # Модальные окна
│   │   ├── Skeleton.tsx          # Skeleton loading
│   │   ├── Toast.tsx             # Уведомления
│   │   └── index.ts              # Exports
│   ├── admin/                    # Админ компоненты (7 шт)
│   │   ├── AdminBottomNav.tsx    # Нижняя навигация админки
│   │   ├── AdminCardGrid.tsx     # Сетка карточек
│   │   ├── AdminHeader.tsx       # Шапка админки
│   │   ├── AdminSidebar.tsx      # Боковое меню
│   │   ├── DataTable.tsx         # Таблица данных
│   │   ├── ImageUpload.tsx       # Загрузка изображений
│   │   └── ProductSelector.tsx   # Выбор товаров
│   ├── AuthProvider.tsx          # Провайдер авторизации
│   ├── BottomNav.tsx             # Нижняя навигация с badge
│   ├── ClientLayout.tsx          # Client-side layout
│   ├── DebugPanel.tsx            # Панель отладки (dev)
│   ├── ErrorBoundary.tsx         # Error boundary
│   ├── Eruda.tsx                 # Mobile debug tools
│   ├── Header.tsx                # Шапка с корзиной и поиском
│   ├── LoadingScreen.tsx         # Экран загрузки
│   ├── MenuModal.tsx             # Модальное меню
│   ├── PageTransition.tsx        # Анимации переходов страниц
│   ├── ProductCard.tsx           # Карточка товара с анимациями
│   ├── ProductCardSkeleton.tsx   # Skeleton для карточки товара
│   ├── ProductSection.tsx        # Секция товаров
│   ├── Providers.tsx             # React Query + App Init
│   ├── SearchModal.tsx           # Модальный поиск
│   ├── Stories.tsx               # Instagram-style stories
│   ├── StorySkeleton.tsx         # Skeleton для stories
│   ├── ThemeProvider.tsx         # Темная/светлая тема
│   └── Toast.tsx                 # Toast notifications
├── contexts/                     # React Contexts
│   └── TelegramContext.tsx       # Telegram WebApp context
├── lib/                          # Утилиты и библиотеки
│   ├── api/                      # API клиент
│   │   ├── endpoints/            # API endpoints
│   │   │   ├── auth.ts           # Авторизация
│   │   │   ├── cart.ts           # Корзина
│   │   │   ├── categories.ts     # Категории
│   │   │   ├── orders.ts         # Заказы
│   │   │   ├── products.ts       # Товары
│   │   │   ├── promocodes.ts     # Промокоды
│   │   │   └── promotions.ts     # Акции
│   │   ├── client.ts             # Axios instance с interceptors
│   │   ├── types.ts              # TypeScript типы (flat DTO)
│   │   └── index.ts              # Exports
│   └── utils.ts                  # Общие утилиты
├── store/                        # Zustand stores
│   ├── useAuthStore.ts           # Авторизация
│   ├── useCartStore.ts           # Корзина (reactive itemsCount)
│   └── useFavoritesStore.ts      # Избранное (persist)
└── package.json
```

## Дизайн система

### Glassmorphism стиль

Все компоненты используют единый минималистичный стиль:

```tsx
// Карточка
bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg

// Кнопка
bg-white/40 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/50

// iOS-style bottom bar
fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-white/30

// Текст
font-light text-gray-900  // Заголовки
font-light text-gray-600  // Описания
```

### Градиентный фон

```css
background: linear-gradient(135deg,
  #FFB6C1 0%, #FFD4B3 20%, #FFC0CB 40%,
  #FFA07A 60%, #FFB6C1 80%, #FFD4B3 100%);
```

### Анимации

- **Page transitions**: fade/slide с Framer Motion
- **Hover эффекты**: `hover:bg-white/50 hover:shadow-xl`
- **Collapsible sections**: плавное раскрытие/сворачивание
- **Haptic feedback**: вибрация при нажатиях

## Установка

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev

# Сборка
pnpm build

# Проверка типов
pnpm type-check

# Линтинг
pnpm lint
```

## Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Страницы и навигация

### Главная страница (/)
- Stories с акциями (Instagram-style)
- Категории товаров (горизонтальный скролл)
- Сетка товаров 2x2
- Header: Menu, Search, Cart с badge
- Bottom Nav: Каталог, Избранное, Корзина, Профиль

### Поиск (/search)
- Поисковая строка с debounce
- Фильтр по категориям
- Сортировка: Популярные, Новинки, Дешевле, Дороже
- Skeleton loading при загрузке
- Результаты в grid 2x2

### Категория (/category/[slug])
- Описание категории
- Сортировка товаров
- Счетчик товаров
- Grid 2x2

### Товар (/product/[slug])
- Галерея изображений
- Название, цена, описание
- **Компактный bottom bar** в одну строку:
  - Наличие (В наличии/Нет в наличии)
  - Управление количеством (-/+)
  - Цена
  - Кнопка "В корзину"
- **Сворачиваемые секции** (CollapsibleSection):
  - Описание
  - Применение
  - Состав
  - Характеристики
- Похожие товары (4 карточки)
- Кнопка "Избранное" (сердечко)
- **Отключен pinch-zoom** для предотвращения случайного масштабирования

### Корзина (/cart)
- Список товаров с изображениями
- Управление количеством
- Удаление товаров
- Применение промокода
- Расчет суммы с скидками
- **iOS-style bottom bar** с итогом и кнопкой "Оформить заказ"

### Оформление (/checkout)
- Форма контактных данных
- Выбор способа доставки
- Выбор способа оплаты
- Валидация полей
- Итоговая сумма

### Избранное (/favorites)
- Список избранных товаров
- **Skeleton loading** при загрузке
- Удаление из избранного
- Быстрое добавление в корзину
- Счетчик товаров

### Профиль (/profile)
- Информация о пользователе
- Статистика (заказы, избранное)
- Меню навигации
- Кнопка выхода

### Заказы (/orders)
- История заказов
- Детальный просмотр заказа
- Статусы заказов с цветовой индикацией

### Админ-панель (/admin)
- Дашборд со статистикой
- Управление товарами (CRUD)
- Управление категориями
- Управление заказами
- Управление пользователями
- Промокоды
- Акции и баннеры
- Юридические документы
- Загрузка файлов
- Аналитика
- Мониторинг здоровья системы

## State Management

### AuthStore (Zustand + Persist)
```typescript
const { user, isAuthenticated, loginWithTelegram, logout } = useAuthStore();
```

### CartStore (Zustand)
```typescript
// itemsCount и total - реактивные state properties (не getters!)
const { cart, itemsCount, total, addToCart, updateCartItem, removeCartItem } = useCartStore();
```

### FavoritesStore (Zustand + Persist)
```typescript
const { favoriteIds, toggleFavorite, isFavorite } = useFavoritesStore();
```

## API Integration

### API Client (Axios)

Автоматически:
- Добавляет JWT access token в headers
- Добавляет session token для корзины
- Обновляет токен при 401 ошибке
- Повторяет запрос после обновления токена

### Cart API Types (Flat DTO)

Backend возвращает плоскую структуру для корзины:

```typescript
interface CartItem {
  id: string;
  productId: string;
  productName: string;      // Плоское поле (не item.product.name!)
  productSlug: string;
  productImage: string;     // Плоское поле (не item.product.images[0]!)
  productArticle: string | null;
  basePrice: number;
  appliedPrice: number;     // Цена с учетом скидок
  hasPromotion: boolean;
  allowPromocode: boolean;
  quantity: number;
  subtotal: number;         // Итого за товар (не item.total!)
  inStock: boolean;
  availableQuantity: number;
}
```

### Endpoints

```typescript
import { authApi, productsApi, categoriesApi, cartApi } from '@/lib/api';

// Auth
await authApi.loginWithTelegram(initData);
await authApi.getCurrentUser();
await authApi.logout();

// Products
await productsApi.getProducts({ categoryId, sortBy, page, limit });
await productsApi.getProductBySlug(slug);
await productsApi.searchProducts(query, { categoryId, sortBy });
await productsApi.getRelatedProducts(productId);

// Categories
await categoriesApi.getCategories();
await categoriesApi.getHomeCategories();
await categoriesApi.getCategoryBySlug(slug);

// Cart
await cartApi.getCart();
await cartApi.addToCart(productId, quantity);
await cartApi.updateCartItem(itemId, quantity);
await cartApi.removeCartItem(itemId);
await cartApi.clearCart();
```

## Telegram SDK Integration

### Hooks

```typescript
// Main WebApp
const { webApp, isReady, user, initData } = useTelegram();

// Back Button
useTelegramBackButton(() => router.back());

// Main Button
useTelegramMainButton('Оформить', handleCheckout, { color: '#FF6B9D' });

// Haptic Feedback
const haptic = useTelegramHaptic();
haptic.impactOccurred('medium');
haptic.notificationOccurred('success');
haptic.selectionChanged();
```

## TypeScript

Все компоненты и функции полностью типизированы.

Проверка типов:
```bash
pnpm type-check
```

## User Flow

1. **Покупка товара:**
   Главная -> Товар -> Корзина -> Оформление -> Успех

2. **Поиск товара:**
   Главная -> Поиск -> Фильтры -> Товар -> Корзина

3. **Избранное:**
   Товар -> Добавить в избранное -> Избранное -> Корзина

4. **Просмотр заказов:**
   Профиль -> Заказы -> Детали заказа

## Оптимизации

- React.memo для ProductCard
- Image lazy loading
- Debounce для поиска (300ms)
- Persist для auth и favorites
- React Query для server state
- Dynamic imports для страниц
- Skeleton loading для лучшего UX
- Page transitions для плавной навигации

## License

Private project

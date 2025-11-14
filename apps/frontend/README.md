# Telegram Shop - Frontend

Современный интернет-магазин косметики в формате Telegram Mini App с минималистичным glassmorphism дизайном.

## 🚀 Технологии

- **Next.js 14+** - App Router, Server/Client Components
- **TypeScript** - Строгая типизация
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management с persist middleware
- **React Query** - Server state management
- **Axios** - HTTP client с interceptors
- **Telegram Mini Apps SDK** - WebApp интеграция

## 📁 Структура проекта

```
apps/frontend/
├── app/                          # Next.js App Router
│   ├── cart/                    # Страница корзины
│   ├── category/[slug]/         # Страница категории (динамическая)
│   ├── checkout/                # Оформление заказа
│   │   └── success/            # Успешное оформление
│   ├── favorites/               # Избранное
│   ├── orders/                  # История заказов
│   ├── product/[slug]/          # Страница товара (динамическая)
│   ├── profile/                 # Профиль пользователя
│   ├── search/                  # Поиск с фильтрами
│   ├── layout.tsx              # Root layout с Providers
│   ├── page.tsx                # Главная страница
│   └── globals.css             # Глобальные стили
├── components/                  # React компоненты
│   ├── ui/                     # UI Kit компоненты
│   │   ├── Button.tsx          # Кнопка с вариантами
│   │   ├── CategoryPill.tsx    # Кнопка категории
│   │   ├── Loading.tsx         # Компоненты загрузки
│   │   ├── ErrorMessage.tsx    # Обработка ошибок
│   │   ├── icons.tsx           # SVG иконки
│   │   └── index.ts            # Exports
│   ├── BottomNav.tsx           # Нижняя навигация
│   ├── Header.tsx              # Шапка приложения
│   ├── ProductCard.tsx         # Карточка товара
│   └── Providers.tsx           # React Query + App Init
├── lib/                         # Утилиты и библиотеки
│   ├── api/                    # API клиент
│   │   ├── endpoints/          # API endpoints
│   │   │   ├── auth.ts        # Авторизация
│   │   │   ├── cart.ts        # Корзина
│   │   │   ├── categories.ts  # Категории
│   │   │   └── products.ts    # Товары
│   │   ├── client.ts          # Axios instance с interceptors
│   │   ├── types.ts           # TypeScript типы
│   │   └── index.ts           # Exports
│   ├── telegram/               # Telegram SDK
│   │   └── useTelegram.ts     # Hooks для Telegram
│   └── utils.ts                # Общие утилиты
├── store/                       # Zustand stores
│   ├── useAuthStore.ts         # Авторизация
│   ├── useCartStore.ts         # Корзина
│   └── useFavoritesStore.ts    # Избранное
└── package.json
```

## 🎨 Дизайн система

### Glassmorphism стиль

Все компоненты используют единый минималистичный стиль:

```tsx
// Карточка
bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg

// Кнопка
bg-white/40 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/50

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

- Все переходы: `transition-all duration-300`
- Hover эффекты: `hover:bg-white/50 hover:shadow-xl`
- Активные состояния с haptic feedback

## 🔧 Установка

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

## 🌐 Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📱 Страницы и навигация

### Главная страница (/)
- Категории товаров (горизонтальный скролл)
- Сетка товаров 2x2
- Header: Menu, Search, Cart
- Bottom Nav: Каталог, Избранное, Корзина, Профиль

### Поиск (/search)
- Поисковая строка с debounce
- Фильтр по категориям
- Сортировка: Популярные, Новинки, Дешевле, Дороже
- Результаты в grid 2x2

### Категория (/category/[slug])
- Описание категории
- Сортировка товаров
- Счетчик товаров
- Grid 2x2

### Товар (/product/[slug])
- Изображение товара (fullscreen)
- Название, цена, описание
- Выбор количества
- Кнопка "В корзину"
- Похожие товары (4 карточки)
- Кнопка "Избранное" (сердечко)

### Корзина (/cart)
- Список товаров с изображениями
- Управление количеством
- Удаление товаров
- Расчет суммы с скидками
- Кнопка "Оформить заказ"

### Оформление (/checkout)
- Форма контактных данных
- Выбор способа доставки
- Выбор способа оплаты
- Валидация полей
- Итоговая сумма

### Избранное (/favorites)
- Список избранных товаров
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

## 🔄 State Management

### AuthStore (Zustand + Persist)
```typescript
const { user, isAuthenticated, loginWithTelegram, logout } = useAuthStore();
```

### CartStore (Zustand)
```typescript
const { cart, itemsCount, total, addToCart, updateCartItem, removeCartItem } = useCartStore();
```

### FavoritesStore (Zustand + Persist)
```typescript
const { favoriteIds, toggleFavorite, isFavorite } = useFavoritesStore();
```

## 📡 API Integration

### API Client (Axios)

Автоматически:
- Добавляет JWT access token в headers
- Добавляет session token для корзины
- Обновляет токен при 401 ошибке
- Повторяет запрос после обновления токена

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

## 📲 Telegram SDK Integration

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

## 🧪 TypeScript

Все компоненты и функции полностью типизированы.

Проверка типов:
```bash
pnpm type-check
```

## 🎯 User Flow

1. **Покупка товара:**
   Главная → Товар → Корзина → Оформление → Успех

2. **Поиск товара:**
   Главная → Поиск → Фильтры → Товар → Корзина

3. **Избранное:**
   Товар → Добавить в избранное → Избранное → Корзина

4. **Просмотр заказов:**
   Профиль → Заказы → Детали заказа

## 🚀 Оптимизации

- ✅ React.memo для ProductCard
- ✅ Image lazy loading
- ✅ Debounce для поиска (300ms)
- ✅ Persist для auth и favorites
- ✅ React Query для server state
- ✅ Dynamic imports для страниц

## 📝 Следующие шаги

1. Подключить реальный backend API
2. Добавить React Query hooks для всех endpoints
3. Добавить Error Boundaries
4. Добавить Toast notifications
5. Добавить форму обратной связи
6. Добавить страницу с юридическими документами
7. Добавить analytics (Telegram Analytics)
8. Добавить unit тесты (Jest + React Testing Library)
9. Добавить E2E тесты (Playwright)
10. Оптимизировать bundle size

## 📄 License

Private project

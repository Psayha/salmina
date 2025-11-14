# API Integration Guide

Руководство по интеграции frontend с backend API.

## 🔗 API Endpoints

### Base URL
```
http://localhost:3001/api
```

Настраивается через `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📋 Backend Endpoints

### Authentication

#### POST /auth/telegram
Авторизация через Telegram Mini App

**Request:**
```json
{
  "initData": "query_id=AAH...&user=%7B%22id%22..."
}
```

**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "telegramId": "123456789",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "photoUrl": "https://...",
      "role": "USER",
      "hasAcceptedTerms": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### GET /auth/me
Получить текущего пользователя

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "telegramId": "123456789",
    ...
  }
}
```

#### POST /auth/refresh
Обновить access token

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### POST /auth/logout
Выход

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

---

### Products

#### GET /products
Получить список товаров с фильтрами

**Query Parameters:**
- `page` (number, optional): Номер страницы (default: 1)
- `limit` (number, optional): Товаров на страницу (default: 20)
- `categoryId` (string, optional): ID категории
- `search` (string, optional): Поисковый запрос
- `minPrice` (number, optional): Минимальная цена
- `maxPrice` (number, optional): Максимальная цена
- `hasPromotion` (boolean, optional): Только акционные
- `isActive` (boolean, optional): Только активные (default: true)
- `sortBy` (string, optional): Сортировка (`name`, `price`, `createdAt`)
- `sortOrder` (string, optional): Порядок (`asc`, `desc`)

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Крем для лица",
        "slug": "krem-dlya-litsa",
        "description": "Описание товара",
        "article": "ART-001",
        "price": 1500,
        "discountPrice": null,
        "promotionPrice": null,
        "quantity": 10,
        "images": ["https://..."],
        "categoryId": "uuid",
        "isActive": true,
        "hasPromotion": false,
        "promotionLabel": null,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### GET /products/:slug
Получить товар по slug

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Крем для лица",
    "slug": "krem-dlya-litsa",
    ...
  }
}
```

#### GET /products/search
Поиск товаров

**Query Parameters:**
- `q` (string, required): Поисковый запрос
- Все параметры из GET /products

**Response:** Аналогично GET /products

#### GET /products/:id/related
Получить похожие товары

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Похожий товар",
      ...
    }
  ]
}
```

---

### Categories

#### GET /categories
Получить все категории

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Кремы",
      "slug": "kremy",
      "description": "Описание категории",
      "image": "https://...",
      "parentId": null,
      "showOnHome": true,
      "homeOrder": 1,
      "order": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET /categories/home
Получить категории для главной страницы

**Response:** Аналогично GET /categories, но только с `showOnHome: true`

#### GET /categories/:slug
Получить категорию по slug

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Кремы",
    "slug": "kremy",
    ...
  }
}
```

---

### Cart

Корзина работает с session token для анонимных пользователей и с JWT для авторизованных.

**Headers:**
```
x-session-token: {sessionToken}  // Для анонимных пользователей
Authorization: Bearer {accessToken}  // Для авторизованных
```

#### GET /cart
Получить корзину

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "sessionToken": "uuid",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "product": {
          "id": "uuid",
          "name": "Крем для лица",
          ...
        },
        "quantity": 2,
        "price": 1500,
        "appliedPrice": 1500,
        "total": 3000,
        "hasPromotion": false,
        "allowPromocode": true
      }
    ],
    "totals": {
      "subtotal": 3000,
      "itemsDiscount": 0,
      "promocodeDiscount": 0,
      "discount": 0,
      "total": 3000,
      "itemsCount": 2
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /cart/items
Добавить товар в корзину

**Request:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Response:** Аналогично GET /cart

#### PATCH /cart/items/:id
Обновить количество товара

**Request:**
```json
{
  "quantity": 3
}
```

**Response:** Аналогично GET /cart

#### DELETE /cart/items/:id
Удалить товар из корзины

**Response:** Аналогично GET /cart

#### DELETE /cart
Очистить корзину

**Response:** Аналогично GET /cart

---

### Orders

**Headers:**
```
Authorization: Bearer {accessToken}  // Требуется авторизация
```

#### GET /orders
Получить список заказов пользователя

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-00001",
      "status": "PAID",
      "items": [
        {
          "id": "uuid",
          "productName": "Крем для лица",
          "productArticle": "ART-001",
          "productImage": "https://...",
          "quantity": 2,
          "price": 1500,
          "appliedPrice": 1500,
          "hasPromotion": false,
          "promotionLabel": null
        }
      ],
      "subtotal": 3000,
      "itemsDiscount": 0,
      "promocodeDiscount": 0,
      "totalAmount": 3000,
      "promocodeId": null,
      "trackingNumber": null,
      "customerName": "Иван Иванов",
      "customerPhone": "+79991234567",
      "shippingAddress": "г. Москва, ул. Примерная, д. 1",
      "notes": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /orders
Создать заказ

**Request:**
```json
{
  "customerName": "Иван Иванов",
  "customerPhone": "+79991234567",
  "shippingAddress": "г. Москва, ул. Примерная, д. 1",
  "notes": "Комментарий к заказу"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "orderNumber": "ORD-00001",
    "status": "PAID",
    ...
  }
}
```

#### GET /orders/:id
Получить детали заказа

**Response:** Аналогично элементу из GET /orders

---

## 🔐 Authentication Flow

### 1. Инициализация приложения

```typescript
// components/Providers.tsx
function AppInitializer({ children }) {
  const { initData, isReady } = useTelegram();
  const loginWithTelegram = useAuthStore((state) => state.loginWithTelegram);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (!isReady) return;

    async function initialize() {
      // Проверяем наличие токена
      const hasToken = localStorage.getItem('accessToken');

      if (hasToken) {
        // Токен есть - получаем данные пользователя
        await fetchCurrentUser();
      } else if (initData) {
        // Токена нет - авторизуемся через Telegram
        await loginWithTelegram(initData);
      }

      // Загружаем корзину
      await fetchCart();
    }

    initialize();
  }, [isReady, initData]);

  return <>{children}</>;
}
```

### 2. API Client с автообновлением токена

```typescript
// lib/api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Access token истек
      try {
        // Обновляем токен
        await refreshAuthToken();

        // Повторяем запрос с новым токеном
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Refresh token тоже истек - выходим
        clearAuth();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
```

### 3. Session Token для корзины

```typescript
// store/useCartStore.ts
fetchCart: async () => {
  const cart = await cartApi.getCart();

  // Сохраняем session token для анонимных пользователей
  if (cart.sessionToken) {
    localStorage.setItem('sessionToken', cart.sessionToken);
  }

  set({ cart, isLoading: false });
}
```

---

## 🧪 Тестирование API

### Mock данные для разработки

Пока backend не готов, используйте mock данные на страницах:

```typescript
// app/page.tsx
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Крем для лица',
    slug: 'krem-dlya-litsa',
    price: 1500,
    images: [],
    // ...
  }
];
```

### Переключение на реальный API

1. Замените mock данные на API вызовы:

```typescript
// ДО
const [products] = useState(MOCK_PRODUCTS);

// ПОСЛЕ
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  async function fetchProducts() {
    const data = await productsApi.getProducts({ limit: 20 });
    setProducts(data.items);
  }
  fetchProducts();
}, []);
```

2. Или используйте React Query:

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: () => productsApi.getProducts({ limit: 20 }),
});
```

---

## 🐛 Отладка

### Проверка запросов

Откройте DevTools → Network → XHR

### Проверка токенов

```typescript
// В консоли браузера
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('sessionToken')
```

### Логирование API вызовов

```typescript
// lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url, config.params);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('[API Error]', error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);
```

---

## ✅ Чеклист интеграции

- [ ] Backend API запущен на http://localhost:3001
- [ ] Создан `.env.local` с `NEXT_PUBLIC_API_URL`
- [ ] Telegram Bot настроен с Mini App URL
- [ ] База данных создана и мигрирована
- [ ] Seed данные загружены (категории, товары)
- [ ] Frontend может авторизоваться через Telegram
- [ ] Корзина работает для анонимных пользователей
- [ ] Поиск и фильтры возвращают результаты
- [ ] Создание заказа работает
- [ ] История заказов отображается
- [ ] Изображения товаров загружаются

---

## 📞 Поддержка

При возникновении проблем проверьте:
1. Консоль браузера (F12)
2. Network вкладку (XHR запросы)
3. Backend логи
4. Telegram Web App консоль (если в Telegram)

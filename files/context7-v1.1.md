# .context7.md - Project Context for AI Assistants

> Этот файл содержит критически важную информацию о проекте для AI-ассистентов (Claude Code, Cursor, etc.)
> **ПРОЧТИ ЭТОТ ФАЙЛ ПОЛНОСТЬЮ ПЕРЕД НАЧАЛОМ ЛЮБОЙ РАБОТЫ**

---

## 🎯 О ПРОЕКТЕ

**Название:** Telegram Shop - Интернет-магазин косметики  
**Тип:** Telegram Mini App (Web Application)  
**Платформа:** Telegram (iOS, Android, Desktop, Web)  
**Клиент:** Фрилансер-заказчик (B2B проект)  
**Дедлайн:** Критичный (as soon as possible)  
**Цель:** Создать красивый, современный, production-ready магазин

---

## 🏗️ ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Frontend
- **Framework:** Next.js 14+ (App Router) - обязательно App Router, не Pages Router
- **Language:** TypeScript (strict mode, NO any types)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios с interceptors
- **Telegram SDK:** @telegram-apps/sdk
- **Animations:** Framer Motion (для плавных переходов)

### Backend
- **Runtime:** Node.js v20+
- **Framework:** Express.js или Fastify
- **Language:** TypeScript (strict mode)
- **ORM:** Prisma
- **Database:** PostgreSQL 15+
- **Auth:** JWT (access + refresh tokens)
- **Session:** Redis (для session tokens 30 дней)
- **Validation:** Zod на всех endpoints
- **Testing:** Jest + Supertest

### DevOps
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Hosting:** VPS
- **Proxy:** Nginx
- **SSL:** Let's Encrypt

### Integrations
- **Payment:** Prodamus API (СБП)
- **Messaging:** Telegram Bot API
- **Mini App:** Telegram Mini Apps API

---

## 📋 КРИТИЧЕСКИЕ ТРЕБОВАНИЯ

### Код Quality
```typescript
// ✅ ПРАВИЛЬНО - строгая типизация
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  // implementation
}

// ❌ НЕПРАВИЛЬНО - any запрещен
const getUser = async (id: any): Promise<any> => {
  // implementation
}
```

### Обработка ошибок
```typescript
// ✅ ВСЕГДА обрабатывай ошибки
try {
  const result = await apiCall();
  return result;
} catch (error) {
  if (error instanceof ApiError) {
    throw new CustomError('User-friendly message', error);
  }
  throw error;
}

// ❌ НИКОГДА не игнорируй ошибки
const result = await apiCall(); // Без try-catch
```

### Валидация
```typescript
// ✅ Валидация на backend
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
});

// Используй во всех endpoints
```

### Security
```typescript
// ✅ Всегда проверяй initData от Telegram
const validateInitData = (initData: string, botToken: string): boolean => {
  // Validate hash
  // Validate timestamp
  return isValid;
}

// ❌ Никогда не доверяй клиентским данным без проверки
```

---

## 🎨 ДИЗАЙН СИСТЕМА

### Принципы
1. **Минимализм** - clean и современный
2. **Premium feel** - косметика = премиум бренд
3. **Интуитивность** - пользователь не должен думать
4. **Скорость** - все должно работать мгновенно
5. **Адаптивность** - идеально на любом устройстве

### Цветовая палитра
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      // Используй Telegram theme colors
      'tg-bg': 'var(--tg-theme-bg-color)',
      'tg-text': 'var(--tg-theme-text-color)',
      'tg-hint': 'var(--tg-theme-hint-color)',
      'tg-link': 'var(--tg-theme-link-color)',
      'tg-button': 'var(--tg-theme-button-color)',
      'tg-button-text': 'var(--tg-theme-button-text-color)',
      
      // Брендовые цвета (для косметики)
      'brand': {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',
        900: '#7f1d1d',
      },
    },
  },
}
```

### Типографика
```javascript
// Использовать system fonts для производительности
fontFamily: {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica',
    'Arial',
    'sans-serif',
  ],
}
```

### Компоненты UI
**Создай в /components/ui/**
- Button (variants: primary, secondary, outline, ghost, danger)
- Input (text, email, phone, textarea)
- Card
- Modal
- Badge
- Loading (spinner, skeleton)
- Toast
- Dropdown
- Checkbox/Radio
- Tabs

**Требования к компонентам:**
- Поддержка светлой и темной темы
- Haptic feedback для всех кликабельных элементов
- Loading states
- Disabled states
- Error states
- Accessibility (a11y)

---

## 📁 СТРУКТУРА ПРОЕКТА

```
telegram-shop/
├── apps/
│   ├── frontend/                    # Next.js 14+ App Router
│   │   ├── app/
│   │   │   ├── (user)/             # User routes
│   │   │   │   ├── page.tsx        # Главная
│   │   │   │   ├── catalog/
│   │   │   │   ├── product/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   ├── profile/
│   │   │   │   ├── favorites/
│   │   │   │   └── orders/
│   │   │   └── (admin)/            # Admin routes
│   │   │       ├── login/
│   │   │       └── dashboard/
│   │   ├── components/
│   │   │   ├── ui/                 # UI Kit
│   │   │   ├── features/           # Feature components
│   │   │   └── layouts/
│   │   ├── lib/                    # Utilities
│   │   ├── hooks/                  # Custom hooks
│   │   ├── store/                  # Zustand store
│   │   ├── types/                  # TypeScript types
│   │   └── styles/                 # Global styles
│   │
│   ├── backend/                     # Node.js API
│   │   ├── src/
│   │   │   ├── modules/            # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── products/
│   │   │   │   ├── categories/
│   │   │   │   ├── orders/
│   │   │   │   ├── cart/
│   │   │   │   ├── favorites/
│   │   │   │   ├── promocodes/
│   │   │   │   ├── notifications/
│   │   │   │   ├── payments/
│   │   │   │   └── analytics/
│   │   │   ├── common/             # Shared code
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   └── utils/
│   │   │   ├── config/
│   │   │   └── types/
│   │   ├── prisma/                 # Database schema
│   │   └── tests/                  # Tests
│   │
│   └── bot/                         # Telegram Bot
│       ├── src/
│       │   ├── handlers/
│       │   ├── services/
│       │   └── utils/
│       └── types/
│
├── packages/                        # Shared packages
│   ├── shared/                     # Common utilities
│   ├── ui/                         # UI components library
│   └── types/                      # Shared TypeScript types
│
├── docs/                           # Documentation
│   ├── API.md
│   ├── FRONTEND.md
│   ├── BACKEND.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── .github/
│   └── workflows/                  # CI/CD
│       ├── test.yml
│       └── deploy.yml
│
├── docker-compose.yml
├── .context7.md                    # Этот файл
└── README.md
```

---

## 🔑 КЛЮЧЕВЫЕ БИЗНЕС-ПРАВИЛА

### Товары
- **Остаток ≤ 3** → показать badge "Осталось N шт"
- **Остаток = 0** → кнопка "Сообщить о поступлении"
- **До 4 фото** → если 1, скрыть навигацию слайдера
- **Метки** (новинка, хит, скидка) устанавливает админ
- **Связанные товары** показывать горизонтально
- **Поиск** по названию, описанию, составу, артикулу, SKU

### Корзина
- **Session token** живет 30 дней
- **Промокод** применяется в корзине
- **Доставка** статичный текст из админки (страница "Доставка")
- **Изменение количества** через +/- или input

### Заказы
**Статусы:**
- `PAID` - оплачен (устанавливает Prodamus)
- `PROCESSING` - формируется (админ)
- `SHIPPED` - отправлен (админ + обязательный трек-номер)
- `CANCELLED` - отменен

**Правила:**
- Отмена до `PROCESSING` - пользователь сам
- Отмена после `PROCESSING` - запрос админу
- При `SHIPPED` - обязательное поле трек-номер
- Уведомление в Telegram при каждой смене статуса
- **История хранится 3 месяца** (auto-cleanup)

### Админ панель
**Авторизация (2FA):**
1. Проверка Telegram ID в списке админов
2. Генерация 6-значного кода (expires 5 min)
3. Отправка кода в Telegram чат админу
4. Ввод кода на странице
5. Выдача JWT токена

**Метрики:**
- Оплачено (сумма PAID заказов)
- Отгружено (количество SHIPPED)
- В обработке (PAID + PROCESSING)
- Всего заказов

### Платежи
- **Prodamus** для СБП
- **Оплата при получении** - оплачивается только товар, доставка наложенным платежом через СДЭК
- Webhook от Prodamus обновляет статус заказа
- При успешной оплате → уведомление в Telegram

### Уведомления в Telegram
**Пользователю:**
- Заказ оплачен
- Заказ отправлен (+ трек-номер)
- Товар в наличии (если была подписка)
- Подписка на товар активирована

**Админу:**
- Новый заказ
- Запрос на отмену заказа
- Код входа в админку

---

## 🚫 ЧТО НЕЛЬЗЯ ДЕЛАТЬ

### Код
- ❌ Использовать `any` в TypeScript
- ❌ Игнорировать ошибки
- ❌ Hardcode значений (всё в .env)
- ❌ Создавать компоненты без типов
- ❌ Пропускать валидацию данных
- ❌ Console.log в production коде
- ❌ Inline styles (только Tailwind classes)

### Безопасность
- ❌ Доверять клиентским данным без проверки
- ❌ Хранить sensitive data в коде
- ❌ Пропускать проверку initData от Telegram
- ❌ Использовать слабые JWT секреты
- ❌ Игнорировать SQL injection защиту

### Архитектура
- ❌ God objects / God functions
- ❌ Circular dependencies
- ❌ Tight coupling
- ❌ Дублирование кода
- ❌ Смешивание concerns (business logic + UI)

### UX
- ❌ Отсутствие loading states
- ❌ Отсутствие error handling UI
- ❌ Отсутствие feedback (haptic, toast)
- ❌ Неадаптивный дизайн
- ❌ Долгие операции без индикации

---

## ✅ ЧТО НУЖНО ДЕЛАТЬ

### Каждый файл
```typescript
/**
 * @file ProductCard.tsx
 * @description Карточка товара для каталога
 * @author AI Assistant
 * @created 2024-XX-XX
 */

import { FC } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
  isHit?: boolean;
  isDiscount?: boolean;
  discountPrice?: number;
  quantity: number;
}

export const ProductCard: FC<ProductCardProps> = ({ ... }) => {
  // Component logic
}
```

### Каждая функция
```typescript
/**
 * Форматирует цену для отображения
 * @param price - Цена в рублях
 * @returns Отформатированная строка "1 299 ₽"
 */
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ₽`;
}
```

### Каждый API endpoint
```typescript
/**
 * GET /api/products
 * Получение списка товаров с фильтрацией и пагинацией
 * 
 * Query params:
 * - categoryId?: string
 * - search?: string
 * - sortBy?: 'price' | 'popular' | 'new'
 * - order?: 'asc' | 'desc'
 * - page?: number
 * - limit?: number
 * 
 * Returns: { products: Product[], total: number, page: number }
 */
router.get('/products', validate(getProductsSchema), getProducts);
```

### Testing
```typescript
// Unit test example
describe('ProductService', () => {
  describe('getProductById', () => {
    it('should return product when exists', async () => {
      // Arrange
      const productId = 'test-id';
      const mockProduct = { id: productId, name: 'Test' };
      
      // Act
      const result = await productService.getProductById(productId);
      
      // Assert
      expect(result).toEqual(mockProduct);
    });
    
    it('should throw error when product not found', async () => {
      // Arrange & Act & Assert
      await expect(
        productService.getProductById('invalid-id')
      ).rejects.toThrow('Product not found');
    });
  });
});
```

---

## 🎯 ПРИОРИТЕТЫ РАЗРАБОТКИ

### Phase 1: Foundation (Дни 1-2)
1. Setup monorepo (pnpm workspaces)
2. Docker configuration (PostgreSQL, Redis)
3. Prisma setup + migrations
4. TypeScript, ESLint, Prettier configs
5. CI/CD pipeline (GitHub Actions)

### Phase 2: Backend Core (Дни 3-5)
1. Authentication (JWT + initData validation)
2. User management
3. Products CRUD
4. Categories
5. Orders
6. Cart
7. Favorites
8. Promocodes
9. Telegram Bot notifications

### Phase 3: Frontend Core (Дни 6-10)
1. UI Kit components
2. Layouts
3. Home page
4. Catalog + filters + search
5. Product page
6. Cart
7. Checkout
8. Profile
9. Orders history
10. Favorites

### Phase 4: Admin Panel (Дни 11-13)
1. Admin auth (2FA via Telegram)
2. Dashboard
3. Products management
4. Orders management
5. Users management
6. Promocodes
7. Content (banners, pages)
8. Analytics

### Phase 5: Integrations (Дни 14-15)
1. Prodamus payment
2. Telegram Bot
3. Notifications system

### Phase 6: Testing (Дни 16-18)
1. Unit tests (>80% coverage)
2. Integration tests
3. E2E tests (Playwright)
4. Performance optimization
5. Security audit

### Phase 7: Deployment (Дни 19-20)
1. Docker production build
2. VPS setup
3. Nginx + SSL
4. CI/CD finalization
5. Monitoring

### Phase 8: Polish (День 21)
1. Final documentation
2. Code review
3. Final testing
4. Production deployment

---

## 🔍 ПЕРЕД КОММИТОМ ПРОВЕРЬ

- [ ] TypeScript компилируется без ошибок
- [ ] ESLint не показывает warnings
- [ ] Prettier форматирование применено
- [ ] Все импорты работают
- [ ] Нет console.log в коде
- [ ] Добавлены комментарии к сложной логике
- [ ] Добавлены JSDoc к публичным функциям/компонентам
- [ ] Написаны тесты (если нужно)
- [ ] Обновлена документация (если нужно)
- [ ] Код ревью самого себя

---

## 📚 ПОЛЕЗНЫЕ ССЫЛКИ

### Документация
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [@telegram-apps/sdk](https://docs.telegram-mini-apps.com/)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Best Practices
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React Best Practices](https://react.dev/learn)
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [REST API Design](https://restfulapi.net/)

---

## 💬 СТИЛЬ КОММУНИКАЦИИ

### При вопросах
**ВСЕГДА СПРАШИВАЙ ПЕРЕД РЕАЛИЗАЦИЕЙ**, если:
- Требование неоднозначное
- Несколько вариантов реализации
- Нужно принять архитектурное решение
- Что-то противоречит ТЗ

### При проблемах
Сообщай в формате:
```
❌ ПРОБЛЕМА: [описание]
🔍 ПРИЧИНА: [почему возникла]
💡 РЕШЕНИЕ: [как исправить]
⏱️ ВРЕМЯ: [сколько займет]
```

### При завершении задачи
```
✅ ЗАДАЧА: [название]
📝 ЧТО СДЕЛАНО: [список]
🧪 ТЕСТИРОВАНИЕ: [результаты]
📄 ДОКУМЕНТАЦИЯ: [обновлена/нет]
➡️ СЛЕДУЮЩИЙ ШАГ: [что дальше]
```

---

## 🎯 ФИЛОСОФИЯ ПРОЕКТА

> "Делай правильно с первого раза, а не быстро и потом переделывай"

**Принципы:**
1. **Quality First** - качество важнее скорости
2. **User Experience** - пользователь не должен думать
3. **Maintainability** - код легко читать и изменять
4. **Security** - безопасность на каждом уровне
5. **Performance** - быстро везде и всегда
6. **Scalability** - готовность к росту
7. **Documentation** - код документирован
8. **Testing** - всё покрыто тестами

---

## 🚀 ТЕКУЩИЙ СТАТУС

**Версия:** 0.1.0 (initial development)  
**Фаза:** Setup  
**Следующий шаг:** [обновляется]

---

## 📞 КОНТАКТЫ

**Разработчик:** AI Assistant (Claude Code)  
**Проект:** Telegram Shop  
**Дата начала:** [дата]  
**Дата дедлайна:** ASAP

---

**ВАЖНО:** Этот файл должен оставаться актуальным. Обновляй его при изменении требований или архитектурных решений.

**ПОМНИ:** Ты создаешь production-ready продукт, который будут использовать реальные пользователи. Качество кода = качество продукта.

---

## 🎓 LEARNING RESOURCES

Если нужно освежить знания:

**TypeScript:**
- Strict mode configuration
- Generic types
- Utility types (Pick, Omit, Partial, etc.)
- Type guards

**React/Next.js:**
- Server Components vs Client Components
- App Router patterns
- Data fetching strategies
- Caching strategies

**Node.js/Backend:**
- Clean Architecture
- SOLID principles
- Error handling patterns
- Database optimization

**Security:**
- JWT best practices
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection

---

## 📝 CHANGELOG

### [0.1.0] - 2024-XX-XX
- Initial project setup
- Created .context7.md

---

**END OF .context7.md**

> Ты прочитал всю необходимую информацию. Теперь ты готов к работе над проектом.
> Удачи! 🚀

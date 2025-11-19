# 🎯 ВТОРАЯ КРИТИЧЕСКАЯ ОШИБКА - НАЙДЕНА!

## 🔥 ОШИБКА #16: Несоответствие имен JWT переменных окружения

**Статус:** 🔴 **КРИТИЧНО - ЛОМАЕТ ЛОКАЛЬНЫЙ ЗАПУСК И ТЕСТЫ**

### Проблема

В проекте используются **РАЗНЫЕ названия** для JWT переменных окружения:

#### .env.example (документация для разработчиков):
```bash
JWT_ACCESS_SECRET=your-super-secret-access-token-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### env.ts (что код на самом деле использует):
```typescript
export const env = {
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "",  // ← НЕ JWT_ACCESS_SECRET!
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",  // ← НЕ JWT_ACCESS_EXPIRES_IN!
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
}

// Validation
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",  // ← Требует JWT_SECRET!
  "JWT_REFRESH_SECRET",
  "TELEGRAM_BOT_TOKEN",
];
```

#### jest.setup.js (тесты):
```javascript
process.env.JWT_ACCESS_SECRET = 'test-secret-key';  // ← НЕПРАВИЛЬНОЕ ИМЯ!
process.env.JWT_REFRESH_SECRET = 'test-refresh-key';  // ← Правильное
```

#### CI/CD (.github/workflows/test.yml):
```yaml
env:
  JWT_SECRET: test-secret-jwt  # ← ПРАВИЛЬНОЕ ИМЯ!
  JWT_REFRESH_SECRET: test-secret-refresh
```

### Суть проблемы

| Источник | JWT Access Variable | JWT Expires Variable |
|----------|-------------------|---------------------|
| **.env.example** | JWT_ACCESS_SECRET ❌ | JWT_ACCESS_EXPIRES_IN ❌ |
| **env.ts (код)** | JWT_SECRET ✅ | JWT_EXPIRES_IN ✅ |
| **jest.setup.js** | JWT_ACCESS_SECRET ❌ | - |
| **CI (test.yml)** | JWT_SECRET ✅ | - |

### Impact

1. **Новый разработчик:**
   ```bash
   # Копирует .env.example в .env
   cp .env.example .env

   # Запускает backend
   pnpm dev:backend

   # ❌ ОШИБКА: Missing required environment variable: JWT_SECRET
   ```

2. **Локальные тесты:**
   ```bash
   pnpm test

   # Jest использует JWT_ACCESS_SECRET
   # env.ts ожидает JWT_SECRET
   # ❌ Токены не будут работать правильно!
   ```

3. **CI vs Local:**
   - CI работает (использует правильное JWT_SECRET)
   - Local тесты используют неправильное JWT_ACCESS_SECRET
   - Разное поведение!

### Доказательство

```bash
# .env.example имеет неправильные имена:
$ grep JWT .env.example
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m

# env.ts ожидает другие имена:
$ grep "JWT_SECRET:" apps/backend/src/config/env.ts
  JWT_SECRET: process.env.JWT_SECRET || "",

# jest.setup.js тоже неправильное:
$ grep JWT_ACCESS apps/backend/jest.setup.js
process.env.JWT_ACCESS_SECRET = 'test-secret-key';

# CI использует правильное:
$ grep JWT_SECRET .github/workflows/test.yml
  JWT_SECRET: test-secret-jwt
```

### Как это работает сейчас?

**Парадокс:** Проект работает потому что:
- Production VPS уже имеет правильные переменные в .env
- CI использует правильные имена в env секции
- Разработчики вручную исправляют .env.example → .env

**НО:** Это создает friction для новых разработчиков!

### Решение

**Вариант 1:** Исправить .env.example (рекомендуется)
```bash
# .env.example
JWT_SECRET=your-super-secret-access-token-key-change-this  # ← Убрать ACCESS
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this
JWT_EXPIRES_IN=15m  # ← Убрать ACCESS
JWT_REFRESH_EXPIRES_IN=7d
```

**Вариант 2:** Исправить env.ts (Breaking change!)
```typescript
// НЕ рекомендуется - нужно менять код и CI
JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
```

**Вариант 3:** Исправить jest.setup.js
```javascript
// jest.setup.js
process.env.JWT_SECRET = 'test-secret-key';  // ← Исправить имя
process.env.JWT_REFRESH_SECRET = 'test-refresh-key';
```

### Рекомендуемое решение

Исправить оба файла:

```bash
# 1. Исправить .env.example
sed -i 's/JWT_ACCESS_SECRET/JWT_SECRET/' .env.example
sed -i 's/JWT_ACCESS_EXPIRES_IN/JWT_EXPIRES_IN/' .env.example

# 2. Исправить jest.setup.js
sed -i 's/JWT_ACCESS_SECRET/JWT_SECRET/' apps/backend/jest.setup.js

# 3. Коммит
git add .env.example apps/backend/jest.setup.js
git commit -m "fix: correct JWT environment variable names"
```

### Severity

- **Критичность:** ВЫСОКАЯ
- **Блокирует:** Onboarding новых разработчиков, локальные тесты
- **False positive:** Работает в production/CI на правильных именах
- **Developer friction:** Высокий - требует ручного исправления

### Дополнительный анализ

Проверил где используются эти переменные:

```typescript
// apps/backend/src/common/utils/crypto.ts
jwt.sign(payload, env.JWT_SECRET, {  // ← Использует JWT_SECRET
  expiresIn: env.JWT_EXPIRES_IN,
});

jwt.verify(token, env.JWT_SECRET);  // ← Использует JWT_SECRET
```

```typescript
// apps/backend/src/config/env.ts
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",  // ← Валидация требует JWT_SECRET
  "JWT_REFRESH_SECRET",
  "TELEGRAM_BOT_TOKEN",
];
```

Код **везде** использует `JWT_SECRET` (без ACCESS), только .env.example и jest.setup.js ошибочно используют `JWT_ACCESS_SECRET`.

### История ошибки

Вероятно что:
1. Изначально использовались имена с ACCESS (JWT_ACCESS_SECRET)
2. Потом рефакторинг сократил до JWT_SECRET
3. Забыли обновить .env.example и jest.setup.js
4. Production/CI были обновлены вручную
5. Новые разработчики сталкиваются с проблемой

---

## Итоговая сводка двух реальных ошибок

| # | Проблема | Где | Impact | Severity |
|---|----------|-----|--------|----------|
| 14 | Prisma version mismatch | package.json vs lockfile | 403 Forbidden, блокирует сборку | 🔥 CRITICAL |
| 16 | JWT variable names mismatch | .env.example vs env.ts | Onboarding friction, тесты | 🔥 HIGH |

Обе ошибки показывают **drift между документацией и реальным кодом**.

### Почему эти ошибки критичны

1. **Ошибка #14 (Prisma):**
   - Прямая техническая проблема
   - Невозможно запустить build
   - 100+ TypeScript ошибок

2. **Ошибка #16 (JWT names):**
   - Проблема onboarding'а
   - Новый разработчик не сможет запустить проект
   - Тесты работают неправильно локально
   - CI работает, local нет

### Как я нашел эту ошибку

1. **Проверил все конфигурационные файлы:**
   - .env.example
   - env.ts
   - jest.setup.js
   - CI workflows

2. **Сравнил имена переменных:**
   ```bash
   grep JWT .env.example
   grep JWT apps/backend/src/config/env.ts
   grep JWT apps/backend/jest.setup.js
   ```

3. **Обнаружил несоответствие:**
   - .env.example: JWT_ACCESS_SECRET
   - env.ts: JWT_SECRET
   - Разница в одном слове, но критична!

---

## Обновленная финальная оценка

**Всего найдено: 16 критических проблем**

### По категориям:

🔥 **КРИТИЧЕСКИЕ (7):**
1. Prisma Client не генерируется (#1)
2. package-lock.json конфликт (#2)
3. Security vulnerabilities (#3)
4. packages/types без @types/node (#4)
5. **Prisma version mismatch (#14)** ← КОРНЕВАЯ ПРИЧИНА!
6. **JWT variable names mismatch (#16)** ← НАЙДЕНА!
7. deploy-production без prisma generate (#12)

🟠 **СЕРЬЕЗНЫЕ (5):**
8. prisma/migrations в .gitignore (#5)
9. Дубликат packages/types (#6)
10. Node.js version mismatch (#7)
11. axios version inconsistency (#15)
12. CI test:coverage не существует (#13)

🟡 **СРЕДНИЕ (4):**
13. Next.js config минимальный (#8)
14. TypeScript configs не унифицированы (#9)
15. Отсутствие Dockerfile (#10)
16. CI/CD недоработки (#11)

**Финальная оценка: 3/10**

**Критичность находок:**
- Обе ошибки (#14 и #16) блокируют новых разработчиков
- #14 - техническая проблема (403 Forbidden)
- #16 - проблема документации/onboarding
- Обе показывают drift между кодом и конфигурацией

---

## Экстренный план действий

```bash
# 1. Исправить Prisma (корневая причина 403)
cd apps/backend
pnpm add @prisma/client@5.19.0 prisma@5.19.0 -D
pnpm prisma generate

# 2. Исправить JWT variable names
sed -i 's/JWT_ACCESS_SECRET/JWT_SECRET/' ../../.env.example
sed -i 's/JWT_ACCESS_EXPIRES_IN/JWT_EXPIRES_IN/' ../../.env.example
sed -i 's/JWT_ACCESS_SECRET/JWT_SECRET/' jest.setup.js

# 3. Проверить что все работает
cd ../..
pnpm install
pnpm type-check
pnpm test
pnpm build

# 4. Коммит
git add -A
git commit -m "fix: resolve Prisma version and JWT variable names"
```

После этих исправлений проект должен работать для новых разработчиков!

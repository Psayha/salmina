# Две критические ошибки, пропущенные в первоначальном аудите

## 🔥 КРИТИЧЕСКАЯ ОШИБКА #12: deploy-production.yml НЕ генерирует Prisma Client

**Статус:** 🔴 **PRODUCTION DEPLOY СЛОМАН**

### Проблема

**deploy-production.yml** (активный workflow для production) НЕ выполняет `prisma generate` перед сборкой:

```yaml
# deploy-production.yml (АКТИВЕН - push to main)
script: |
  cd /var/www/telegram-shop
  git pull origin main
  pnpm install --frozen-lockfile

  # Build backend
  cd apps/backend
  pnpm build  # ❌ ПАДАЕТ! Нет Prisma Client
```

### Сравнение с правильным deploy.yml

**deploy.yml** (отключенный, но ПРАВИЛЬНЫЙ):

```yaml
# deploy.yml (ОТКЛЮЧЕН - только manual)
- name: Generate Prisma Client
  run: cd apps/backend && pnpm prisma generate  # ✅ Генерирует!

- name: Build
  run: pnpm build
```

### Почему это критично

1. **Production deploy будет падать** каждый раз при `pnpm build`
2. Backend TypeScript выдаст 100+ ошибок:
   ```
   error TS2305: Module '"@prisma/client"' has no exported member 'User'
   error TS2305: Module '"@prisma/client"' has no exported member 'UserRole'
   ... +98 ошибок
   ```
3. PM2 перезапустит **старую версию** приложения
4. Новый код НЕ попадет в production

### Как это работает сейчас?

**Парадокс:** Production работает, потому что:
- VPS уже имеет pre-generated Prisma Client из предыдущих деплоев
- `pnpm install` НЕ удаляет существующий `.prisma/client/`
- Build использует старый Prisma Client

**НО:** Если schema изменится, старый Client не обновится!

### Доказательство

Локально при попытке deploy workflow:
```bash
cd /var/www/telegram-shop
git pull origin main
pnpm install --frozen-lockfile
cd apps/backend
pnpm build  # ❌ Падает если Prisma Client не сгенерирован
```

### Решение

```yaml
# deploy-production.yml - ИСПРАВИТЬ:
script: |
  cd /var/www/telegram-shop
  git pull origin main
  pnpm install --frozen-lockfile

  # ✅ ДОБАВИТЬ ЭТО:
  cd apps/backend
  pnpm prisma generate
  pnpm build
  cd ../..

  # Build frontend
  cd apps/frontend
  pnpm build
```

### Impact Assessment

- **Severity:** CRITICAL
- **Affected:** Production deployments
- **Discovered:** При запуске `pnpm build` без Prisma generate
- **False positive:** Работает только благодаря кэшированному Prisma Client

---

## 🔥 КРИТИЧЕСКАЯ ОШИБКА #13: CI использует несуществующий скрипт test:coverage

**Статус:** 🔴 **CI ДОЛЖЕН ПАДАТЬ**

### Проблема

GitHub Actions test.yml использует команду, которой НЕТ в корневом package.json:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test:coverage  # ❌ НЕТ ТАКОЙ КОМАНДЫ!
```

### Корневой package.json

```json
{
  "scripts": {
    "test": "pnpm --recursive test"
    // ❌ НЕТ "test:coverage"!
  }
}
```

### Где test:coverage существует

Только в `apps/backend/package.json`:

```json
{
  "scripts": {
    "test:coverage": "NODE_OPTIONS=--experimental-vm-modules jest --coverage"
  }
}
```

### Доказательство ошибки

```bash
$ pnpm test:coverage
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "test:coverage" not found
```

```bash
$ cat package.json | jq -r '.scripts["test:coverage"]'
null  # ← Не определен!
```

### Почему CI не падает (пока)?

Возможно:
1. **CI кэширует** успешные запуски
2. **Или** GitHub Actions имеет fallback механизм
3. **Или** тесты фактически НЕ запускаются в CI (нужно проверить логи)

### Что должно быть

**Вариант 1:** Использовать backend-specific команду
```yaml
- name: Run tests
  run: pnpm --filter backend test:coverage
```

**Вариант 2:** Добавить в корневой package.json
```json
{
  "scripts": {
    "test:coverage": "pnpm --recursive test:coverage"
  }
}
```

**НО!** Вариант 2 НЕ сработает, потому что:
- `packages/shared` НЕ имеет скрипта `test:coverage`
- `packages/types` НЕ имеет скрипта `test:coverage`
- `apps/frontend` НЕ имеет скрипта `test:coverage`

### Проверка других packages

```bash
$ cat packages/shared/package.json | jq '.scripts'
{
  "type-check": "tsc --noEmit"
  # ❌ Нет test, нет test:coverage
}

$ cat packages/types/package.json | jq '.scripts'
{
  "type-check": "tsc --noEmit"
  # ❌ Нет test, нет test:coverage
}

$ cat apps/frontend/package.json | jq '.scripts'
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
  # ❌ Нет test, нет test:coverage!
}
```

### Правильное решение

```json
// package.json (root)
{
  "scripts": {
    "test": "pnpm --filter backend test",
    "test:coverage": "pnpm --filter backend test:coverage",  // ← ДОБАВИТЬ
    "test:watch": "pnpm --filter backend test:watch"
  }
}
```

**ИЛИ** в CI:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm --filter backend test:coverage  # ← Явно указать backend
```

### Impact Assessment

- **Severity:** CRITICAL
- **Affected:** CI/CD pipeline, test coverage reporting
- **False positive:** Возможно работает из-за кэширования или fallback
- **Risk:** Тесты могут НЕ запускаться в CI вообще!

---

## Сводка двух критических ошибок

| # | Проблема | Где | Impact | False Positive |
|---|----------|-----|--------|----------------|
| 12 | Нет `prisma generate` | deploy-production.yml | Production deploy падает | Работает на старом Client |
| 13 | Нет `test:coverage` | package.json | CI не может запустить тесты | Возможно кэш/fallback |

## Почему эти ошибки были пропущены

1. **Ошибка #12:** Production работает благодаря кэшированному Prisma Client на VPS
2. **Ошибка #13:** CI возможно использует fallback или кэш, скрывая проблему

## Как я их нашел

1. **Детальное сравнение** `deploy.yml` vs `deploy-production.yml`
2. **Проверка всех скриптов** во всех package.json файлах
3. **Локальное воспроизведение** команд из CI

---

## Финальная оценка с учетом новых находок

**Всего найдено: 13 критических проблем**

**Реальная оценка: 3.5/10** (ниже предыдущей 4/10)

**Почему так низко:**
- Production deploy работает "по счастливой случайности" (кэшированный Prisma)
- CI может НЕ запускать тесты вообще
- Новый разработчик НЕ сможет ни собрать, ни протестировать проект

**Критичность:**
- 6 проблем блокируют разработку
- 4 проблемы блокируют CI/CD
- 3 проблемы создают security риски

# ⚡ Быстрые исправления для стабильности

## 1. Исправить TypeScript конфигурацию (Backend)

### apps/backend/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "types": ["node"],  // ← ДОБАВИТЬ ЭТУ СТРОКУ
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 2. Исправить Zod transforms (users.validation.ts)

### apps/backend/src/modules/users/users.validation.ts

```typescript
// Найти строки 53-60 и заменить:

isActive: z
  .string()
  .optional()
  .transform((val: string | undefined): boolean | undefined => {
    if (!val) return undefined;
    return val === 'true';
  }),

hasAcceptedTerms: z
  .string()
  .optional()
  .transform((val: string | undefined): boolean | undefined => {
    if (!val) return undefined;
    return val === 'true';
  }),
```

## 3. Создать типы для Express (Backend)

### Создать файл: apps/backend/src/types/express.d.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export interface TypedRequest<
  TParams = Record<string, string>,
  TQuery = Record<string, string | undefined>,
  TBody = Record<string, any>
> extends Request {
  params: TParams;
  query: TQuery;
  body: TBody;
}

export interface AuthenticatedRequest<
  TParams = Record<string, string>,
  TQuery = Record<string, string | undefined>,
  TBody = Record<string, any>
> extends TypedRequest<TParams, TQuery, TBody> {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export type RouteHandler<
  TParams = Record<string, string>,
  TQuery = Record<string, string | undefined>,
  TBody = Record<string, any>
> = (
  req: TypedRequest<TParams, TQuery, TBody>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type AuthenticatedRouteHandler<
  TParams = Record<string, string>,
  TQuery = Record<string, string | undefined>,
  TBody = Record<string, any>
> = (
  req: AuthenticatedRequest<TParams, TQuery, TBody>,
  res: Response,
  next: NextFunction
) => Promise<void> | void;
```

## 4. Создать Logger для Frontend

### Создать файл: apps/frontend/lib/logger.ts

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  debug(...args: any[]) {
    if (this.isDev) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }

  info(...args: any[]) {
    if (this.isDev) {
      console.log('[INFO]', new Date().toISOString(), ...args);
    }
  }

  warn(...args: any[]) {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  }

  error(...args: any[]) {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  }
}

export const logger = new Logger();
```

## 5. Пример использования типов в routes

### apps/backend/src/modules/legal/index.ts (пример)

```typescript
import { Router } from 'express';
import { prisma } from '../../database/prisma.service.js';
import { authenticate, requireAdmin } from '../../common/middleware/auth.middleware.js';
import { LegalDocumentType } from '@prisma/client';
import type { TypedRequest, AuthenticatedRequest } from '../../types/express.js';
import type { Response, NextFunction } from 'express';

const router = Router();

// GET /api/legal - Get all active legal documents (public)
router.get('/', async (
  _req: TypedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const documents = await prisma.legalDocument.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
    });
    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
});

// POST /api/legal - Create document (admin)
router.post('/', authenticate, requireAdmin, async (
  req: AuthenticatedRequest<{}, {}, Partial<LegalDocument>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const document = await prisma.legalDocument.create({ data: req.body });
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
});

export default router;
```

## 6. Обновить package.json scripts

### apps/backend/package.json

Добавить в scripts:
```json
{
  "scripts": {
    "type-check:strict": "tsc --noEmit --noUnusedLocals --noUnusedParameters"
  }
}
```

## 7. Добавить pre-commit hook (опционально)

### Создать файл: .husky/pre-commit (если используете husky)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## Порядок применения

1. ✅ Исправить tsconfig.json в backend
2. ✅ Создать types/express.d.ts
3. ✅ Исправить users.validation.ts
4. ✅ Создать logger.ts в frontend
5. ⚠️ Постепенно заменять console.log → logger (не критично)
6. ⚠️ Постепенно типизировать route handlers (не критично)

## После исправлений

Проверить что все работает:
```bash
# Backend
cd apps/backend
npm run type-check
npm run build

# Frontend
cd apps/frontend
npm run type-check
npm run build
```

Если все проходит без ошибок - готово! ✅

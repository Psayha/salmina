# 💳 Prodamus Payment Integration Guide

Руководство по настройке платёжной системы Prodamus для Salmina Shop.

## ✅ Что уже сделано

- ✅ Prodamus payment service создан
- ✅ Генерация платёжных ссылок при создании заказа
- ✅ Webhook handler для уведомлений об оплате
- ✅ Автоматическое обновление статуса заказа
- ✅ Интеграция с orders module
- ✅ Signature verification для безопасности

---

## 📋 Обзор интеграции

### Архитектура

```
Пользователь создаёт заказ
        ↓
Backend генерирует платёжную ссылку
        ↓
Пользователь переходит на Prodamus
        ↓
Оплачивает заказ
        ↓
Prodamus отправляет webhook
        ↓
Backend проверяет подпись
        ↓
Обновляет статус заказа
        ↓
Отправляет уведомление клиенту
```

### Основные компоненты

1. **Payment Service** (`prodamus.service.ts`)
   - Генерация платёжных ссылок
   - Проверка подписи webhook
   - Парсинг данных платежа

2. **Webhook Handler** (`webhooks.controller.ts`)
   - Приём уведомлений от Prodamus
   - Валидация подписи
   - Обновление статуса заказа

3. **Orders Module** (обновлён)
   - Генерация paymentUrl при создании заказа
   - Метод confirmPayment для обработки оплаты

---

## 🔧 Настройка

### 1. Регистрация в Prodamus

1. Зарегистрируйтесь на [prodamus.ru](https://prodamus.ru)
2. Подпишите договор
3. Получите доступ к личному кабинету
4. Создайте платёжную форму

### 2. Получение данных из Prodamus

В личном кабинете Prodamus:

1. **URL платёжной формы**:
   - Перейдите в настройки формы
   - Скопируйте URL (например: `https://yourshop.payform.ru`)

2. **Секретный ключ**:
   - Настройки → Внизу страницы
   - Скопируйте Secret Key

3. **Настройка URL для уведомлений**:
   - Настройки → URL для уведомлений
   - Укажите: `https://app.salminashop.ru/webhooks/prodamus`

### 3. Конфигурация Backend

**Локальная разработка:**

Отредактируйте `apps/backend/.env`:

```env
# Prodamus Payment Gateway (для разработки используется demo)
PRODAMUS_PAYMENT_FORM_URL="https://demo.payform.ru"
PRODAMUS_SECRET_KEY="2y2aw4oknnke80bp1a8fniwuuq7tdkwmmuq7vwi4nzbr8z1182ftbn6p8mhw3bhz"

# URLs для редиректов
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:3001"
```

**Production сервер:**

```bash
ssh root@91.229.11.132
nano /var/www/telegram-shop/apps/backend/.env
```

Добавьте/обновите:

```env
# Prodamus Payment Gateway (PRODUCTION)
PRODAMUS_PAYMENT_FORM_URL="https://yourshop.payform.ru"  # Ваш URL от Prodamus
PRODAMUS_SECRET_KEY="your_secret_key_here"               # Ваш секретный ключ

# URLs для редиректов
FRONTEND_URL="https://salminashop.ru"
API_URL="https://app.salminashop.ru"
```

### 4. Деплой изменений

**Автоматический деплой (рекомендуется):**

```bash
git add .
git commit -m "feat: add Prodamus payment integration"
git push origin main
```

GitHub Actions автоматически задеплоит изменения на сервер.

**Ручной деплой:**

```bash
ssh root@91.229.11.132
cd /var/www/telegram-shop
git pull origin main
cd apps/backend
pnpm install
pnpm build
pm2 restart telegram-shop-backend
```

---

## 🧪 Тестирование

### 1. Локальное тестирование (demo режим)

Demo режим уже настроен в `.env` файле:

```env
PRODAMUS_PAYMENT_FORM_URL="https://demo.payform.ru"
PRODAMUS_SECRET_KEY="2y2aw4oknnke80bp1a8fniwuuq7tdkwmmuq7vwi4nzbr8z1182ftbn6p8mhw3bhz"
```

**Тестовая карта:**

- Номер: `4111 1111 1111 1111`
- Срок: любая будущая дата
- CVV: любой 3-значный код

### 2. Проверка генерации платёжной ссылки

1. Запустите backend: `pnpm dev:backend`
2. Создайте заказ через API с методом оплаты `ONLINE`
3. В ответе должно быть поле `paymentUrl`

**Пример запроса:**

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName": "Иван Иванов",
    "customerPhone": "+79991234567",
    "customerEmail": "test@example.com",
    "customerAddress": "Москва, ул. Тестовая, д. 1",
    "paymentMethod": "ONLINE"
  }'
```

**Ожидаемый ответ:**

```json
{
  "id": "...",
  "orderNumber": "ORD-12345678-9012",
  "paymentUrl": "https://demo.payform.ru?order_id=ORD-12345678-9012&...",
  ...
}
```

### 3. Тестирование webhook

Для тестирования webhook локально используйте ngrok:

```bash
# Установите ngrok
brew install ngrok

# Запустите туннель
ngrok http 3001

# Используйте полученный URL в настройках Prodamus
# Например: https://abcd-1234.ngrok.io/webhooks/prodamus
```

---

## 📊 Как работает оплата

### Сценарий 1: Успешная оплата

1. **Создание заказа**:
   ```
   POST /api/orders
   paymentMethod: "ONLINE"
   ```

2. **Генерация платёжной ссылки**:
   ```javascript
   paymentUrl: "https://demo.payform.ru?order_id=ORD-XXX&..."
   ```

3. **Frontend перенаправляет** пользователя на `paymentUrl`

4. **Пользователь оплачивает** на странице Prodamus

5. **Prodamus отправляет webhook**:
   ```
   POST /webhooks/prodamus
   {
     order_num: "ORD-12345678-9012",
     payment_status: "success",
     sum: "2500.00",
     sign: "abc123..."
   }
   ```

6. **Backend обрабатывает webhook**:
   - Проверяет подпись
   - Обновляет статус оплаты: `PENDING → PAID`
   - Устанавливает `paidAt` = текущее время
   - Отправляет уведомление клиенту в Telegram

7. **Prodamus перенаправляет** пользователя:
   - Успех: `https://salminashop.ru/orders/{orderId}?payment=success`
   - Ошибка: `https://salminashop.ru/orders/{orderId}?payment=failed`

### Сценарий 2: Отмена оплаты

1. Пользователь закрывает страницу оплаты
2. Prodamus перенаправляет на `failUrl`
3. Заказ остаётся в статусе `PENDING`
4. Пользователь может повторить оплату позже

---

## 🔒 Безопасность

### Проверка подписи webhook

Все webhook от Prodamus содержат поле `sign` с HMAC SHA256 подписью.

Backend автоматически проверяет подпись:

```typescript
const isValid = prodamusService.verifyWebhookSignature(webhookData);

if (!isValid) {
  // Отклоняем webhook
  return res.status(403).json({ error: 'Invalid signature' });
}
```

**Алгоритм проверки:**

1. Удалить поле `sign` из данных
2. Отсортировать ключи alphabetically
3. Создать строку: `key1:value1;key2:value2;...`
4. Вычислить HMAC SHA256 с секретным ключом
5. Сравнить с полученной подписью (constant-time)

### Рекомендации

- ✅ Используйте HTTPS для production
- ✅ Храните секретный ключ в переменных окружения
- ✅ Никогда не коммитьте `.env` файл в git
- ✅ Используйте разные ключи для dev/production
- ✅ Логируйте все webhook запросы
- ✅ Используйте constant-time comparison для подписей

---

## 📝 API Reference

### Создание заказа с онлайн оплатой

**Endpoint:** `POST /api/orders`

**Request:**

```json
{
  "customerName": "Иван Иванов",
  "customerPhone": "+79991234567",
  "customerEmail": "ivan@example.com",
  "customerAddress": "Москва, ул. Примерная, д. 1",
  "comment": "Позвоните перед доставкой",
  "paymentMethod": "ONLINE",
  "promocodeCode": "SALE10"
}
```

**Response (200 OK):**

```json
{
  "id": "clx123abc...",
  "orderNumber": "ORD-12345678-9012",
  "status": "PAID",
  "paymentStatus": "PENDING",
  "paymentUrl": "https://yourshop.payform.ru?order_id=ORD-12345678-9012&...",
  "total": 2500,
  "items": [...],
  "createdAt": "2024-11-16T10:00:00Z"
}
```

### Webhook от Prodamus

**Endpoint:** `POST /webhooks/prodamus`

**Request Body (от Prodamus):**

```json
{
  "date": "2024-11-16 10:05:00",
  "order_id": "internal_id",
  "order_num": "ORD-12345678-9012",
  "domain": "yourshop.payform.ru",
  "sum": "2500.00",
  "customer_phone": "+79991234567",
  "customer_email": "ivan@example.com",
  "payment_type": "card",
  "payment_status": "success",
  "payment_status_description": "Успешная оплата",
  "currency": "rub",
  "products": "[{\"name\":\"Товар 1\",\"price\":1500,\"quantity\":1}]",
  "sign": "abc123def456..."
}
```

**Response:**

```
200 OK
```

---

## 🐛 Troubleshooting

### Платёжная ссылка не генерируется

**Проблема:** `paymentUrl` отсутствует в ответе API

**Решение:**

1. Проверьте `.env` переменные:
   ```bash
   echo $PRODAMUS_PAYMENT_FORM_URL
   echo $PRODAMUS_SECRET_KEY
   ```

2. Проверьте логи:
   ```bash
   pm2 logs telegram-shop-backend | grep -i prodamus
   ```

3. Убедитесь что `paymentMethod === "ONLINE"`

### Webhook не приходит

**Проблема:** Backend не получает уведомления от Prodamus

**Решение:**

1. Проверьте URL в настройках Prodamus:
   - Должен быть: `https://app.salminashop.ru/webhooks/prodamus`
   - SSL сертификат должен быть валидным

2. Проверьте что маршрут работает:
   ```bash
   curl -X POST https://app.salminashop.ru/webhooks/prodamus \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. Проверьте логи webhook:
   ```bash
   pm2 logs telegram-shop-backend | grep -i webhook
   ```

### Invalid signature error

**Проблема:** Webhook отклоняется из-за неверной подписи

**Решение:**

1. Проверьте что используете правильный `PRODAMUS_SECRET_KEY`

2. Убедитесь что данные не изменяются по пути (middleware)

3. Проверьте что Content-Type: `application/json` или `multipart/form-data`

4. Посмотрите логи с полными данными webhook

### Заказ не обновляется после оплаты

**Проблема:** `paymentStatus` остаётся `PENDING` после оплаты

**Решение:**

1. Проверьте что webhook приходит (см. выше)

2. Проверьте логи обработки webhook:
   ```bash
   pm2 logs | grep "Payment confirmed"
   ```

3. Проверьте что `order_num` в webhook совпадает с `orderNumber` в БД

---

## 📊 Мониторинг

### Логирование

Все операции с платежами логируются:

```bash
# Все логи Prodamus
pm2 logs telegram-shop-backend | grep -i prodamus

# Генерация платёжных ссылок
pm2 logs | grep "Payment link generated"

# Webhook запросы
pm2 logs | grep "Received Prodamus webhook"

# Подтверждение оплаты
pm2 logs | grep "Payment confirmed"

# Ошибки подписи
pm2 logs | grep "Invalid webhook signature"
```

### Проверка статуса заказов

```sql
-- Заказы ожидающие оплату
SELECT order_number, created_at, total
FROM orders
WHERE payment_status = 'PENDING'
ORDER BY created_at DESC;

-- Успешно оплаченные заказы
SELECT order_number, paid_at, total
FROM orders
WHERE payment_status = 'PAID'
ORDER BY paid_at DESC
LIMIT 10;
```

---

## 🔄 Переход с demo на production

### Когда готовы к production:

1. **Получите production данные от Prodamus**:
   - Реальный URL платёжной формы
   - Реальный секретный ключ

2. **Обновите .env на сервере**:
   ```bash
   ssh root@91.229.11.132
   nano /var/www/telegram-shop/apps/backend/.env
   ```

3. **Замените demo значения**:
   ```env
   PRODAMUS_PAYMENT_FORM_URL="https://yourshop.payform.ru"
   PRODAMUS_SECRET_KEY="your_production_secret_key"
   ```

4. **Перезапустите backend**:
   ```bash
   pm2 restart telegram-shop-backend
   pm2 save
   ```

5. **Проверьте настройки в Prodamus**:
   - URL для уведомлений: `https://app.salminashop.ru/webhooks/prodamus`
   - SSL: должен быть валидный сертификат ✅
   - HTTP метод: POST ✅

6. **Сделайте тестовый платёж** с реальной картой

---

## 📚 Дополнительные ресурсы

- [Prodamus API Documentation](https://help.prodamus.ru/payform/integracii/rest-api)
- [Формирование ссылки на оплату](https://help.prodamus.ru/payform/integracii/tekhnicheskaya-dokumentaciya-po-avtoplatezham/formirovanie-ssylki-na-oplatu)
- [Уведомления об оплате](https://help.prodamus.ru/payform/uvedomleniya/kak-ustroena-otpravka-uvedomlenii-ob-oplate)
- [Где найти секретный ключ](https://help.prodamus.ru/payform/integracii/rest-api/url-dlya-uvedomlenii-i-sekretnyi-klyuch)

---

## ✅ Чеклист готовности к production

- [ ] Получены production данные от Prodamus
- [ ] Обновлены переменные окружения на сервере
- [ ] URL для webhook настроен в Prodamus
- [ ] SSL сертификат валиден
- [ ] Тестовый платёж успешно прошёл
- [ ] Webhook приходит и обрабатывается
- [ ] Статус заказа обновляется после оплаты
- [ ] Клиент получает уведомление в Telegram
- [ ] Логирование работает корректно
- [ ] Мониторинг настроен

---

**Status:** ✅ Prodamus payment integration ready for deployment

**Next Steps:** Frontend integration (отображение paymentUrl, редирект на оплату)

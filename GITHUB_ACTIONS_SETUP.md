# 🚀 GitHub Actions Auto-Deploy Setup

Автоматический деплой на production сервер при каждом push в main.

## 📋 Что это даёт

- ✅ **Автоматический деплой** при каждом push в `main`
- ✅ **Ручной запуск** через GitHub UI (workflow_dispatch)
- ✅ **Проверка здоровья** после деплоя
- ✅ **Уведомления** о статусе деплоя

## 🔐 Настройка GitHub Secrets

### Шаг 1: Создайте SSH ключ на сервере

```bash
# Подключитесь к серверу
ssh root@91.229.11.132

# Создайте SSH ключ для GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@salminashop.ru" -f ~/.ssh/github_actions_deploy

# НЕ вводите passphrase (просто нажмите Enter 2 раза)

# Добавьте публичный ключ в authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Выведите приватный ключ (скопируйте ВСЁ, включая BEGIN и END)
cat ~/.ssh/github_actions_deploy
```

Скопируйте **весь вывод** (включая `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`).

### Шаг 2: Добавьте Secrets в GitHub

1. Откройте ваш репозиторий: https://github.com/Psayha/salmina
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret** и добавьте:

#### Secret 1: `VPS_HOST`
```
91.229.11.132
```

#### Secret 2: `VPS_USERNAME`
```
root
```

#### Secret 3: `VPS_SSH_KEY`
Вставьте **весь приватный ключ** из шага 1:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
... (весь ключ)
-----END OPENSSH PRIVATE KEY-----
```

### Шаг 3: Проверьте права доступа на сервере

```bash
# На сервере
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions_deploy
chmod 644 ~/.ssh/github_actions_deploy.pub
```

## ✅ Тестирование

### 1. Тест локально

Проверьте что можно подключиться с ключом:

```bash
# Из локальной машины (скопируйте ключ с сервера)
ssh -i /path/to/github_actions_deploy root@91.229.11.132 "echo 'SSH works!'"
```

### 2. Тест через GitHub Actions

```bash
# Сделайте тестовый коммит
git add .github/workflows/deploy-production.yml
git commit -m "feat: add auto-deploy workflow"
git push origin main

# Проверьте статус:
# https://github.com/Psayha/salmina/actions
```

### 3. Ручной запуск

1. Перейдите: https://github.com/Psayha/salmina/actions
2. Выберите **Deploy to Production**
3. Нажмите **Run workflow** → **Run workflow**

## 🔄 Как работает автодеплой

```mermaid
graph LR
    A[Push to main] --> B[GitHub Actions]
    B --> C[SSH to VPS]
    C --> D[git pull]
    D --> E[pnpm install]
    E --> F[pnpm build]
    F --> G[pm2 restart]
    G --> H[Health check]
    H --> I[✅ Success]
```

### Процесс деплоя:

1. **Checkout code** - получает последний код
2. **SSH to VPS** - подключается к серверу
3. **git pull** - подтягивает изменения
4. **pnpm install** - устанавливает зависимости
5. **pnpm build** - собирает backend и frontend
6. **pm2 restart** - перезапускает сервисы
7. **Health check** - проверяет что всё работает

### Что происходит при каждом push:

```bash
cd /var/www/telegram-shop
git pull origin main
pnpm install --frozen-lockfile
cd apps/backend && pnpm build
cd apps/frontend && pnpm build
pm2 restart telegram-shop-backend
pm2 restart telegram-shop-frontend
pm2 save
```

## 📊 Мониторинг деплоя

### GitHub Actions UI

Смотрите статус здесь:
```
https://github.com/Psayha/salmina/actions
```

### Логи на сервере

```bash
# Логи PM2
pm2 logs telegram-shop-backend --lines 50
pm2 logs telegram-shop-frontend --lines 50

# Статус
pm2 status

# История перезапусков
pm2 list
```

## 🐛 Troubleshooting

### Ошибка: Permission denied (publickey)

```bash
# На сервере проверьте:
cat ~/.ssh/authorized_keys | grep github-actions

# Права должны быть:
ls -la ~/.ssh/
# drwx------ (700) для .ssh/
# -rw------- (600) для authorized_keys
```

### Ошибка: Host key verification failed

Добавьте в `.github/workflows/deploy-production.yml`:

```yaml
script_stop: true
```

### Деплой завис

```bash
# На сервере проверьте процессы
pm2 list

# Перезапустите вручную
pm2 restart all
pm2 save
```

### Backend не запускается после деплоя

```bash
# Проверьте логи
pm2 logs telegram-shop-backend --lines 100

# Проверьте сборку
cd /var/www/telegram-shop/apps/backend
pnpm build

# Проверьте .env
cat .env
```

## 🔒 Безопасность

### Рекомендации:

1. ✅ **Не коммитьте** приватный SSH ключ в репозиторий
2. ✅ **Используйте Secrets** для всех чувствительных данных
3. ✅ **Ограничьте доступ** к SSH ключу только для GitHub Actions
4. ✅ **Регулярно ротируйте** SSH ключи
5. ✅ **Используйте отдельного пользователя** (не root) для деплоя

### Создание отдельного пользователя (рекомендуется):

```bash
# На сервере
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# Настройте SSH для deploy
su - deploy
ssh-keygen -t ed25519 -C "github-actions-deploy"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys

# Дайте права на /var/www/telegram-shop
chown -R deploy:deploy /var/www/telegram-shop

# Обновите GitHub Secret VPS_USERNAME на "deploy"
```

## 🎯 Дополнительные возможности

### Деплой только backend

Создайте `.github/workflows/deploy-backend.yml`:

```yaml
on:
  push:
    paths:
      - 'apps/backend/**'
```

### Уведомления в Telegram

Добавьте в конец workflow:

```yaml
- name: Send Telegram notification
  if: success()
  run: |
    curl -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
      -d chat_id="${{ secrets.TELEGRAM_ADMIN_CHAT_ID }}" \
      -d text="✅ Deployment successful! ${{ github.event.head_commit.message }}"
```

### Откат при ошибке

```yaml
- name: Rollback on failure
  if: failure()
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USERNAME }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      cd /var/www/telegram-shop
      git reset --hard HEAD~1
      pm2 restart all
```

## 📝 Checklist

- [ ] SSH ключ создан на сервере
- [ ] Публичный ключ добавлен в `authorized_keys`
- [ ] Приватный ключ добавлен в GitHub Secrets (`VPS_SSH_KEY`)
- [ ] `VPS_HOST` добавлен в GitHub Secrets
- [ ] `VPS_USERNAME` добавлен в GitHub Secrets
- [ ] Права на `.ssh` настроены правильно
- [ ] Тестовый коммит запустил деплой
- [ ] Health check прошёл успешно
- [ ] Frontend доступен (https://salminashop.ru)
- [ ] Backend доступен (https://app.salminashop.ru/health)

---

**Status:** ✅ Auto-deploy ready!

**Next:** Просто делайте `git push origin main` и всё задеплоится автоматически! 🚀

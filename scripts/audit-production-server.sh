#!/bin/bash

# ============================================
# Production Server Audit Script
# ============================================
# Проверяет состояние production сервера
# и выявляет потенциальные проблемы

set -e

echo "🔍 АУДИТ PRODUCTION СЕРВЕРА"
echo "==========================================="
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

# 1. СИСТЕМНАЯ ИНФОРМАЦИЯ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. СИСТЕМНАЯ ИНФОРМАЦИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 OS Version:"
cat /etc/os-release | grep PRETTY_NAME
echo ""

echo "💾 Disk Space:"
df -h / | tail -1
echo ""

echo "🧠 Memory Usage:"
free -h | grep Mem
echo ""

echo "⚙️ CPU Info:"
lscpu | grep "Model name"
lscpu | grep "CPU(s):"
echo ""

# 2. УСТАНОВЛЕННОЕ ПО
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. УСТАНОВЛЕННОЕ ПО"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 Node.js:"
if command -v node &> /dev/null; then
    node --version
    check "Node.js установлен"
else
    echo -e "${RED}✗ Node.js НЕ установлен${NC}"
fi
echo ""

echo "📦 pnpm:"
if command -v pnpm &> /dev/null; then
    pnpm --version
    check "pnpm установлен"
else
    echo -e "${RED}✗ pnpm НЕ установлен${NC}"
fi
echo ""

echo "📦 PM2:"
if command -v pm2 &> /dev/null; then
    pm2 --version
    check "PM2 установлен"
else
    echo -e "${RED}✗ PM2 НЕ установлен${NC}"
fi
echo ""

echo "📦 PostgreSQL:"
if command -v psql &> /dev/null; then
    psql --version
    check "PostgreSQL установлен"
else
    echo -e "${RED}✗ PostgreSQL НЕ установлен${NC}"
fi
echo ""

echo "📦 Redis:"
if command -v redis-cli &> /dev/null; then
    redis-cli --version
    check "Redis установлен"
else
    echo -e "${RED}✗ Redis НЕ установлен${NC}"
fi
echo ""

echo "📦 Nginx:"
if command -v nginx &> /dev/null; then
    nginx -v 2>&1
    check "Nginx установлен"
else
    echo -e "${RED}✗ Nginx НЕ установлен${NC}"
fi
echo ""

# 3. СТРУКТУРА ПРОЕКТА
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. СТРУКТУРА ПРОЕКТА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PROJECT_DIR="/var/www/telegram-shop"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✓${NC} Проект найден: $PROJECT_DIR"
    echo ""

    echo "📂 Структура каталогов:"
    cd "$PROJECT_DIR"
    ls -la | head -20
    echo ""

    echo "📄 Git информация:"
    git branch --show-current
    git log --oneline -5
    echo ""

    echo "📦 Package versions:"
    if [ -f "package.json" ]; then
        cat package.json | grep '"version"' | head -1
    fi
    echo ""

    echo "🔧 node_modules:"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓${NC} node_modules существует"
        du -sh node_modules
    else
        echo -e "${RED}✗${NC} node_modules отсутствует"
    fi
    echo ""

    echo "🗂️ Apps:"
    if [ -d "apps/backend/dist" ]; then
        echo -e "${GREEN}✓${NC} Backend build существует"
        ls -lh apps/backend/dist | head -5
    else
        echo -e "${RED}✗${NC} Backend build отсутствует"
    fi

    if [ -d "apps/frontend/.next" ]; then
        echo -e "${GREEN}✓${NC} Frontend build существует"
        ls -lh apps/frontend/.next | head -5
    else
        echo -e "${RED}✗${NC} Frontend build отсутствует"
    fi
    echo ""

else
    echo -e "${RED}✗${NC} Проект НЕ найден: $PROJECT_DIR"
fi
echo ""

# 4. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "$PROJECT_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC} .env файл существует"
    echo ""
    echo "🔑 Основные переменные (маскированные):"

    # Проверяем наличие важных переменных (без вывода значений)
    vars=(
        "NODE_ENV"
        "PORT"
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "TELEGRAM_BOT_TOKEN"
        "REDIS_URL"
    )

    for var in "${vars[@]}"; do
        if grep -q "^$var=" "$PROJECT_DIR/.env"; then
            echo -e "${GREEN}✓${NC} $var установлена"
        else
            echo -e "${RED}✗${NC} $var отсутствует"
        fi
    done
    echo ""
else
    echo -e "${RED}✗${NC} .env файл отсутствует"
fi
echo ""

# 5. PM2 ПРОЦЕССЫ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. PM2 ПРОЦЕССЫ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v pm2 &> /dev/null; then
    echo "📊 PM2 Status:"
    pm2 list
    echo ""

    echo "📊 PM2 Logs (last 20 lines):"
    pm2 logs --lines 20 --nostream
    echo ""

    echo "💾 PM2 Memory Usage:"
    pm2 describe telegram-shop-backend 2>/dev/null | grep -E "(memory|cpu|uptime|restarts)" || echo "Backend process not found"
    pm2 describe telegram-shop-frontend 2>/dev/null | grep -E "(memory|cpu|uptime|restarts)" || echo "Frontend process not found"
    echo ""
else
    echo -e "${RED}✗${NC} PM2 не установлен"
fi
echo ""

# 6. СЕРВИСЫ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. СТАТУС СЕРВИСОВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🗄️ PostgreSQL:"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓${NC} PostgreSQL активен"
    sudo systemctl status postgresql --no-pager | head -10
else
    echo -e "${RED}✗${NC} PostgreSQL не активен"
fi
echo ""

echo "⚡ Redis:"
if systemctl is-active --quiet redis || systemctl is-active --quiet redis-server; then
    echo -e "${GREEN}✓${NC} Redis активен"
    redis-cli ping 2>/dev/null || echo "Не удалось подключиться к Redis"
else
    echo -e "${RED}✗${NC} Redis не активен"
fi
echo ""

echo "🌐 Nginx:"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx активен"
    sudo nginx -t
else
    echo -e "${RED}✗${NC} Nginx не активен"
fi
echo ""

# 7. NGINX КОНФИГУРАЦИЯ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. NGINX КОНФИГУРАЦИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NGINX_CONF="/etc/nginx/sites-enabled/telegram-shop"
if [ -f "$NGINX_CONF" ]; then
    echo -e "${GREEN}✓${NC} Nginx конфиг найден"
    echo ""
    echo "📄 Основные настройки:"
    grep -E "(server_name|listen|proxy_pass|root)" "$NGINX_CONF" | head -20
    echo ""
else
    echo -e "${RED}✗${NC} Nginx конфиг не найден: $NGINX_CONF"
    echo ""
    echo "Доступные конфиги:"
    ls -la /etc/nginx/sites-enabled/
fi
echo ""

# 8. БАЗА ДАННЫХ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. БАЗА ДАННЫХ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "$PROJECT_DIR/.env" ]; then
    DB_URL=$(grep "^DATABASE_URL=" "$PROJECT_DIR/.env" | cut -d '=' -f2)

    if [ ! -z "$DB_URL" ]; then
        echo "🔗 Database URL найден"

        # Попытка подключения к БД
        if command -v psql &> /dev/null; then
            echo ""
            echo "📊 Prisma migrations:"
            cd "$PROJECT_DIR/apps/backend"
            if [ -d "prisma/migrations" ]; then
                ls -la prisma/migrations | tail -10
                echo ""
                echo -e "${GREEN}✓${NC} Migrations folder существует"
            else
                echo -e "${RED}✗${NC} Migrations folder отсутствует"
            fi
        fi
    else
        echo -e "${RED}✗${NC} DATABASE_URL не найден в .env"
    fi
else
    echo -e "${RED}✗${NC} .env файл отсутствует"
fi
echo ""

# 9. SSL СЕРТИФИКАТЫ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. SSL СЕРТИФИКАТЫ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "/etc/letsencrypt/live" ]; then
    echo "🔒 Let's Encrypt сертификаты:"
    sudo ls -la /etc/letsencrypt/live/
    echo ""

    # Проверяем срок действия
    if command -v certbot &> /dev/null; then
        echo "📅 Срок действия сертификатов:"
        sudo certbot certificates 2>/dev/null || echo "Не удалось получить информацию о сертификатах"
    fi
else
    echo -e "${RED}✗${NC} SSL сертификаты не найдены"
fi
echo ""

# 10. ЛОГИ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. ПОСЛЕДНИЕ ЛОГИ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Nginx Error Log (last 10):"
if [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -10 /var/log/nginx/error.log
else
    echo "Лог не найден"
fi
echo ""

echo "📋 Nginx Access Log (last 10):"
if [ -f "/var/log/nginx/access.log" ]; then
    sudo tail -10 /var/log/nginx/access.log
else
    echo "Лог не найден"
fi
echo ""

# 11. СЕТЕВЫЕ ПОДКЛЮЧЕНИЯ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "11. СЕТЕВЫЕ ПОДКЛЮЧЕНИЯ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🌐 Открытые порты:"
sudo netstat -tulpn | grep LISTEN | grep -E "(3000|3001|5432|6379|80|443)"
echo ""

echo "🔗 Активные соединения:"
sudo ss -s
echo ""

# 12. ПРОВЕРКА ДОСТУПНОСТИ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "12. ПРОВЕРКА ДОСТУПНОСТИ СЕРВИСОВ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🌐 Frontend (salminashop.ru):"
curl -s -o /dev/null -w "%{http_code}\n" https://salminashop.ru || echo "Недоступен"
echo ""

echo "🌐 Backend (app.salminashop.ru/health):"
curl -s -o /dev/null -w "%{http_code}\n" https://app.salminashop.ru/health || echo "Недоступен"
echo ""

# ИТОГ
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ АУДИТ ЗАВЕРШЕН"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Сохраните результаты в файл:"
echo "bash audit-production-server.sh > audit-report.txt 2>&1"
echo ""

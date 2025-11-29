#!/bin/bash
# Автоматический бэкап через API
curl -s -X POST http://localhost:3001/api/backups \
  -H "Authorization: Bearer $(cat /var/www/telegram-shop/admin-token.txt)" \
  -H "Content-Type: application/json"

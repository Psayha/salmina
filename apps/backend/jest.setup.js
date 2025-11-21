// Jest setup file
// Запускается перед каждым тестом

// Настройка переменных окружения для тестов
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.TELEGRAM_BOT_TOKEN = 'test-telegram-bot-token';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PRODAMUS_PAYMENT_FORM_URL = 'https://demo.payform.ru';
process.env.PRODAMUS_SECRET_KEY = 'test-secret-key';

'use client';

import { useRouter } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function SupportPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  const contactOptions = [
    {
      icon: '💬',
      title: 'Написать в Telegram',
      description: 'Свяжитесь с нами напрямую',
      action: () => {
        haptic?.impactOccurred('medium');
        // Open Telegram chat - replace with actual bot/support username
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.openTelegramLink?.('https://t.me/support');
        }
      },
    },
    {
      icon: '📧',
      title: 'Email поддержка',
      description: 'support@salminashop.ru',
      action: () => {
        haptic?.impactOccurred('light');
        window.location.href = 'mailto:support@salminashop.ru';
      },
    },
    {
      icon: '📱',
      title: 'Телефон',
      description: '+7 (999) 123-45-67',
      action: () => {
        haptic?.impactOccurred('light');
        window.location.href = 'tel:+79991234567';
      },
    },
  ];

  const faqItems = [
    {
      question: 'Как оформить заказ?',
      answer:
        'Выберите товары, добавьте их в корзину и перейдите к оформлению. Укажите контактные данные и адрес доставки.',
    },
    {
      question: 'Какие способы оплаты доступны?',
      answer: 'Мы принимаем оплату картой онлайн, СБП, ЮMoney и наличными при получении.',
    },
    {
      question: 'Сколько стоит доставка?',
      answer:
        'Стоимость доставки зависит от вашего города и выбранного способа. Уточняйте при оформлении заказа.',
    },
    {
      question: 'Как отследить заказ?',
      answer: 'Статус заказа можно посмотреть в разделе "Мои заказы" в вашем профиле.',
    },
    {
      question: 'Можно ли вернуть товар?',
      answer:
        'Да, вы можете вернуть товар в течение 14 дней с момента получения. Условия возврата описаны в политике возврата.',
    },
  ];

  useTelegramBackButton(() => {
    router.back();
  });

  return (
    <div className="min-h-screen relative z-10 pb-8">
      {/* Header */}
      <div className="sticky top-24 z-40 bg-white/60 dark:bg-white/10 backdrop-blur-md border-b border-white/30 dark:border-white/10 shadow-lg">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Поддержка</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Contact Options */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">
            Связаться с нами
          </h2>

          <div className="space-y-3">
            {contactOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                className="w-full flex items-start gap-4 p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 text-left"
              >
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <p className="text-base font-light text-gray-900 dark:text-white mb-1">{option.title}</p>
                  <p className="text-xs font-light text-gray-600 dark:text-gray-400">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">
            Часто задаваемые вопросы
          </h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="group bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10 overflow-hidden"
              >
                <summary className="cursor-pointer p-4 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300 list-none">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-light text-gray-900 dark:text-white">{item.question}</p>
                    <span className="text-gray-600 dark:text-gray-400 group-open:rotate-180 transition-transform duration-300">
                      ▼
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-sm font-light text-gray-700 dark:text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Help Resources */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">
            Полезные ссылки
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                haptic?.impactOccurred('light');
                router.push('/legal');
              }}
              className="w-full text-left p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300"
            >
              <p className="text-base font-light text-gray-900 dark:text-white mb-1">Юридические документы</p>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400">Политика конфиденциальности и условия</p>
            </button>

            <button
              onClick={() => {
                haptic?.impactOccurred('light');
                // Navigate to delivery info page or show modal
                alert('Информация о доставке и оплате');
              }}
              className="w-full text-left p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300"
            >
              <p className="text-base font-light text-gray-900 dark:text-white mb-1">Доставка и оплата</p>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400">Способы доставки и оплаты</p>
            </button>

            <button
              onClick={() => {
                haptic?.impactOccurred('light');
                // Navigate to return policy or show modal
                alert('Условия возврата товара');
              }}
              className="w-full text-left p-4 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300"
            >
              <p className="text-base font-light text-gray-900 dark:text-white mb-1">Возврат товара</p>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400">Политика возврата и обмена</p>
            </button>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg text-center">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3">
            Режим работы поддержки
          </h2>
          <p className="text-base font-light text-gray-900 dark:text-white mb-1">Пн-Пт: 9:00 - 21:00</p>
          <p className="text-base font-light text-gray-900 dark:text-white mb-1">Сб-Вс: 10:00 - 18:00</p>
          <p className="text-xs font-light text-gray-600 dark:text-gray-400 mt-3">Московское время (UTC+3)</p>
        </div>
      </div>
    </div>
  );
}

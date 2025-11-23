'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function SettingsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  const [settings, setSettings] = useState({
    orderNotifications: true,
    promotionNotifications: true,
    emailNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  useTelegramBackButton(() => {
    router.back();
  });

  const handleToggle = (key: keyof typeof settings) => {
    haptic.impactOccurred('light');
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingSections = [
    {
      title: 'Уведомления',
      items: [
        {
          key: 'orderNotifications' as const,
          label: 'Уведомления о заказах',
          description: 'Получать уведомления о статусе заказа',
        },
        {
          key: 'promotionNotifications' as const,
          label: 'Акции и предложения',
          description: 'Получать информацию о новых акциях',
        },
        {
          key: 'emailNotifications' as const,
          label: 'Email уведомления',
          description: 'Дублировать уведомления на email',
        },
      ],
    },
    {
      title: 'Интерфейс',
      items: [
        {
          key: 'soundEnabled' as const,
          label: 'Звуковые эффекты',
          description: 'Воспроизводить звуки при действиях',
        },
        {
          key: 'vibrationEnabled' as const,
          label: 'Вибрация',
          description: 'Тактильная отдача при нажатиях',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-light text-gray-900">Настройки</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg space-y-4"
          >
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-white/20 last:border-0"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-base font-light text-gray-900 mb-1">{item.label}</p>
                    <p className="text-xs font-light text-gray-600">{item.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                      settings[item.key] ? 'bg-green-500/60' : 'bg-gray-300/60'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Additional Settings */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
          <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 mb-4">
            Дополнительно
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                haptic.impactOccurred('medium');
                // Clear cache functionality can be implemented here
                alert('Кэш очищен');
              }}
              className="w-full text-left p-4 bg-white/30 backdrop-blur-md rounded-xl border border-white/30 hover:bg-white/40 transition-all duration-300"
            >
              <p className="text-base font-light text-gray-900 mb-1">Очистить кэш</p>
              <p className="text-xs font-light text-gray-600">Удалить временные файлы</p>
            </button>

            <button
              onClick={() => {
                haptic.impactOccurred('light');
                router.push('/legal');
              }}
              className="w-full text-left p-4 bg-white/30 backdrop-blur-md rounded-xl border border-white/30 hover:bg-white/40 transition-all duration-300"
            >
              <p className="text-base font-light text-gray-900 mb-1">Юридические документы</p>
              <p className="text-xs font-light text-gray-600">Политика и условия</p>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg text-center">
          <p className="text-sm font-light text-gray-700 mb-2">Telegram Shop</p>
          <p className="text-xs font-light text-gray-500">Версия 1.1.0</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

const SETTINGS_STORAGE_KEY = 'app-settings';

interface Settings {
  orderNotifications: boolean;
  promotionNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const defaultSettings: Settings = {
  orderNotifications: true,
  promotionNotifications: true,
  emailNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useTelegramBackButton(() => {
    router.back();
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const handleToggle = (key: keyof Settings) => {
    haptic?.impactOccurred('light');
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
    <div className="min-h-screen relative z-10 pb-8">
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <h1 className="text-lg font-light text-gray-900 dark:text-white">Настройки</h1>
      </div>

      <div className="px-4 space-y-4">
        {settingSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg space-y-4"
          >
            <h2 className="text-sm font-light uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-4">
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-white/20 dark:border-white/10 last:border-0"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-base font-light text-gray-900 dark:text-white mb-1">{item.label}</p>
                    <p className="text-xs font-light text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                      settings[item.key] ? 'bg-green-500/60' : 'bg-gray-300/60 dark:bg-gray-600/60'
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

        {/* App Info */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg text-center">
          <p className="text-sm font-light text-gray-700 dark:text-gray-300 mb-2">Salmina</p>
          <p className="text-xs font-light text-gray-500 dark:text-gray-400">Версия 1.1.0</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import { UserIcon } from '@/components/ui/icons';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { favoriteIds } = useFavoritesStore();
  const haptic = useTelegramHaptic();

  useTelegramBackButton(() => {
    router.back();
  });

  const handleLogout = async () => {
    try {
      haptic.impactOccurred('medium');
      await logout();
      haptic.notificationOccurred('success');
      router.push('/');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error logging out:', error);
    }
  };

  const menuItems: {
    label: string;
    description: string;
    onClick: () => void;
    isAdmin?: boolean;
  }[] = [
    ...(user?.role === 'ADMIN'
      ? [
          {
            label: '⚡ Админ-панель',
            description: 'Управление магазином',
            onClick: () => {
              haptic.impactOccurred('medium');
              router.push('/admin');
            },
            isAdmin: true,
          },
        ]
      : []),
    {
      label: 'Мои заказы',
      description: 'История покупок и статусы',
      onClick: () => {
        haptic.impactOccurred('light');
        router.push('/orders');
      },
    },
    {
      label: 'Избранное',
      description: 'Сохраненные товары',
      onClick: () => {
        haptic.impactOccurred('light');
        router.push('/favorites');
      },
    },
    {
      label: 'Настройки',
      description: 'Уведомления и параметры',
      onClick: () => {
        haptic.impactOccurred('light');
        router.push('/settings');
      },
    },
    {
      label: 'Поддержка',
      description: 'Помощь и обратная связь',
      onClick: () => {
        haptic.impactOccurred('light');
        router.push('/support');
      },
    },
  ];

  return (
    <div className="min-h-screen relative z-10 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-lg">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-light text-gray-900">Профиль</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* User Info Card */}
        {isAuthenticated && user ? (
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white/50 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center">
                {user.photoUrl ? (
                  <Image
                    src={user.photoUrl || ''}
                    alt={user.firstName || 'User'}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-600" />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-light text-gray-900 mb-1">
                  {user.firstName} {user.lastName || ''}
                </h2>
                {user.username && <p className="text-sm font-light text-gray-600">@{user.username}</p>}
                {user.phoneNumber && <p className="text-sm font-light text-gray-600">{user.phoneNumber}</p>}
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 text-center">
                <p className="text-2xl font-light text-gray-900 mb-1">0</p>
                <p className="text-xs font-light text-gray-600 uppercase tracking-wide">Заказов</p>
              </div>
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-4 text-center">
                <p className="text-2xl font-light text-gray-900 mb-1">{favoriteIds.length}</p>
                <p className="text-xs font-light text-gray-600 uppercase tracking-wide">Избранное</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-lg text-center">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-lg font-light text-gray-900 mb-2">Войдите в аккаунт</h2>
            <p className="text-sm font-light text-gray-600 mb-6">Чтобы просматривать заказы и сохранять избранное</p>
            <Button onClick={() => router.push('/')}>На главную</Button>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full backdrop-blur-md rounded-2xl p-5 border shadow-lg hover:bg-white/50 transition-all duration-300 text-left ${
                item.isAdmin
                  ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  : 'bg-white/40 border-white/30'
              }`}
            >
              <p className="text-base font-light text-gray-900 mb-1">{item.label}</p>
              <p className="text-xs font-light text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Legal Links */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-lg space-y-3">
          <button onClick={() => haptic.impactOccurred('light')} className="w-full text-left">
            <p className="text-sm font-light text-gray-700 hover:text-gray-900 transition-colors">
              Политика конфиденциальности
            </p>
          </button>
          <button onClick={() => haptic.impactOccurred('light')} className="w-full text-left">
            <p className="text-sm font-light text-gray-700 hover:text-gray-900 transition-colors">
              Пользовательское соглашение
            </p>
          </button>
          <button onClick={() => haptic.impactOccurred('light')} className="w-full text-left">
            <p className="text-sm font-light text-gray-700 hover:text-gray-900 transition-colors">О приложении</p>
          </button>
        </div>

        {/* Logout Button */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30 text-sm font-light text-red-700 hover:bg-red-500/30 transition-all duration-300"
          >
            Выйти из аккаунта
          </button>
        )}

        {/* App Version */}
        <div className="text-center">
          <p className="text-xs font-light text-gray-500">Версия 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

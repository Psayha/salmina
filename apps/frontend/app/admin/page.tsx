'use client';

import { BarChart3, Package, ShoppingCart, Users, ChevronRight, FolderTree, Megaphone, Scale, Ticket, Activity, ImageIcon, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

export default function AdminDashboard() {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  // Telegram back button - возврат на главную
  useTelegramBackButton(() => {
    router.push('/');
  });

  const modules = [
    {
      title: 'Аналитика',
      description: 'Статистика и отчеты магазина',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-blue-500 to-indigo-600',
      gradient: 'from-blue-50 to-indigo-50',
    },
    {
      title: 'Товары',
      description: 'Каталог и управление товарами',
      icon: Package,
      href: '/admin/products',
      color: 'from-pink-500 to-rose-600',
      gradient: 'from-pink-50 to-rose-50',
    },
    {
      title: 'Категории',
      description: 'Управление категориями и подкатегориями',
      icon: FolderTree,
      href: '/admin/categories',
      color: 'from-orange-500 to-amber-600',
      gradient: 'from-orange-50 to-amber-50',
    },
    {
      title: 'Акции',
      description: 'Создание акций и специальных предложений',
      icon: Megaphone,
      href: '/admin/promotions',
      color: 'from-red-500 to-pink-600',
      gradient: 'from-red-50 to-pink-50',
    },
    {
      title: 'Промокоды',
      description: 'Управление промокодами и скидками',
      icon: Ticket,
      href: '/admin/promocodes',
      color: 'from-cyan-500 to-teal-600',
      gradient: 'from-cyan-50 to-teal-50',
    },
    {
      title: 'Заказы',
      description: 'Просмотр и управление заказами',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'from-purple-500 to-violet-600',
      gradient: 'from-purple-50 to-violet-50',
    },
    {
      title: 'Пользователи',
      description: 'Управление пользователями',
      icon: Users,
      href: '/admin/users',
      color: 'from-green-500 to-emerald-600',
      gradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Загруженные фото',
      description: 'Галерея изображений',
      icon: ImageIcon,
      href: '/admin/uploads',
      color: 'from-violet-500 to-purple-600',
      gradient: 'from-violet-50 to-purple-50',
    },
    {
      title: 'Юридические документы',
      description: 'Документы и правовая информация',
      icon: Scale,
      href: '/admin/legal',
      color: 'from-slate-500 to-gray-600',
      gradient: 'from-slate-50 to-gray-50',
    },
    {
      title: 'Мониторинг системы',
      description: 'Состояние системы и health checks',
      icon: Activity,
      href: '/admin/health',
      color: 'from-emerald-500 to-green-600',
      gradient: 'from-emerald-50 to-green-50',
    },
    {
      title: 'Корзина',
      description: 'Удалённые товары и категории',
      icon: Trash2,
      href: '/admin/trash',
      color: 'from-red-500 to-rose-600',
      gradient: 'from-red-50 to-rose-50',
    },
  ];

  const handleModuleClick = (href: string) => {
    haptic?.impactOccurred('medium');
    router.push(href);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Приветствие */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light text-gray-900 dark:text-white">
          Панель управления
        </h1>
        <p className="text-sm font-light text-gray-600 dark:text-gray-300">
          Выберите раздел для работы
        </p>
      </div>

      {/* Модули */}
      <div className="grid grid-cols-2 gap-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.title}
              onClick={() => handleModuleClick(module.href)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group bg-gradient-to-br ${module.gradient} dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 border border-white/50 dark:border-white/10 shadow-lg`}
            >
              {/* Фоновый градиент при ховере */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Иконка */}
              <div className="relative mb-3">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${module.color} shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Контент */}
              <div className="relative space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    {module.title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all" />
                </div>
                <p className="text-xs font-light text-gray-600 dark:text-gray-300 line-clamp-2">
                  {module.description}
                </p>
              </div>

              {/* Декоративный элемент */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 opacity-5">
                <Icon className="w-full h-full" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      <div className="text-center mt-8">
        <p className="text-xs font-light text-gray-500 dark:text-gray-400">
          Все разделы подключены к реальным данным
        </p>
      </div>
    </div>
  );
}

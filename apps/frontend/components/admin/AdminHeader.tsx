'use client';

import { useAuthStore } from '@/store/useAuthStore';

export const AdminHeader = () => {
  const { user } = useAuthStore();

  const getUserInitials = () => {
    if (!user) return 'AD';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'AD';
  };

  const getUserName = () => {
    if (!user) return 'Admin';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Admin';
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/30 dark:border-gray-700 shadow-lg flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-light text-gray-900 dark:text-white">
          <span className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent font-semibold">
            Salmina
          </span>{' '}
          Admin
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-light text-gray-900 dark:text-white">{getUserName()}</p>
          <p className="text-xs font-light text-gray-500 dark:text-gray-400">Администратор</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
            {getUserInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};

'use client';

import { Ban, CheckCircle, UserCog, Lock, Unlock, Search, FileCheck, FileX } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/endpoints/admin';
import { User } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { AdminCardGrid, CardWrapper } from '@/components/admin/AdminCardGrid';

export default function UsersPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'role' | 'block';
    user: User | null;
  }>({
    isOpen: false,
    type: 'role',
    user: null,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchData = useCallback(async () => {
    try {
      const users = await adminApi.getUsers();
      setData(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setData([]);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.telegramId?.toString().includes(query)
    );
  }, [data, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handleToggleRole = async () => {
    if (!actionModal.user) return;

    const user = actionModal.user;
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    setIsUpdating(true);
    haptic?.impactOccurred('medium');

    try {
      await adminApi.updateUserRole(user.id, newRole);
      haptic?.notificationOccurred('success');
      toast.success(newRole === 'ADMIN' ? 'Пользователь назначен администратором' : 'Права администратора сняты');
      fetchData();
      setActionModal({ isOpen: false, type: 'role', user: null });
    } catch (error) {
      console.error('Failed to update user role:', error);
      haptic?.notificationOccurred('error');
      toast.error('Ошибка при изменении роли');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!actionModal.user) return;

    const user = actionModal.user;

    setIsUpdating(true);
    haptic?.impactOccurred('medium');

    try {
      if (user.isActive) {
        await adminApi.blockUser(user.id);
        toast.success('Пользователь заблокирован');
      } else {
        await adminApi.unblockUser(user.id);
        toast.success('Пользователь разблокирован');
      }
      haptic?.notificationOccurred('success');
      fetchData();
      setActionModal({ isOpen: false, type: 'block', user: null });
    } catch (error) {
      console.error('Failed to toggle user block:', error);
      haptic?.notificationOccurred('error');
      toast.error('Ошибка при изменении статуса');
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (user: User) => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const renderUserCard = (user: User) => {
    return (
      <CardWrapper key={user.id}>
        <div className="p-3 space-y-2">
          {/* Header with Avatar */}
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm ${
                user.role === 'ADMIN'
                  ? 'bg-gradient-to-br from-purple-500 to-violet-600'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}
            >
              {getInitials(user)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {user.telegramId}
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-1">
              {/* Legal status */}
              <span title={user.hasAcceptedTerms ? 'Доки приняты' : 'Доки не приняты'}>
                {user.hasAcceptedTerms ? (
                  <FileCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FileX className="w-4 h-4 text-red-500" />
                )}
              </span>
              {/* Active status */}
              <span title={user.isActive ? 'Активен' : 'Заблокирован'}>
                {user.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Ban className="w-4 h-4 text-red-500" />
                )}
              </span>
            </div>
          </div>

          {/* Role & Date */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className={user.role === 'ADMIN' ? 'text-purple-600 dark:text-purple-400 font-medium' : ''}>
              {user.role === 'ADMIN' ? '👑 Админ' : 'Пользователь'}
            </span>
            <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                haptic?.impactOccurred('light');
                setActionModal({ isOpen: true, type: 'role', user });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/30 transition-colors text-xs font-medium"
            >
              <UserCog className="w-3.5 h-3.5" />
              {user.role === 'ADMIN' ? 'Снять' : 'Админ'}
            </button>
            <button
              onClick={() => {
                haptic?.impactOccurred('light');
                setActionModal({ isOpen: true, type: 'block', user });
              }}
              className={`py-1.5 px-2 rounded-lg transition-colors ${
                user.isActive
                  ? 'bg-red-50 dark:bg-red-500/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/30'
                  : 'bg-green-50 dark:bg-green-500/20 text-green-500 hover:bg-green-100 dark:hover:bg-green-500/30'
              }`}
              title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
            >
              {user.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </CardWrapper>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Role Modal */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === 'role'}
        onClose={() => setActionModal({ isOpen: false, type: 'role', user: null })}
        onConfirm={handleToggleRole}
        title={actionModal.user?.role === 'ADMIN' ? 'Снять права администратора?' : 'Назначить администратором?'}
        description={
          actionModal.user?.role === 'ADMIN'
            ? `Снять права администратора с ${actionModal.user?.firstName} ${actionModal.user?.lastName}?`
            : `Назначить пользователя ${actionModal.user?.firstName} ${actionModal.user?.lastName} администратором?`
        }
        confirmText={actionModal.user?.role === 'ADMIN' ? 'Снять' : 'Назначить'}
        cancelText="Отмена"
        type={actionModal.user?.role === 'ADMIN' ? 'danger' : 'info'}
        isLoading={isUpdating}
      />

      {/* Block Modal */}
      <Modal
        isOpen={actionModal.isOpen && actionModal.type === 'block'}
        onClose={() => setActionModal({ isOpen: false, type: 'block', user: null })}
        onConfirm={handleToggleBlock}
        title={actionModal.user?.isActive ? 'Заблокировать пользователя?' : 'Разблокировать пользователя?'}
        description={
          actionModal.user?.isActive
            ? `Заблокировать пользователя ${actionModal.user?.firstName} ${actionModal.user?.lastName}? Он потеряет доступ к системе.`
            : `Разблокировать пользователя ${actionModal.user?.firstName} ${actionModal.user?.lastName}?`
        }
        confirmText={actionModal.user?.isActive ? 'Заблокировать' : 'Разблокировать'}
        cancelText="Отмена"
        type={actionModal.user?.isActive ? 'danger' : 'info'}
        isLoading={isUpdating}
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Пользователи</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Управление пользователями и правами доступа ({filteredData.length} шт.)
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Поиск по имени или Telegram ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-light shadow-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <AdminCardGrid
          data={filteredData}
          renderCard={renderUserCard}
          emptyMessage="Пользователи не найдены"
          pageSize={9}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}

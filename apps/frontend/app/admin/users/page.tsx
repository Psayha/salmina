'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, Ban, CheckCircle, UserCog, Lock, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/endpoints/admin';
import { User } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'firstName',
    header: 'Имя',
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: 'telegramId',
    header: 'Telegram ID',
    cell: ({ row }) => <span className="text-gray-500 font-mono text-xs">{row.getValue('telegramId')}</span>,
  },
  {
    accessorKey: 'role',
    header: 'Роль',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <div className="flex items-center gap-1.5">
          {role === 'ADMIN' && <Shield className="w-3 h-3 text-purple-500" />}
          <span className={`text-sm ${role === 'ADMIN' ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
            {role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Статус',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {isActive ? (
            <>
              <CheckCircle className="w-3 h-3" /> Активен
            </>
          ) : (
            <>
              <Ban className="w-3 h-3" /> Заблокирован
            </>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата регистрации',
    cell: ({ row: { getValue } }) => (
      <div className="text-gray-500 text-sm">{new Date(getValue('createdAt')).toLocaleDateString('ru-RU')}</div>
    ),
  },
  {
    id: 'actions',
    header: 'Действия',
    cell: ({ row }) => {
      const [isUpdating, setIsUpdating] = useState(false);
      const haptic = useTelegramHaptic();
      const user = row.original;

      const handleToggleRole = async () => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        const confirmMessage = newRole === 'ADMIN'
          ? `Назначить пользователя ${user.firstName} ${user.lastName} администратором?`
          : `Снять права администратора с ${user.firstName} ${user.lastName}?`;

        if (!confirm(confirmMessage)) return;

        setIsUpdating(true);
        haptic?.impactOccurred('medium');

        try {
          await adminApi.updateUserRole(user.id, newRole);
          haptic?.notificationOccurred('success');
          window.location.reload();
        } catch (error) {
          console.error('Failed to update user role:', error);
          haptic?.notificationOccurred('error');
          alert('Ошибка при изменении роли');
        } finally {
          setIsUpdating(false);
        }
      };

      const handleToggleBlock = async () => {
        const confirmMessage = user.isActive
          ? `Заблокировать пользователя ${user.firstName} ${user.lastName}?`
          : `Разблокировать пользователя ${user.firstName} ${user.lastName}?`;

        if (!confirm(confirmMessage)) return;

        setIsUpdating(true);
        haptic?.impactOccurred('medium');

        try {
          if (user.isActive) {
            await adminApi.blockUser(user.id);
          } else {
            await adminApi.unblockUser(user.id);
          }
          haptic?.notificationOccurred('success');
          window.location.reload();
        } catch (error) {
          console.error('Failed to toggle user block:', error);
          haptic?.notificationOccurred('error');
          alert('Ошибка при изменении статуса');
        } finally {
          setIsUpdating(false);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleRole}
            disabled={isUpdating}
            className="p-2 hover:bg-purple-50 rounded-lg text-purple-500 transition-colors disabled:opacity-50"
            title={user.role === 'ADMIN' ? 'Снять права админа' : 'Назначить админом'}
          >
            <UserCog className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleBlock}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
              user.isActive
                ? 'hover:bg-red-50 text-red-500'
                : 'hover:bg-green-50 text-green-500'
            }`}
            title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
          >
            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      );
    },
  },
];

export default function UsersPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Telegram back button - возврат в dashboard
  useTelegramBackButton(() => {
    router.push('/admin');
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const users = await adminApi.getUsers();
        setData(users);
        haptic?.notificationOccurred('success');
      } catch (error) {
        console.error('Failed to fetch users:', error);
        haptic?.notificationOccurred('error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [haptic]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка пользователей...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light text-gray-900">Пользователи</h1>
        <p className="text-sm font-light text-gray-600 mt-1">
          Управление пользователями и правами доступа ({data.length} шт.)
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}

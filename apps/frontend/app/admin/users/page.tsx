'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Shield, Ban, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/endpoints/admin';
import { User } from '@/lib/api/types';

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
];

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const users = await adminApi.getUsers();
        setData(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
        <p className="text-gray-500">Управление пользователями и правами доступа</p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}

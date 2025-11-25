'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Edit, Trash, Plus, Percent, Copy } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { promocodesApi, Promocode, DiscountType } from '@/lib/api/endpoints/promocodes';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';

const PromocodeActionsCell = ({ row, onDelete }: { row: Row<Promocode>; onDelete: (id: string) => void }) => {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  const handleCopy = () => {
    navigator.clipboard.writeText(row.original.code);
    haptic?.notificationOccurred('success');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400 transition-colors"
        title="Копировать код"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          haptic?.impactOccurred('light');
          router.push(`/admin/promocodes/${row.original.id}`);
        }}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(row.original.id)}
        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 dark:text-red-400 transition-colors"
      >
        <Trash className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function PromocodesPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [data, setData] = useState<Promocode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const promocodes = await promocodesApi.getPromocodes();
      setData(promocodes || []);
    } catch (error) {
      console.error('Failed to fetch promocodes:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Вы уверены, что хотите удалить этот промокод?')) return;

      try {
        haptic?.impactOccurred('medium');
        await promocodesApi.deletePromocode(id);
        haptic?.notificationOccurred('success');
        fetchData();
      } catch (error) {
        console.error('Failed to delete promocode:', error);
        haptic?.notificationOccurred('error');
        alert('Ошибка при удалении');
      }
    },
    [haptic, fetchData],
  );

  const columns: ColumnDef<Promocode>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Код',
        cell: ({ row }) => (
          <div className="font-mono font-medium text-cyan-600 dark:text-cyan-400">{row.original.code}</div>
        ),
      },
      {
        accessorKey: 'discount',
        header: 'Скидка',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-medium">
            {row.original.discountType === DiscountType.PERCENTAGE ? (
              <span className="text-green-600 dark:text-green-400">
                {row.original.discountValue}% скидка
              </span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400">
                {Number(row.original.discountValue).toLocaleString()} ₽
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'usage',
        header: 'Использования',
        cell: ({ row }) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.original.usageCount}
            {row.original.usageLimit && ` / ${row.original.usageLimit}`}
          </div>
        ),
      },
      {
        accessorKey: 'validity',
        header: 'Срок действия',
        cell: ({ row }) => {
          const from = new Date(row.original.validFrom).toLocaleDateString('ru-RU');
          const to = new Date(row.original.validTo).toLocaleDateString('ru-RU');
          const now = new Date();
          const validFrom = new Date(row.original.validFrom);
          const validTo = new Date(row.original.validTo);
          const isExpired = now > validTo;
          const isNotStarted = now < validFrom;

          return (
            <div className="flex flex-col text-xs">
              <span className="text-gray-600 dark:text-gray-400">с {from}</span>
              <span className="text-gray-600 dark:text-gray-400">по {to}</span>
              {isExpired && <span className="text-red-500 font-medium mt-1">Истёк</span>}
              {isNotStarted && <span className="text-orange-500 font-medium mt-1">Не активен</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Статус',
        cell: ({ row }) => (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
              row.original.isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {row.original.isActive ? 'Активен' : 'Неактивен'}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <PromocodeActionsCell row={row} onDelete={handleDelete} />,
      },
    ],
    [handleDelete],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Промокоды</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            Управление промокодами и скидками
          </p>
        </div>
        <button
          onClick={() => {
            haptic?.impactOccurred('light');
            router.push('/admin/promocodes/new');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all shadow-cyan-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Создать</span>
        </button>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}

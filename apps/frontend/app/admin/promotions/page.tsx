'use client';

import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Edit, Trash, Plus, Tag, Percent } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { promotionsApi } from '@/lib/api/endpoints/promotions';
import { Promotion } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import Image from 'next/image';

const PromotionActionsCell = ({ row, onDelete }: { row: Row<Promotion>; onDelete: (id: string) => void }) => {
  const router = useRouter();
  const haptic = useTelegramHaptic();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          haptic?.impactOccurred('light');
          router.push(`/admin/promotions/${row.original.id}`);
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

export default function PromotionsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [data, setData] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const promotions = await promotionsApi.getAdminPromotions();
      setData(promotions);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return;

      try {
        haptic?.impactOccurred('medium');
        await promotionsApi.deletePromotion(id);
        haptic?.notificationOccurred('success');
        fetchData();
      } catch (error) {
        console.error('Failed to delete promotion:', error);
        haptic?.notificationOccurred('error');
        alert('Ошибка при удалении');
      }
    },
    [haptic, fetchData],
  );

  const columns: ColumnDef<Promotion>[] = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Фото',
        cell: ({ row }) => (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {row.original.image ? (
              <Image src={row.original.image} alt={row.original.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <Tag className="w-6 h-6" />
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Название',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.original.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{row.original.description}</div>
          </div>
        ),
      },
      {
        accessorKey: 'discount',
        header: 'Скидка',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm font-medium text-pink-600 dark:text-pink-400">
            {row.original.discountPercent ? (
              <>
                <Percent className="w-3 h-3" />
                {row.original.discountPercent}%
              </>
            ) : row.original.discountAmount ? (
              <>{Number(row.original.discountAmount).toLocaleString()} ₽</>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'dates',
        header: 'Даты',
        cell: ({ row }) => {
          const from = row.original.validFrom ? new Date(row.original.validFrom).toLocaleDateString('ru-RU') : null;
          const to = row.original.validTo ? new Date(row.original.validTo).toLocaleDateString('ru-RU') : null;

          if (!from && !to) return <span className="text-xs text-gray-400 dark:text-gray-500">Бессрочно</span>;

          return (
            <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
              {from && <span>с {from}</span>}
              {to && <span>по {to}</span>}
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
            {row.original.isActive ? 'Активна' : 'Скрыта'}
          </div>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => <PromotionActionsCell row={row} onDelete={handleDelete} />,
      },
    ],
    [handleDelete],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Акции</h1>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-1">Управление акциями и скидками</p>
        </div>
        <Link
          href="/admin/promotions/new"
          onClick={() => haptic?.impactOccurred('light')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all shadow-pink-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Создать</span>
        </Link>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}

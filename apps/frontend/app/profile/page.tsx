'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import { UserIcon } from '@/components/ui/icons';
import { legalApi, LegalDocument, LegalDocumentType } from '@/lib/api/endpoints/legal';

const documentLabels: Record<string, string> = {
  [LegalDocumentType.TERMS]: 'Пользовательское соглашение',
  [LegalDocumentType.PRIVACY]: 'Политика конфиденциальности',
  [LegalDocumentType.OFFER]: 'Публичная оферта',
  [LegalDocumentType.DELIVERY_PAYMENT]: 'Доставка и оплата',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { favoriteIds } = useFavoritesStore();
  const haptic = useTelegramHaptic();
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  useTelegramBackButton(() => {
    if (selectedDocument) {
      setSelectedDocument(null);
    } else {
      router.back();
    }
  });

  useEffect(() => {
    async function fetchLegalDocuments() {
      try {
        const docs = await legalApi.getDocuments();
        // Filter to only active documents
        setLegalDocuments(docs.filter((doc) => doc.isActive));
      } catch (error) {
        console.error('Failed to fetch legal documents:', error);
      }
    }
    fetchLegalDocuments();
  }, []);

  const handleDocumentClick = (doc: LegalDocument) => {
    haptic.impactOccurred('light');
    setSelectedDocument(doc);
  };

  const closeDocumentModal = () => {
    haptic.impactOccurred('light');
    setSelectedDocument(null);
  };

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
    <div className="min-h-screen relative z-10 pb-8">
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <h1 className="text-lg font-light text-gray-900 dark:text-white">Профиль</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* User Info Card */}
        {isAuthenticated && user ? (
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 flex items-center justify-center">
                {user.photoUrl ? (
                  <Image
                    src={user.photoUrl || ''}
                    alt={user.firstName || 'User'}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-light text-gray-900 dark:text-white mb-1">
                  {user.firstName} {user.lastName || ''}
                </h2>
                {user.username && <p className="text-sm font-light text-gray-600 dark:text-gray-400">@{user.username}</p>}
                {user.phoneNumber && <p className="text-sm font-light text-gray-600 dark:text-gray-400">{user.phoneNumber}</p>}
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <p className="text-2xl font-light text-gray-900 dark:text-white mb-1">0</p>
                <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide">Заказов</p>
              </div>
              <div className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
                <p className="text-2xl font-light text-gray-900 dark:text-white mb-1">{favoriteIds.length}</p>
                <p className="text-xs font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide">Избранное</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-lg text-center">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-lg font-light text-gray-900 dark:text-white mb-2">Войдите в аккаунт</h2>
            <p className="text-sm font-light text-gray-600 dark:text-gray-400 mb-6">Чтобы просматривать заказы и сохранять избранное</p>
            <Button onClick={() => router.push('/')}>На главную</Button>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full backdrop-blur-md rounded-2xl p-5 border shadow-lg hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-300 text-left ${
                item.isAdmin
                  ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  : 'bg-white/40 dark:bg-white/10 border-white/30 dark:border-white/10'
              }`}
            >
              <p className="text-base font-light text-gray-900 dark:text-white mb-1">{item.label}</p>
              <p className="text-xs font-light text-gray-600 dark:text-gray-400">{item.description}</p>
            </button>
          ))}
        </div>

        {/* Legal Links */}
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/20 dark:border-white/5">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400">Документы</p>
          </div>

          {/* Consent Status */}
          {user?.hasAcceptedTerms && (
            <div className="px-4 py-3 bg-green-50/50 dark:bg-green-500/10 border-b border-white/20 dark:border-white/5 flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Соглашение принято
                </p>
                {user.termsAcceptedAt && (
                  <p className="text-xs text-green-600/70 dark:text-green-500/70">
                    {new Date(user.termsAcceptedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="divide-y divide-white/20 dark:divide-white/5">
            {legalDocuments.length > 0 ? (
              legalDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-light text-gray-700 dark:text-gray-300">
                      {documentLabels[doc.type] || doc.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                Документы загружаются...
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30 text-sm font-light text-red-700 dark:text-red-400 hover:bg-red-500/30 transition-all duration-300"
          >
            Выйти из аккаунта
          </button>
        )}

        {/* App Version */}
        <div className="text-center">
          <p className="text-xs font-light text-gray-500 dark:text-gray-400">Версия 1.0.0</p>
        </div>
      </div>

      {/* Legal Document Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDocumentModal}
              className="fixed inset-0 bg-black/50 z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[90vh] flex flex-col"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Handle */}
              <div className="flex justify-center py-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              {/* Header */}
              <div className="px-4 pb-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  {documentLabels[selectedDocument.type] || selectedDocument.title}
                </h2>
                <button
                  onClick={closeDocumentModal}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-light leading-relaxed">
                  {selectedDocument.content}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Версия {selectedDocument.version} • Обновлено{' '}
                    {new Date(selectedDocument.updatedAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

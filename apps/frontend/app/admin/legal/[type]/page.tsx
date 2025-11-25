'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { legalApi, LegalDocument, LegalDocumentType } from '@/lib/api/endpoints/legal';

const documentLabels: Record<string, string> = {
  terms: 'Пользовательское соглашение',
  privacy: 'Политика конфиденциальности',
  offer: 'Публичная оферта',
  delivery_payment: 'Доставка и оплата',
};

export default function LegalDocumentEditPage() {
  const router = useRouter();
  const params = useParams();
  const haptic = useTelegramHaptic();
  const type = (params.type as string).toUpperCase() as LegalDocumentType;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0');
  const [isActive, setIsActive] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin/legal');
  });

  useEffect(() => {
    async function fetchDocument() {
      try {
        const doc = await legalApi.getDocument(type);
        if (doc) {
          setDocument(doc);
          setTitle(doc.title);
          setContent(doc.content);
          setVersion(doc.version);
          setIsActive(doc.isActive);
        } else {
          // Set defaults for new document
          setTitle(documentLabels[params.type as string] || '');
          setVersion('1.0');
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocument();
  }, [type, params.type]);

  const handleSave = async () => {
    setIsSaving(true);
    haptic?.impactOccurred('medium');

    try {
      const data = {
        type,
        title,
        content,
        version,
        isActive,
        publishedAt: isActive ? new Date().toISOString() : document?.publishedAt,
      };

      if (document) {
        await legalApi.updateDocument(document.id, data);
      } else {
        await legalApi.createDocument(data);
      }

      haptic?.notificationOccurred('success');
      router.push('/admin/legal');
    } catch (error) {
      console.error('Failed to save document:', error);
      haptic?.notificationOccurred('error');
      alert('Ошибка при сохранении документа');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;

    const confirmed = confirm(
      `Вы уверены, что хотите удалить документ "${title}"? Это действие нельзя отменить.`
    );

    if (!confirmed) return;

    haptic?.impactOccurred('medium');

    try {
      await legalApi.deleteDocument(document.id);
      haptic?.notificationOccurred('success');
      router.push('/admin/legal');
    } catch (error) {
      console.error('Failed to delete document:', error);
      haptic?.notificationOccurred('error');
      alert('Ошибка при удалении документа');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 dark:text-gray-300 font-light">Загрузка документа...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">
            {documentLabels[params.type as string]}
          </h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">
            {document ? 'Редактирование документа' : 'Создание нового документа'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {document && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Удалить</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !title || !content}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Название документа
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Введите название документа"
          />
        </div>

        {/* Version and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Версия</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="1.0"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Статус</label>
            <button
              onClick={() => {
                setIsActive(!isActive);
                haptic?.impactOccurred('light');
              }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {isActive ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Активен</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Неактивен</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Содержание документа
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 font-mono text-sm"
            placeholder="Введите текст документа. Поддерживается Markdown форматирование."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Можно использовать Markdown: **жирный**, *курсив*, # заголовок, - списки
          </p>
        </div>

        {/* Info */}
        {document && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>ℹ️ Информация:</strong>
              <br />
              Создан: {new Date(document.createdAt).toLocaleString('ru-RU')}
              <br />
              Последнее изменение: {new Date(document.updatedAt).toLocaleString('ru-RU')}
              {document.publishedAt && (
                <>
                  <br />
                  Опубликован: {new Date(document.publishedAt).toLocaleString('ru-RU')}
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

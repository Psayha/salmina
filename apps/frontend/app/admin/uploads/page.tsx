'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Copy, Check, ImageIcon, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { uploadsApi, UploadedFile } from '@/lib/api/endpoints/uploads';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Toast, useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFullUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `https://app.salminashop.ru${url}`;
}

export default function UploadsPage() {
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const toast = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; file: UploadedFile | null }>({
    isOpen: false,
    file: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useTelegramBackButton(() => {
    router.push('/admin');
  });

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await uploadsApi.getFiles();
      setFiles(response.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Ошибка загрузки файлов');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCopyUrl = async (file: UploadedFile) => {
    const fullUrl = getFullUrl(file.url);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedUrl(file.filename);
      haptic?.notificationOccurred('success');
      toast.success('Ссылка скопирована');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const handleDeleteClick = (file: UploadedFile) => {
    setDeleteModal({ isOpen: true, file });
    haptic?.impactOccurred('light');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.file) return;

    setIsDeleting(true);
    haptic?.impactOccurred('medium');

    try {
      await uploadsApi.deleteFile(deleteModal.file.filename);
      setFiles((prev) => prev.filter((f) => f.filename !== deleteModal.file!.filename));
      toast.success('Файл удален');
      haptic?.notificationOccurred('success');
      setDeleteModal({ isOpen: false, file: null });
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Ошибка удаления');
      haptic?.notificationOccurred('error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    haptic?.impactOccurred('light');
    fetchFiles();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Загруженные файлы</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Всего: {files.length} файлов
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Нет загруженных файлов</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {files.map((file) => (
            <div
              key={file.filename}
              className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-500 transition-all"
            >
              {/* Image */}
              <div
                className="aspect-square relative cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                <Image
                  src={getFullUrl(file.url)}
                  alt={file.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, (max-width: 768px) 20vw, 12.5vw"
                />
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={() => handleCopyUrl(file)}
                  className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                  title="Копировать ссылку"
                >
                  {copiedUrl === file.filename ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteClick(file)}
                  className="p-1.5 bg-red-500/50 backdrop-blur-sm rounded-full hover:bg-red-500/70 transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Image
              src={getFullUrl(selectedFile.url)}
              alt={selectedFile.filename}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh]"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4">
              <p className="text-white font-medium truncate">{selectedFile.filename}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>{formatDate(selectedFile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, file: null })}
        title="Удалить файл?"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Вы уверены, что хотите удалить файл &quot;{deleteModal.file?.filename}&quot;? Это действие
            нельзя отменить.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, file: null })}
              className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        </div>
      </Modal>

      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  );
}

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, Play, Image as ImageIcon, Film } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
  allowVideo?: boolean;
}

function getFullUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://app.salminashop.ru${url.startsWith('/') ? '' : '/'}${url}`;
}

function isVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 20,
  allowVideo = true
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file count
    if (value.length + files.length > maxFiles) {
      alert(`Максимум ${maxFiles} файлов`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        alert(`${file.name} не является изображением или видео`);
        continue;
      }

      if (isVideo && !allowVideo) {
        alert(`Видео файлы не поддерживаются`);
        continue;
      }

      const maxSize = isVideo ? maxVideoSizeMB : maxImageSizeMB;
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name} превышает ${maxSize}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress({ current: i + 1, total: validFiles.length });

        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minutes for video uploads
        });

        if (response.data.success && response.data.data.url) {
          uploadedUrls.push(response.data.data.url);
        }
      }

      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки файлов');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  // Drag and drop reordering
  const handleItemDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleItemDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleItemDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newValue = [...value];
    const [draggedItem] = newValue.splice(draggedIndex, 1);
    newValue.splice(targetIndex, 0, draggedItem);

    onChange(newValue);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, value, onChange]);

  const handleItemDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Touch-based reordering for mobile
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    const newValue = [...value];
    const [item] = newValue.splice(fromIndex, 1);
    newValue.splice(toIndex, 0, item);
    onChange(newValue);
  };

  const acceptTypes = allowVideo ? 'image/*,video/mp4,video/webm,video/mov' : 'image/*';

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive
            ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptTypes}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
            >
              Выберите файлы
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              или перетащите сюда
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            {allowVideo ? (
              <>Изображения до {maxImageSizeMB}MB, видео до {maxVideoSizeMB}MB</>
            ) : (
              <>PNG, JPG, WEBP до {maxImageSizeMB}MB</>
            )}
            {' '}(макс. {maxFiles})
          </p>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {uploading && uploadProgress.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Загрузка файлов...
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {uploadProgress.current} / {uploadProgress.total}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-300 ease-out"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview Grid with Reordering */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Перетащите для изменения порядка. Первый файл — основной.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {value.map((url, index) => {
              const isVideo = isVideoUrl(url);
              const fullUrl = getFullUrl(url);
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={`${url}-${index}`}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, index)}
                  onDragEnd={handleItemDragEnd}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 group cursor-move transition-all ${
                    isDragging
                      ? 'opacity-50 scale-95 border-pink-500'
                      : isDragOver
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-500'
                  } ${index === 0 ? 'ring-2 ring-pink-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
                >
                  {/* Main Badge */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-pink-500 text-white text-[10px] font-medium rounded">
                      Главное
                    </div>
                  )}

                  {/* Drag Handle */}
                  <div className="absolute top-1 right-1 z-10 p-1 bg-black/40 backdrop-blur-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>

                  {/* Media Content */}
                  {isVideo ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                      <video
                        src={fullUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          // Seek to first frame for thumbnail
                          (e.target as HTMLVideoElement).currentTime = 0.1;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1 left-1 z-10">
                        <Film className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={fullUrl}
                      alt={`Файл ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 20vw"
                      unoptimized
                      onError={(e) => {
                        // Fallback for broken images
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(index);
                    }}
                    className="absolute bottom-1 right-1 z-10 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Move buttons for mobile (touch) */}
                  <div className="absolute bottom-1 left-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:hidden">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, index - 1);
                        }}
                        className="w-6 h-6 rounded bg-black/50 backdrop-blur-sm text-white flex items-center justify-center text-xs"
                      >
                        ←
                      </button>
                    )}
                    {index < value.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(index, index + 1);
                        }}
                        className="w-6 h-6 rounded bg-black/50 backdrop-blur-sm text-white flex items-center justify-center text-xs"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !uploading && (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Файлы не загружены</p>
        </div>
      )}
    </div>
  );
}

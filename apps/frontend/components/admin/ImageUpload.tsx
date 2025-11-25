'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUpload({ value = [], onChange, maxFiles = 10, maxSizeMB = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file count
    if (value.length + files.length > maxFiles) {
      alert(`Максимум ${maxFiles} изображений`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        alert(`${file.name} не является изображением`);
        continue;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`${file.name} превышает ${maxSizeMB}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for file uploads
        });

        if (response.data.success && response.data.data.url) {
          // Convert relative URL to absolute
          const fullUrl = `${window.location.origin}${response.data.data.url}`;
          uploadedUrls.push(fullUrl);
        }
      }

      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки изображений');
    } finally {
      setUploading(false);
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

  const removeImage = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleChange} className="hidden" />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Загрузка...' : 'Перетащите изображения сюда'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              или{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                выберите файлы
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-400">
            PNG, JPG, GIF, WEBP до {maxSizeMB}MB (макс. {maxFiles} файлов)
          </p>
        </div>
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              <Image src={url} alt={`Upload ${index + 1}`} fill className="object-cover" unoptimized />

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {value.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Изображения не загружены</p>
        </div>
      )}
    </div>
  );
}

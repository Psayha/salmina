'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { updateCategory, getCategoryBySlug, getCategories } from '@/lib/api/endpoints/categories';
import { Category } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { ArrowLeft, Save } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    showOnHome: false,
    homeOrder: '',
    order: '0',
    isActive: true,
  });

  useTelegramBackButton(() => {
    router.push('/admin/categories');
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryData, categoriesData] = await Promise.all([getCategoryBySlug(id), getCategories()]);

        setCategory(categoryData);
        setCategories(categoriesData.filter((c) => c.id !== categoryData.id));

        setFormData({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || '',
          image: categoryData.image || '',
          parentId: categoryData.parentId || '',
          showOnHome: categoryData.showOnHome,
          homeOrder: categoryData.homeOrder?.toString() || '',
          order: categoryData.order.toString(),
          isActive: categoryData.isActive,
        });
      } catch (error) {
        console.error('Failed to load category:', error);
        haptic?.notificationOccurred('error');
        alert('Ошибка при загрузке категории');
        router.push('/admin/categories');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, router, haptic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) return;

    if (!formData.name || !formData.slug) {
      alert('Заполните обязательные поля: Название и URL');
      haptic?.notificationOccurred('error');
      return;
    }

    setIsSubmitting(true);
    haptic?.impactOccurred('medium');

    try {
      await updateCategory(category.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        image: formData.image || undefined,
        parentId: formData.parentId || undefined,
        showOnHome: formData.showOnHome,
        homeOrder: formData.homeOrder ? parseInt(formData.homeOrder) : undefined,
        order: parseInt(formData.order),
        isActive: formData.isActive,
      });

      haptic?.notificationOccurred('success');
      router.push('/admin/categories');
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Ошибка при обновлении категории');
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 font-light">Загрузка категории...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/categories')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-gray-900">Редактировать категорию</h1>
          <p className="text-sm font-light text-gray-600 mt-1">{category?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 space-y-4">
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              placeholder="Введите название категории"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">
              URL (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
              }
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              placeholder="nazvanie-kategorii"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Используется в URL категории</p>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              placeholder="Введите описание категории"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Изображение</label>
            <ImageUpload
              value={formData.image ? [formData.image] : []}
              onChange={(urls) => setFormData({ ...formData, image: urls[0] || '' })}
              maxFiles={1}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Родительская категория</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
              >
                <option value="">Нет (корневая категория)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Порядок сортировки</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showOnHome}
                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700">Показывать на главной</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700">Активна</span>
            </label>
          </div>

          {formData.showOnHome && (
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">Порядок на главной</label>
              <input
                type="number"
                value={formData.homeOrder}
                onChange={(e) => setFormData({ ...formData, homeOrder: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light"
                placeholder="0"
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-light"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg shadow-pink-500/30 font-light disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { updateProduct, getProductBySlug } from '@/lib/api/endpoints/products';
import { getCategories } from '@/lib/api/endpoints/categories';
import { Category, Product } from '@/lib/api/types';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { ArrowLeft, Save } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const haptic = useTelegramHaptic();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    article: '',
    weight: '',
    price: '',
    discountPrice: '',
    quantity: '0',
    categoryId: '',
    isActive: true,
    hasPromotion: false,
    isNew: false,
    isHit: false,
    images: '',
  });

  useTelegramBackButton(() => {
    router.push('/admin/products');
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [productData, categoriesData] = await Promise.all([getProductBySlug(slug), getCategories()]);

        setProduct(productData);
        setCategories(categoriesData);

        setFormData({
          name: productData.name,
          slug: productData.slug,
          description: productData.description || '',
          article: productData.article,
          weight: productData.weight.toString(),
          price: productData.price.toString(),
          discountPrice: productData.discountPrice?.toString() || '',
          quantity: productData.quantity.toString(),
          categoryId: productData.categoryId || '',
          isActive: productData.isActive,
          hasPromotion: productData.hasPromotion,
          isNew: productData.isNew || false,
          isHit: productData.isHit || false,
          images: productData.images.join('\n'),
        });
      } catch (error) {
        console.error('Failed to load product:', error);
        haptic?.notificationOccurred('error');
        alert('Ошибка при загрузке товара');
        router.push('/admin/products');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug, router, haptic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    // Validate required fields
    if (
      !formData.name ||
      !formData.slug ||
      !formData.description ||
      !formData.article ||
      !formData.weight ||
      !formData.price ||
      !formData.categoryId
    ) {
      alert('Заполните все обязательные поля');
      haptic?.notificationOccurred('error');
      return;
    }

    // Validate article format
    if (!/^[A-Z0-9-]+$/.test(formData.article)) {
      alert('Артикул должен содержать только заглавные буквы, цифры и дефисы');
      haptic?.notificationOccurred('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const images = formData.images
        ? formData.images
            .split('\n')
            .map((url) => url.trim())
            .filter(Boolean)
        : [];

      await updateProduct(product.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        article: formData.article.toUpperCase(),
        weight: parseFloat(formData.weight),
        price: parseFloat(formData.price),
        discountPrice: formData.hasPromotion && formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        quantity: parseInt(formData.quantity),
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        hasPromotion: formData.hasPromotion,
        isNew: formData.isNew,
        isHit: formData.isHit,
        images,
      });

      haptic?.notificationOccurred('success');
      router.push('/admin/products');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Ошибка при обновлении товара');
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600 dark:text-gray-300 font-light">Загрузка товара...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/products')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-gray-900 dark:text-white">Редактировать товар</h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300 mt-1">{product?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
              placeholder="Введите название товара"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              URL (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
              }
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
              placeholder="nazvanie-tovara"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Используется в URL товара</p>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Описание <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
              placeholder="Введите описание товара"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                Артикул <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.article}
                onChange={(e) => setFormData({ ...formData, article: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light uppercase text-gray-900 dark:text-white"
                placeholder="ART-123"
                pattern="[A-Z0-9-]+"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Заглавные буквы, цифры, дефисы</p>
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                Вес (г) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
                placeholder="100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Категория <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full h-[46px] px-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                Цена <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">Количество</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
              Изображения <span className="text-red-500">*</span>
            </label>
            <ImageUpload
              value={formData.images ? formData.images.split('\n').filter(Boolean) : []}
              onChange={(urls) => setFormData({ ...formData, images: urls.join('\n') })}
              maxFiles={5}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Первое изображение будет основным</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700 dark:text-gray-300">Активен</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasPromotion}
                onChange={(e) => setFormData({ ...formData, hasPromotion: e.target.checked, discountPrice: e.target.checked ? formData.discountPrice : '' })}
                className="w-4 h-4 text-pink-500 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700 dark:text-gray-300">Акция</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700 dark:text-gray-300">Новинка</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isHit}
                onChange={(e) => setFormData({ ...formData, isHit: e.target.checked })}
                className="w-4 h-4 text-pink-500 border-gray-300 dark:border-gray-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm font-light text-gray-700 dark:text-gray-300">Хит</span>
            </label>
          </div>

          {formData.hasPromotion && (
            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                Цена со скидкой <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-light text-gray-900 dark:text-white"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Эта цена будет показана вместо основной</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-light"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/30 transition-all font-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Сохранение...' : 'Сохранить'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

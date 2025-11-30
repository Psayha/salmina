'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useTelegramBackButton, useTelegramHaptic } from '@/lib/telegram/useTelegram';
import { Button } from '@/components/ui';
import { CartIcon } from '@/components/ui/icons';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    isLoading,
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCartStore();
  const haptic = useTelegramHaptic();

  useTelegramBackButton(() => {
    router.back();
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) return;

    try {
      haptic.selectionChanged();
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      haptic.impactOccurred('medium');
      await removeCartItem(itemId);
      haptic.notificationOccurred('success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      haptic.impactOccurred('heavy');
      await clearCart();
      haptic.notificationOccurred('success');
    } catch (error) {
      haptic.notificationOccurred('error');
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = () => {
    haptic.impactOccurred('medium');
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 dark:border-white/10 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-white/30 dark:bg-white/10 rounded-xl w-80"></div>
            <div className="h-20 bg-white/30 dark:bg-white/10 rounded-xl w-80"></div>
            <div className="h-20 bg-white/30 dark:bg-white/10 rounded-xl w-80"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter out items with missing product data
  const validItems = cart?.items.filter((item) => item.product) || [];
  const isEmpty = !cart || validItems.length === 0;

  // Debug logging
  console.log('Cart debug:', {
    hasCart: !!cart,
    itemsCount: cart?.totals?.itemsCount,
    rawItemsLength: cart?.items?.length,
    validItemsLength: validItems.length,
    items: cart?.items?.map(item => ({
      id: item.id,
      productId: item.productId,
      hasProduct: !!item.product,
      productName: item.product?.name
    }))
  });

  return (
    <div className="min-h-screen relative z-10 pb-36">
      {/* Header */}
      <div className="px-4 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-light text-gray-900 dark:text-white">Корзина</h1>
          {!isEmpty && (
            <p className="text-sm font-light text-gray-600 dark:text-gray-300">
              {cart.totals.itemsCount} {cart.totals.itemsCount === 1 ? 'товар' : 'товаров'}
            </p>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/30 dark:border-white/10 shadow-lg text-center max-w-md">
            <CartIcon className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-500" />
            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-3">Корзина пуста</h2>
            <p className="text-sm font-light text-gray-600 dark:text-gray-300 mb-6">
              Добавьте товары из каталога, чтобы начать оформление заказа
            </p>
            <Button onClick={() => router.push('/')}>Перейти к покупкам</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="px-4 space-y-4">
            {validItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 bg-white/30 dark:bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product?.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product?.name || 'Товар'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-4xl">🎁</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-light text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {item.product?.name || 'Товар'}
                    </h3>
                    <p className="text-lg font-light text-gray-900 dark:text-white">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 shadow-md flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg font-light text-gray-700 dark:text-gray-200">−</span>
                      </button>

                      <span className="text-base font-light text-gray-900 dark:text-white min-w-[30px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="w-8 h-8 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 shadow-md flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/20 transition-all duration-300"
                      >
                        <span className="text-lg font-light text-gray-700 dark:text-gray-200">+</span>
                      </button>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto px-4 py-2 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30 text-xs font-light text-red-700 dark:text-red-400 hover:bg-red-500/30 transition-all duration-300"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-3 pt-3 border-t border-white/30 dark:border-white/10 flex justify-between items-center">
                  <span className="text-sm font-light text-gray-600 dark:text-gray-300">Итого за товар:</span>
                  <span className="text-lg font-light text-gray-900 dark:text-white">
                    {item.total.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={handleClearCart}
              className="w-full py-3 bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/10 text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/20 transition-all duration-300"
            >
              Очистить корзину
            </button>
          </div>

          {/* Fixed Bottom Bar - iOS style */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-t-3xl border-t border-white/30 dark:border-white/10 shadow-2xl z-50">
            <div className="px-4 pt-4 pb-6">
              {/* Info Row */}
              <div className="flex items-center justify-between mb-3">
                {/* Items count */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Товаров:</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{cart.totals.itemsCount}</span>
                  </div>
                  {cart.totals.discount > 0 && (
                    <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        −{cart.totals.discount.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Price */}
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Итого</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {cart.totals.total.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>

              {/* Checkout Button - iOS style */}
              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30"
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

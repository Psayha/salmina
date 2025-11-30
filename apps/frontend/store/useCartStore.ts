import { create } from 'zustand';
import { Cart } from '@/lib/api/types';
import { cartApi } from '@/lib/api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  itemsCount: number;
  total: number;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

// Helper to extract computed values from cart
const getCartComputedValues = (cart: Cart | null) => ({
  itemsCount: cart?.totals?.itemsCount || 0,
  total: cart?.totals?.total || 0,
});

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemsCount: 0,
  total: 0,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.getCart();

      // Save session token if present
      if (cart.sessionToken && typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', cart.sessionToken);
      }

      set({ cart, isLoading: false, ...getCartComputedValues(cart) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка загрузки корзины';
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.addToCart({ productId, quantity });

      // Save session token if present
      if (cart.sessionToken && typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', cart.sessionToken);
      }

      set({ cart, isLoading: false, ...getCartComputedValues(cart) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка добавления в корзину';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.updateCartItem(itemId, { quantity });

      // Save session token if present
      if (cart.sessionToken && typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', cart.sessionToken);
      }

      set({ cart, isLoading: false, ...getCartComputedValues(cart) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка обновления корзины';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  removeCartItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.removeCartItem(itemId);

      // Save session token if present
      if (cart.sessionToken && typeof window !== 'undefined') {
        localStorage.setItem('sessionToken', cart.sessionToken);
      }

      set({ cart, isLoading: false, ...getCartComputedValues(cart) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка удаления из корзины';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clearCart();
      set({ cart: null, isLoading: false, itemsCount: 0, total: 0 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка очистки корзины';
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

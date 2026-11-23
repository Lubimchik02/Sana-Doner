// src/store/cart.ts — корзина (Zustand + сохранение в localStorage)
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  key: string; // `${dishId}:${variantId}`
  dishId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  image: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  toast: { id: number; text: string } | null;
  add: (item: Omit<CartItem, "key" | "qty">) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  clear: () => void;
  hideToast: () => void;
}

export const cartKey = (dishId: string, variantId: string) => `${dishId}:${variantId}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      toast: null,

      add: (item) =>
        set((s) => {
          const key = cartKey(item.dishId, item.variantId);
          const exists = s.items.find((i) => i.key === key);
          const items = exists
            ? s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
            : [...s.items, { ...item, key, qty: 1 }];
          return { items, toast: { id: Date.now(), text: `${item.name} — в корзине` } };
        }),

      inc: (key) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)) })),

      dec: (key) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        })),

      clear: () => set({ items: [] }),
      hideToast: () => set({ toast: null }),
    }),
    { name: "sana-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

// Два отдельных селектора с примитивами — без лишних ререндеров и бесконечного цикла в Zustand v5
export const useCartTotals = () => {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const total = useCart((s) => s.items.reduce((n, i) => n + i.qty * i.price, 0));
  return { count, total };
};

export const useItemQty = (key: string) =>
  useCart((s) => s.items.find((i) => i.key === key)?.qty ?? 0);

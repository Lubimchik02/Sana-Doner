// src/store/ui.ts — глобальные окна (отзыв), чтобы открывать их из любого места
"use client";

import { create } from "zustand";

interface UIState {
  reviewOpen: boolean;
  openReview: () => void;
  closeReview: () => void;
}

export const useUI = create<UIState>((set) => ({
  reviewOpen: false,
  openReview: () => set({ reviewOpen: true }),
  closeReview: () => set({ reviewOpen: false }),
}));

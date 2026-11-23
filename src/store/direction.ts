// src/store/direction.ts — активное направление (classic | healthy) и активная категория
"use client";

import { create } from "zustand";
import type { MenuDirection } from "@/config/brand";

interface DirectionState {
  direction: MenuDirection;
  activeCategory: string | null;
  setDirection: (d: MenuDirection) => void;
  setActiveCategory: (id: string) => void;
}

export const useDirection = create<DirectionState>((set) => ({
  direction: "classic",
  activeCategory: null,
  setDirection: (direction) => set({ direction }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
}));

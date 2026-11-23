// src/components/menu/StickyNav.tsx
// Липкая панель как в Додо: переключатель направлений + полоска категорий + кнопка «Корзина».
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Leaf, Flame, ShoppingBag } from "lucide-react";
import { menu, formatPrice, type MenuDirection } from "@/config/brand";
import { useDirection } from "@/store/direction";
import { useCartTotals } from "@/store/cart";

const NAV_OFFSET = 130; // высота липкой панели — для точного скролла

export const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: "smooth" });
};

const tabs: { id: MenuDirection; label: string; short: string; Icon: typeof Flame }[] = [
  { id: "classic", label: "Классический фастфуд", short: "Классика", Icon: Flame },
  { id: "healthy", label: "Полезный фастфуд", short: "ПП", Icon: Leaf },
];

export default function StickyNav({ onCartClick }: { onCartClick: () => void }) {
  const { direction, activeCategory } = useDirection();
  const { count, total } = useCartTotals();
  const stripRef = useRef<HTMLDivElement>(null);

  // Держим активную категорию в зоне видимости полоски
  useEffect(() => {
    if (!activeCategory || !stripRef.current) return;
    const btn = stripRef.current.querySelector<HTMLElement>(`[data-cat="${activeCategory}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategory]);

  const categories = menu[direction].categories;

  return (
    <div className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-5">
        {/* Переключатель направлений */}
        <div className="flex justify-center pt-3">
          <div className="relative flex rounded-full bg-neutral-900/5 p-1">
            {tabs.map(({ id, label, short, Icon }) => {
              const active = direction === id;
              return (
                <button key={id} onClick={() => scrollToId(`section-${id}`)}
                  className={`relative z-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors sm:px-6 ${active ? "text-white" : "text-neutral-600"}`}>
                  {active && (
                    <motion.span layoutId="dir-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-[var(--bg-to)] shadow-md transition-colors duration-700"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Категории + корзина */}
        <div className="flex items-center gap-3 py-3">
          <div ref={stripRef} className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
            {categories.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button key={c.id} data-cat={c.id} onClick={() => scrollToId(`cat-${c.id}`)}
                  className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${active ? "text-[var(--on-accent)]" : "text-neutral-600 hover:text-neutral-900"}`}>
                  {active && (
                    <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-[var(--accent)]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  {c.emoji} {c.title}
                </button>
              );
            })}
          </div>

          {/* Корзина — только десктоп, на мобильных есть плавающая */}
          <motion.button onClick={onCartClick} whileTap={{ scale: 0.95 }}
            className="hidden shrink-0 items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--on-accent)] shadow-md transition-colors duration-700 md:flex">
            <ShoppingBag className="h-4 w-4" />
            Корзина
            {count > 0 && (
              <>
                <span className="h-4 w-px bg-white/40" />
                <motion.span key={total} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  {formatPrice(total)}
                </motion.span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

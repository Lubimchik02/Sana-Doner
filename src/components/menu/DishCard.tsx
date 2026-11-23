// src/components/menu/DishCard.tsx
// Карточка как в Додо: кнопка-ценник внизу.
// 1 версия  → добавление сразу + превращение в счётчик «− 1 +».
// 2+ версии → открывается VariantModal.
"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { formatPrice, type Dish } from "@/config/brand";
import { cartKey, useCart, useItemQty } from "@/store/cart";

const TAGS: Record<string, string> = {
  hit: "Хит №1", new: "Новинка", spicy: "Острое 🌶", deal: "до −20%", green: "Green 🌿", protein: "Белок",
};

export default function DishCard({ dish, onChooseVariant }: { dish: Dish; onChooseVariant: (d: Dish) => void }) {
  const single = dish.variants.length === 1;
  const v0 = dish.variants[0];
  const key = cartKey(dish.id, v0.id);
  const qty = useItemQty(key);
  const { add, inc, dec } = useCart();
  const minPrice = Math.min(...dish.variants.map((v) => v.price));
  const kcal = v0.nutrition?.kcal;

  const handlePrice = () => {
    if (!single) return onChooseVariant(dish);
    add({ dishId: dish.id, variantId: v0.id, name: dish.name, variantLabel: v0.label, price: v0.price, image: dish.image });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`group flex flex-col overflow-hidden rounded-3xl bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur transition-shadow hover:shadow-xl ${dish.available === false ? "pointer-events-none opacity-50 grayscale" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <Image src={dish.image} alt={dish.name} fill sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105" />
        {dish.tags && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {dish.tags.map((t) => (
              <span key={t} className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-neutral-800 shadow-sm">
                {TAGS[t]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold leading-tight text-neutral-900">{dish.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-neutral-500">{dish.description}</p>
        {kcal && <p className="mt-2 text-xs font-medium text-neutral-400">{kcal} ккал · Б {v0.nutrition!.protein} г</p>}

        <div className="mt-4 h-11">
          <AnimatePresence mode="wait" initial={false}>
            {single && qty > 0 ? (
              /* ── Счётчик ── */
              <motion.div key="counter"
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="flex h-full items-center justify-between rounded-full bg-[var(--accent-soft)]/50 px-1 transition-colors duration-700">
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => dec(key)} aria-label="Меньше"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm">
                  <Minus className="h-4 w-4" />
                </motion.button>
                <motion.span key={qty} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="font-extrabold text-neutral-900">{qty}</motion.span>
                <motion.button whileTap={{ scale: 0.8 }} onClick={() => inc(key)} aria-label="Больше"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] shadow-sm">
                  <Plus className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ) : (
              /* ── Кнопка-ценник ── */
              <motion.button key="price" onClick={handlePrice}
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="h-full w-full rounded-full bg-[var(--accent)] font-extrabold text-[var(--on-accent)] shadow-md shadow-[var(--accent)]/25 transition-colors duration-700">
                {single ? formatPrice(v0.price) : `от ${formatPrice(minPrice)}`}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

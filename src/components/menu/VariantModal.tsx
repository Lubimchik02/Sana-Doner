// src/components/menu/VariantModal.tsx
// Компактное окно выбора готовой версии (Стандарт / XL и т.п.).
// На мобильных — bottom-sheet, на десктопе — центрированная карточка.
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { formatPrice, type Dish } from "@/config/brand";
import { useCart } from "@/store/cart";

export default function VariantModal({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const [vid, setVid] = useState<string>("");
  const add = useCart((s) => s.add);

  useEffect(() => {
    if (dish) setVid(dish.variants[0].id);
  }, [dish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const v = dish?.variants.find((x) => x.id === vid) ?? dish?.variants[0];

  const confirm = () => {
    if (!dish || !v) return;
    add({ dishId: dish.id, variantId: v.id, name: dish.name, variantLabel: v.label, price: v.price, image: dish.image });
    onClose();
  };

  return (
    <AnimatePresence>
      {dish && v && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div role="dialog" aria-modal
            initial={{ y: 80, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="relative w-full max-w-md overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">
            <button onClick={onClose} aria-label="Закрыть"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white">
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/10] bg-neutral-100">
              <motion.div key={v.id} initial={{ scale: 0.92 }} animate={{ scale: v.id === dish.variants[0].id ? 0.92 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }} className="absolute inset-0">
                <Image src={dish.image} alt={dish.name} fill className="object-cover" sizes="448px" />
              </motion.div>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-black text-neutral-900">{dish.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{dish.description}</p>
              <p className="mt-2 text-xs font-medium text-neutral-400">
                {[v.weight, v.nutrition && `${v.nutrition.kcal} ккал`, v.nutrition && `Б ${v.nutrition.protein} · Ж ${v.nutrition.fat} · У ${v.nutrition.carbs}`]
                  .filter(Boolean).join(" · ")}
              </p>

              {/* Крупный переключатель версий */}
              <div className={`mt-5 rounded-2xl bg-neutral-100 p-1 ${dish.variants.length > 3 ? "grid grid-cols-2 gap-1 sm:grid-cols-3" : "flex"}`}>
                {dish.variants.map((x) => {
                  const active = x.id === v.id;
                  return (
                    <button key={x.id} onClick={() => setVid(x.id)}
                      className={`relative flex-1 rounded-xl px-2 py-3 text-sm font-bold transition-colors ${active ? "text-neutral-900" : "text-neutral-500"}`}>
                      {active && (
                        <motion.span layoutId="variant-pill" className="absolute inset-0 -z-0 rounded-xl bg-white shadow"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }} />
                      )}
                      <span className="relative">{x.label}</span>
                    </button>
                  );
                })}
              </div>

              <motion.button onClick={confirm} whileTap={{ scale: 0.96 }}
                className="mt-5 w-full rounded-full bg-[var(--accent)] py-4 text-base font-extrabold text-[var(--on-accent)] shadow-lg shadow-[var(--accent)]/30">
                Добавить в корзину за{" "}
                <motion.span key={v.price} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
                  {formatPrice(v.price)}
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

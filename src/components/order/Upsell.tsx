// src/components/order/Upsell.tsx — «Вкуснее вместе»: соусы и напитки в 1 клик
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { menu, formatPrice } from "@/config/brand";
import { cartKey, useCart } from "@/store/cart";

const UPSELL_CATEGORIES = ["sauces", "drinks"];

const upsellItems = menu.classic.categories
  .filter((c) => UPSELL_CATEGORIES.includes(c.id))
  .flatMap((c) => c.dishes)
  .filter((d) => d.available !== false);

export default function Upsell() {
  const { items, add } = useCart();

  return (
    <div>
      <h4 className="mb-3 text-base font-extrabold">Вкуснее вместе</h4>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {upsellItems.map((d) => {
          const v = d.variants[0];
          const inCart = items.some((i) => i.key === cartKey(d.id, v.id));
          return (
            <div key={d.id} className="flex w-28 shrink-0 flex-col rounded-2xl bg-neutral-50 p-2 ring-1 ring-black/5">
              <div className="relative mb-2 aspect-square overflow-hidden rounded-xl bg-neutral-200">
                <Image src={d.image} alt={d.name} fill sizes="112px" className="object-cover" />
              </div>
              <p className="line-clamp-1 text-xs font-bold">{d.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500">{formatPrice(v.price)}</span>
                <motion.button
                  whileTap={{ scale: 0.75 }}
                  onClick={() => add({ dishId: d.id, variantId: v.id, name: d.name, variantLabel: v.label, price: v.price, image: d.image })}
                  aria-label={`Добавить ${d.name}`}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${inCart ? "bg-emerald-500 text-white" : "bg-[var(--accent)] text-[var(--on-accent)]"}`}
                >
                  {inCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

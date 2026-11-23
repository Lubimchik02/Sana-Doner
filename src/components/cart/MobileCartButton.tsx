// src/components/cart/MobileCartButton.tsx — плавающая корзина для телефонов
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/config/brand";
import { useCartTotals } from "@/store/cart";

export default function MobileCartButton({ onClick }: { onClick: () => void }) {
  const { count, total } = useCartTotals();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}>
          <motion.button onClick={onClick} whileTap={{ scale: 0.96 }}
            className="flex w-full items-center justify-between rounded-full bg-[var(--accent)] px-6 py-4 font-extrabold text-[var(--on-accent)] shadow-2xl shadow-[var(--accent)]/40 transition-colors duration-700">
            <span className="flex items-center gap-2">
              <span className="relative">
                <ShoppingBag className="h-5 w-5" />
                <motion.span key={count} initial={{ scale: 1.8 }} animate={{ scale: 1 }}
                  className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] text-[var(--brand)]">
                  {count}
                </motion.span>
              </span>
              Корзина
            </span>
            <motion.span key={total} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {formatPrice(total)}
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

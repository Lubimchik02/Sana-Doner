// src/components/cart/CartToast.tsx — мини-уведомление «Добавлено в корзину»
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/store/cart";

export default function CartToast() {
  const { toast, hideToast } = useCart();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hideToast, 1800);
    return () => clearTimeout(t);
  }, [toast, hideToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div key={toast.id}
            initial={{ y: -40, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
            <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
            Добавлено в корзину
            <span className="hidden text-white/50 sm:inline">· {toast.text.split(" — ")[0]}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

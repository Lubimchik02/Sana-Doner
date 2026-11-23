// src/components/demo/DemoBanner.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { DEMO_MODE } from "@/config/brand";

export default function DemoBanner() {
  const [open, setOpen] = useState(true);
  if (!DEMO_MODE) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-50 overflow-hidden bg-neutral-900 text-white"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-10 py-2 text-center text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Демо-версия сайта: заказы не отправляются, это интерактивная презентация
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Скрыть"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

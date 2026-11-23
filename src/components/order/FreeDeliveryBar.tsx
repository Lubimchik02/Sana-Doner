// src/components/order/FreeDeliveryBar.tsx
"use client";

import { motion } from "framer-motion";
import { PartyPopper, Truck } from "lucide-react";
import { brand, formatPrice } from "@/config/brand";

export default function FreeDeliveryBar({ subtotal }: { subtotal: number }) {
  const goal = brand.delivery.freeFrom;
  const done = subtotal >= goal;
  const pct = Math.min(100, (subtotal / goal) * 100);

  return (
    <motion.div
      animate={{ backgroundColor: done ? "#ECFDF5" : "#F5F5F5" }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-4"
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-bold">
        {done ? (
          <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            <PartyPopper className="h-5 w-5 text-emerald-500" />
          </motion.span>
        ) : (
          <Truck className="h-5 w-5 text-neutral-500" />
        )}
        <span className={done ? "text-emerald-700" : "text-neutral-800"}>
          {done ? "Доставка бесплатно!" : <>Ещё {formatPrice(goal - subtotal)} до бесплатной доставки</>}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/10">
        <motion.div
          className="h-full rounded-full"
          initial={false}
          animate={{
            width: `${pct}%`,
            backgroundColor: done ? "#10B981" : "#FF5C00",
            boxShadow: done ? "0 0 12px #10B981" : "0 0 0 transparent",
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}

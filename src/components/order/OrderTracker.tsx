// src/components/order/OrderTracker.tsx — живой трекер статуса заказа.
// Сейчас статусы идут по таймеру (для демо). В боевом режиме сюда можно
// подключить опрос /api/order/[id] или WebSocket — UI менять не нужно.
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bike, CheckCircle2, Flame, PackageCheck, Phone } from "lucide-react";
import { brand, DEMO_MODE, formatPrice } from "@/config/brand";
import type { Fulfillment } from "@/lib/order";

interface Props {
  orderId: number;
  total: number;
  fulfillment: Fulfillment;
  onClose: () => void;
}

const ETA_MIN = 35;
// когда наступает каждый статус (сек от начала) — в демо ускорено
const STEP_AT = DEMO_MODE ? [0, 5, 14] : [0, 120, 900];

export default function OrderTracker({ orderId, total, fulfillment, onClose }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { title: `Заказ №${orderId} принят`, sub: "Мы уже видим ваш заказ", Icon: CheckCircle2 },
    { title: "Готовится на вертеле", sub: "Срезаем мясо, собираем донер", Icon: Flame },
    fulfillment === "delivery"
      ? { title: "Передан курьеру", sub: "Курьер уже в пути", Icon: Bike }
      : { title: "Готов к выдаче", sub: brand.pickup.address, Icon: PackageCheck },
  ];
  const current = STEP_AT.filter((s) => elapsed >= s).length - 1;

  const left = Math.max(0, ETA_MIN * 60 - elapsed);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const ring = 2 * Math.PI * 54;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="flex h-full flex-col items-center px-6 pb-8 pt-10 text-center">
      {/* Таймер-кольцо */}
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F1F1F1" strokeWidth="8" />
          <motion.circle cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={ring}
            animate={{ strokeDashoffset: ring * (left / (ETA_MIN * 60)) }}
            transition={{ duration: 1, ease: "linear" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tabular-nums">{mm}:{ss}</span>
          <span className="text-xs font-medium text-neutral-500">
            {fulfillment === "delivery" ? "до доставки" : "до готовности"}
          </span>
        </div>
      </div>

      <h3 className="mt-6 text-2xl font-black">Спасибо за заказ!</h3>
      <p className="mt-1 text-sm text-neutral-500">Сумма: {formatPrice(total)}</p>

      {/* Шаги */}
      <ol className="mt-8 w-full max-w-sm space-y-0 text-left">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 && (
                <div className="absolute left-5 top-11 h-[calc(100%-2.5rem)] w-0.5 bg-neutral-200">
                  <motion.div className="w-full bg-[var(--accent)]" initial={{ height: 0 }}
                    animate={{ height: done ? "100%" : "0%" }} transition={{ duration: 0.6 }} />
                </div>
              )}
              <motion.div
                animate={{
                  backgroundColor: done || active ? "var(--accent)" : "#F1F1F1",
                  color: done || active ? "var(--on-accent)" : "#A3A3A3",
                  scale: active ? [1, 1.12, 1] : 1,
                }}
                transition={{ scale: { repeat: active ? Infinity : 0, duration: 1.6 } }}
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <s.Icon className="h-5 w-5" />
              </motion.div>
              <div className="pt-1.5">
                <p className={`font-bold ${done || active ? "text-neutral-900" : "text-neutral-400"}`}>{s.title}</p>
                {active && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-neutral-500">
                    {s.sub}
                  </motion.p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto flex w-full max-w-sm flex-col gap-2 pt-8">
        <a href={`tel:${brand.contacts.phoneRaw}`}
          className="flex items-center justify-center gap-2 rounded-full bg-neutral-100 py-3.5 text-sm font-bold">
          <Phone className="h-4 w-4" /> Позвонить в {brand.name}
        </a>
        <button onClick={onClose} className="rounded-full bg-[var(--accent)] py-3.5 text-sm font-bold text-[var(--on-accent)]">
          Вернуться в меню
        </button>
      </div>
    </motion.div>
  );
}

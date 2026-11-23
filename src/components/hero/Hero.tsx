// src/components/hero/Hero.tsx
"use client";

import { motion } from "framer-motion";
import { MapPin, MessageSquareHeart, Truck, UtensilsCrossed } from "lucide-react";
import { brand, formatPrice } from "@/config/brand";
import AnimationSlot from "@/components/slots/AnimationSlot";
import { useUI } from "@/store/ui";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Hero() {
  const openReview = useUI((s) => s.openReview);
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.1fr_1fr] md:pt-16">
      {/* ── Текст ── */}
      <div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="mb-6 flex items-center gap-3">
          {/* Логотип: замените на <Image src="/logo.svg" .../> */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-black text-[var(--on-accent)] transition-colors duration-700">
            S
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[var(--fg)]">{brand.name}</span>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-[var(--fg)] drop-shadow-sm sm:text-6xl">
          {brand.slogan}
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="mt-4 max-w-md text-base text-[var(--fg-muted)] sm:text-lg">
          {brand.description}
        </motion.p>

        {/* Плашка доставки */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="mt-6 rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Truck className="h-4 w-4 text-[var(--brand)] transition-colors duration-700" />
            Бесплатная доставка от {formatPrice(brand.delivery.freeFrom)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {brand.delivery.zones.map((z) => (
              <span key={z.name}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-900/5 px-3 py-1 text-xs font-medium text-neutral-700">
                <MapPin className="h-3 w-3" /> {z.name} · {z.eta}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Кнопки */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          className="mt-7 flex flex-wrap gap-3">
          <a href="#menu"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 font-bold text-[var(--on-accent)] shadow-lg shadow-black/20 transition-all duration-700 hover:scale-[1.03] active:scale-95">
            <UtensilsCrossed className="h-5 w-5" /> Смотреть меню
          </a>
          <button onClick={openReview}
            className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-900/10 bg-white/60 px-6 py-3.5 font-bold text-neutral-900 backdrop-blur transition hover:bg-white active:scale-95">
            <MessageSquareHeart className="h-5 w-5" /> Оставить отзыв
          </button>
        </motion.div>
      </div>

      {/* ── Слоты анимаций ── */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative grid grid-cols-5 items-end gap-4 text-[var(--fg)]">
        <div className="col-span-3">
          {/* SLOT: Анимация девочки */}
          <AnimationSlot
            label="Девочка"
            hint="Положите файл в /public/animations/girl.(json|gif|webm) и передайте его внутрь <AnimationSlot>"
            aspect="aspect-[3/4]"
          />
        </div>
        <div className="col-span-2">
          {/* SLOT: Анимация вертела для мяса */}
          <AnimationSlot
            label="Вертел"
            hint="/public/animations/spit.(json|gif|webm)"
            aspect="aspect-[1/2]"
          />
        </div>
      </motion.div>
    </section>
  );
}

// src/components/menu/MenuSection.tsx
// Один блок меню (classic или healthy). Сообщает в store, какое направление/категория сейчас на экране.
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Dish, MenuSection as Section } from "@/config/brand";
import { useDirection } from "@/store/direction";
import DishCard from "./DishCard";
import AnimationSlot from "@/components/slots/AnimationSlot";

export default function MenuSection({ section, onChooseVariant }: { section: Section; onChooseVariant: (d: Dish) => void }) {
  const ref = useRef<HTMLElement>(null);
  const { setDirection, setActiveCategory } = useDirection();

  // Направление: секция пересекает середину экрана → меняем фон
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setDirection(section.direction),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [section.direction, setDirection]);

  // Категория: та, что под липкой панелью
  useEffect(() => {
    const els = section.categories.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveCategory(e.target.id.replace("cat-", ""))),
      { rootMargin: "-140px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [section.categories, setActiveCategory]);

  return (
    <section ref={ref} id={`section-${section.direction}`} className="mx-auto max-w-6xl px-5 py-12">
      <motion.header initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tight text-[var(--fg)] drop-shadow-sm sm:text-5xl">{section.title}</h2>
        <p className="mt-2 text-[var(--fg-muted)]">{section.subtitle}</p>
      </motion.header>

      {section.categories.map((cat) => (
        <div key={cat.id} id={`cat-${cat.id}`} className="mb-14 scroll-mt-36">
          {cat.id === "combo" && (
            <div className="mb-6 text-[var(--fg)]">
              {/* SLOT: Анимация комбо */}
              <AnimationSlot
                label="Комбо"
                hint="/public/animations/combo.(json|gif|webm) — широкий баннер перед разделом комбо"
                aspect="aspect-[3/1] sm:aspect-[4/1]"
              />
            </div>
          )}

          <h3 className="mb-5 text-xl font-extrabold uppercase text-[var(--fg)] sm:text-2xl">
            {cat.emoji} {cat.title}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {cat.dishes.map((d) => (
              <DishCard key={d.id} dish={d} onChooseVariant={onChooseVariant} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

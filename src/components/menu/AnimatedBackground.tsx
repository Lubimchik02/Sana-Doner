// src/components/menu/AnimatedBackground.tsx
// Фон всей страницы: сверху фирменный красно-оранжевый (Classic menu),
// при прокрутке к Fitness menu плавно перетекает в сине-зелёный и остаётся им до низа сайта.
// Также прокидывает CSS-переменные темы: --accent, --on-accent, --fg, --bg-to и т.д.
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { themes } from "@/config/brand";
import { useDirection } from "@/store/direction";

export default function AnimatedBackground() {
  const direction = useDirection((s) => s.direction);
  const t = themes[direction];

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--accent", t.accent);
    root.setProperty("--accent-soft", t.accentSoft);
    root.setProperty("--on-accent", t.onAccent);
    root.setProperty("--fg", t.fg);
    root.setProperty("--fg-muted", t.fgMuted);
    root.setProperty("--bg-from", t.bgFrom);
    root.setProperty("--bg-to", t.bgTo);
    // цвет панели браузера на телефоне
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.bgFrom);
  }, [t]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Слой Classic и слой Fitness — плавный кроссфейд между ними */}
      <motion.div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${themes.classic.bgFrom} 0%, ${themes.classic.bgTo} 100%)` }}
        animate={{ opacity: direction === "classic" ? 1 : 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${themes.healthy.bgFrom} 0%, ${themes.healthy.bgTo} 100%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: direction === "healthy" ? 1 : 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />

      {/* Мягкие переливающиеся блики */}
      <motion.div
        className="absolute -left-32 top-[8%] h-[30rem] w-[30rem] rounded-full bg-white blur-3xl"
        style={{ opacity: 0.14 }}
        animate={{ x: [0, 70, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-[55%] h-[26rem] w-[26rem] rounded-full blur-3xl"
        animate={{ backgroundColor: t.accent, x: [0, -60, 0], y: [0, -30, 0] }}
        transition={{ backgroundColor: { duration: 1 }, x: { duration: 14, repeat: Infinity }, y: { duration: 18, repeat: Infinity } }}
        style={{ opacity: 0.18 }}
      />
    </div>
  );
}

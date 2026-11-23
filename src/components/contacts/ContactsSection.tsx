// src/components/contacts/ContactsSection.tsx — «Связаться с нами» + «Мы на карте» + подвал
"use client";

import { motion } from "framer-motion";
import { Clock, Instagram, MapPin, MessageCircle, MessageSquareHeart, Navigation, Phone } from "lucide-react";
import { brand, DEMO_MODE, whatsappLink } from "@/config/brand";
import { useUI } from "@/store/ui";

const { contacts, pickup } = brand;

const mapSrc =
  pickup.mapEmbed ||
  `https://yandex.ru/map-widget/v1/?ll=${pickup.lng},${pickup.lat}&z=16&pt=${pickup.lng},${pickup.lat},pm2rdm`;

const buttons = [
  { label: "WhatsApp", sub: "Ответим за минуту", href: whatsappLink("Здравствуйте! "), Icon: MessageCircle, bg: "#25D366" },
  { label: "Позвонить", sub: contacts.phone, href: `tel:${contacts.phoneRaw}`, Icon: Phone, bg: "#1A1A1A" },
  { label: "Instagram", sub: `@${contacts.instagram}`, href: `https://instagram.com/${contacts.instagram}`, Icon: Instagram,
    bg: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)" },
  { label: "2GIS", sub: "Маршрут до нас", href: contacts.twoGis, Icon: Navigation, bg: "#29A33E" },
];

export default function ContactsSection() {
  const openReview = useUI((s) => s.openReview);

  return (
    <section id="contacts" className="mx-auto max-w-6xl px-5 py-16">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mb-8 text-3xl font-black uppercase tracking-tight text-[var(--fg)] sm:text-5xl">
        Связаться с нами
      </motion.h2>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* ── Кнопки + инфо ── */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            {buttons.map(({ label, sub, href, Icon, bg }, i) => (
              <motion.a key={label} href={href} target="_blank" rel="noreferrer"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                style={{ background: bg }}
                className="flex flex-col justify-between gap-6 rounded-3xl p-5 text-white shadow-lg transition-shadow hover:shadow-xl">
                <Icon className="h-7 w-7" />
                <div>
                  <p className="text-lg font-extrabold leading-tight">{label}</p>
                  <p className="truncate text-xs text-white/80">{sub}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="space-y-4 rounded-3xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Самовывоз</p>
                <p className="font-bold">{pickup.address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Режим работы</p>
                <p className="font-bold">{pickup.hours}</p>
              </div>
            </div>
            <motion.button onClick={openReview} whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-neutral-900/10 py-3 font-bold transition hover:bg-neutral-50">
              <MessageSquareHeart className="h-5 w-5 text-[var(--brand)]" /> Оставить отзыв
            </motion.button>
          </div>
        </div>

        {/* ── Карта ── */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="relative min-h-[320px] overflow-hidden rounded-3xl bg-neutral-200 shadow-sm ring-1 ring-black/5 lg:min-h-0">
          {/* SLOT: Виджет карты (2GIS / Яндекс). Меняется через brand.pickup.mapEmbed */}
          <iframe src={mapSrc} title="Карта" loading="lazy" className="absolute inset-0 h-full w-full border-0" allowFullScreen />
        </motion.div>
      </div>

      {/* ── Подвал ── */}
      <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-6 text-sm text-[var(--fg-muted)] sm:flex-row">
        <p>© {new Date().getFullYear()} {brand.name} · {brand.city}</p>
        {DEMO_MODE && <p className="text-xs">Демо-версия сайта</p>}
      </footer>
    </section>
  );
}

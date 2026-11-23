// src/components/order/CheckoutForm.tsx — простая форма в стиле Yakuza Food
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Bike, CreditCard, MapPin, Store, Wallet } from "lucide-react";
import { brand } from "@/config/brand";
import { formatPhone, PAYMENTS, type OrderForm, type Payment } from "@/lib/order";

const PAY_ICONS: Record<Payment, typeof Wallet> = {
  kaspi_transfer: Wallet,
  kaspi_red: CreditCard,
  cash: Banknote,
};

const input =
  "w-full rounded-2xl border-0 bg-neutral-100 px-4 py-3.5 text-[15px] font-medium outline-none ring-2 ring-transparent transition placeholder:text-neutral-400 focus:bg-white focus:ring-[var(--accent)]";

interface Props {
  form: OrderForm;
  set: <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => void;
  errors: Partial<Record<keyof OrderForm, boolean>>;
}

export default function CheckoutForm({ form, set, errors }: Props) {
  const err = (k: keyof OrderForm) => (errors[k] ? "!ring-red-400 bg-red-50" : "");

  return (
    <div className="space-y-4">
      {/* Доставка / Самовывоз */}
      <div className="flex rounded-2xl bg-neutral-100 p-1">
        {([
          { id: "delivery", label: "Доставка", Icon: Bike },
          { id: "pickup", label: "Самовывоз", Icon: Store },
        ] as const).map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => set("fulfillment", id)}
            className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${form.fulfillment === id ? "text-neutral-900" : "text-neutral-500"}`}>
            {form.fulfillment === id && (
              <motion.span layoutId="fulfillment-pill" className="absolute inset-0 rounded-xl bg-white shadow"
                transition={{ type: "spring", stiffness: 450, damping: 32 }} />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <input className={`${input} ${err("name")}`} placeholder="Ваше имя" autoComplete="given-name"
        value={form.name} onChange={(e) => set("name", e.target.value)} />

      <input className={`${input} ${err("phone")}`} placeholder="+7 (7__) ___-__-__" inputMode="tel" autoComplete="tel"
        value={form.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} />

      <AnimatePresence mode="wait" initial={false}>
        {form.fulfillment === "delivery" ? (
          <motion.div key="delivery" className="space-y-4"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className={`flex flex-wrap gap-2 rounded-2xl p-0.5 ${errors.zone ? "ring-2 ring-red-400" : ""}`}>
              {brand.delivery.zones.map((z) => {
                const active = form.zone === z.name;
                return (
                  <motion.button key={z.name} type="button" whileTap={{ scale: 0.95 }} onClick={() => set("zone", z.name)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-[var(--accent)] text-[var(--on-accent)]" : "bg-neutral-100 text-neutral-700"}`}>
                    {z.name}
                  </motion.button>
                );
              })}
            </div>
            <input className={`${input} ${err("address")}`} placeholder="Улица, дом, квартира, подъезд" autoComplete="street-address"
              value={form.address} onChange={(e) => set("address", e.target.value)} />
          </motion.div>
        ) : (
          <motion.div key="pickup"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)]">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{brand.pickup.address}</p>
                <p className="text-xs text-neutral-500">{brand.pickup.hours}</p>
              </div>
              <a href={brand.contacts.twoGis} target="_blank" rel="noreferrer"
                className="shrink-0 rounded-full bg-[#29A33E] px-3 py-2 text-xs font-bold text-white">2GIS</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <textarea className={`${input} min-h-[72px] resize-none`} placeholder="Комментарий: без лука, позвонить заранее…"
        value={form.comment} onChange={(e) => set("comment", e.target.value)} />

      {/* Оплата */}
      <div className="grid grid-cols-3 gap-2">
        {PAYMENTS.map((p) => {
          const Icon = PAY_ICONS[p.id];
          const active = form.payment === p.id;
          return (
            <motion.button key={p.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => set("payment", p.id)}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-colors ${active ? "border-[var(--accent)] bg-[var(--accent-soft)]/30" : "border-transparent bg-neutral-100"}`}>
              <Icon className={`h-6 w-6 ${active ? "text-[var(--brand)]" : "text-neutral-500"}`} />
              <span className="text-xs font-bold leading-tight">{p.title}</span>
              <span className="text-[10px] leading-tight text-neutral-500">{p.note}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

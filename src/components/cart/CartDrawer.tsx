// src/components/cart/CartDrawer.tsx — выезжающая корзина: товары → допродажа → форма → трекер
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { brand, formatPrice } from "@/config/brand";
import { useCart } from "@/store/cart";
import {
  calcDeliveryFee, isPhoneValid, openWhatsApp, submitOrder,
  type OrderForm, type OrderPayload,
} from "@/lib/order";
import FreeDeliveryBar from "@/components/order/FreeDeliveryBar";
import Upsell from "@/components/order/Upsell";
import CheckoutForm from "@/components/order/CheckoutForm";
import OrderTracker from "@/components/order/OrderTracker";

const EMPTY_FORM: OrderForm = {
  fulfillment: "delivery", name: "", phone: "", zone: "", address: "", comment: "", payment: "kaspi_transfer",
};

type Errors = Partial<Record<keyof OrderForm, boolean>>;

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, inc, dec, clear } = useCart();
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState(""); // скрытое поле-ловушка для ботов
  const [placed, setPlaced] = useState<{ id: number; total: number; fulfillment: OrderForm["fulfillment"] } | null>(null);

  // блокируем скролл страницы
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const deliveryFee = calcDeliveryFee(form.fulfillment, form.zone, subtotal);
  const total = subtotal + deliveryFee;

  const set = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: false }));
  };

  const validate = () => {
    const e: Errors = {
      name: !form.name.trim(),
      phone: !isPhoneValid(form.phone),
      zone: form.fulfillment === "delivery" && !form.zone,
      address: form.fulfillment === "delivery" && !form.address.trim(),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const payload = (): OrderPayload => ({ ...form, items, subtotal, deliveryFee, total });

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    setSubmitError("");
    try {
      const res = await submitOrder(payload(), honeypot);
      setPlaced({ id: res.id, total: res.total, fulfillment: form.fulfillment });
      clear();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Не получилось отправить заказ. Попробуйте через WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  const handleWhatsApp = () => validate() && openWhatsApp(payload());

  const close = () => {
    onClose();
    if (placed) setTimeout(() => { setPlaced(null); setForm(EMPTY_FORM); }, 400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Шапка */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="text-xl font-black">{placed ? "Статус заказа" : "Корзина"}</h2>
              <button onClick={close} aria-label="Закрыть" className="rounded-full p-2 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {placed ? (
              <div className="flex-1 overflow-y-auto">
                <OrderTracker orderId={placed.id} total={placed.total} fulfillment={placed.fulfillment} onClose={close} />
              </div>
            ) : items.length === 0 ? (
              /* Пусто */
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                  <ShoppingBag className="h-14 w-14 text-neutral-300" />
                </motion.div>
                <p className="text-lg font-bold">Пока пусто</p>
                <p className="text-sm text-neutral-500">Добавьте донер — мы уже разогреваем вертел</p>
                <button onClick={close} className="mt-2 rounded-full bg-[var(--accent)] px-6 py-3 font-bold text-[var(--on-accent)]">
                  В меню
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                  <FreeDeliveryBar subtotal={subtotal} />

                  {/* Товары */}
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((i) => (
                        <motion.li key={i.key} layout
                          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30, height: 0 }}
                          className="flex items-center gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                            <Image src={i.image} alt={i.name} fill sizes="64px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{i.name}</p>
                            <p className="text-xs text-neutral-500">{i.variantLabel}</p>
                            <p className="mt-0.5 text-sm font-extrabold">{formatPrice(i.price * i.qty)}</p>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1">
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => dec(i.key)} aria-label="Меньше"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                              <Minus className="h-3.5 w-3.5" />
                            </motion.button>
                            <span className="w-4 text-center text-sm font-bold">{i.qty}</span>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={() => inc(i.key)} aria-label="Больше"
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                              <Plus className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <Upsell />

                  <div>
                    <h4 className="mb-3 text-base font-extrabold">Оформление</h4>
                    <CheckoutForm form={form} set={set} errors={errors} />
                  </div>

                  {/* Итоги */}
                  <div className="space-y-1.5 rounded-2xl bg-neutral-50 p-4 text-sm">
                    <div className="flex justify-between"><span className="text-neutral-500">Товары</span><span>{formatPrice(subtotal)}</span></div>
                    {form.fulfillment === "delivery" && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Доставка</span>
                        <span className={deliveryFee ? "" : "font-bold text-emerald-600"}>
                          {!form.zone ? "выберите район" : deliveryFee ? formatPrice(deliveryFee) : "бесплатно"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 text-base font-black"><span>Итого</span><span>{formatPrice(total)}</span></div>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="space-y-2 border-t border-neutral-100 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  {/* Honeypot: невидимо для людей, боты заполняют */}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden
                    value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <AnimatePresence>
                    {submitError && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-center text-sm font-semibold text-red-500">{submitError}</motion.p>
                    )}
                  </AnimatePresence>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-4 text-base font-extrabold text-[var(--on-accent)] shadow-lg shadow-[var(--accent)]/30 disabled:opacity-70">
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Оформить заказ • {formatPrice(total)}</>}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleWhatsApp}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-extrabold text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.2.5.2.5.4.1.1.1.7-.1 1.4Z" />
                    </svg>
                    Заказать через WhatsApp
                  </motion.button>
                  <p className="pt-1 text-center text-[11px] text-neutral-400">
                    {brand.pickup.hours} · {brand.contacts.phone}
                  </p>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

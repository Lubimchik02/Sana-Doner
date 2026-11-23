// src/lib/order.ts — типы заказа, маска телефона, текст для WhatsApp, отправка
import { brand, DEMO_MODE, formatPrice, whatsappLink } from "@/config/brand";
import type { CartItem } from "@/store/cart";

export type Fulfillment = "delivery" | "pickup";
export type Payment = "kaspi_transfer" | "kaspi_red" | "cash";

export const PAYMENTS: { id: Payment; title: string; note: string }[] = [
  { id: "kaspi_transfer", title: "Kaspi Перевод", note: "Ссылка на оплату придёт после подтверждения" },
  { id: "kaspi_red", title: "Kaspi Red", note: "Рассрочка без переплат" },
  { id: "cash", title: "Наличными", note: "При получении" },
];

export interface OrderForm {
  fulfillment: Fulfillment;
  name: string;
  phone: string; // в формате маски
  zone: string; // название района
  address: string;
  comment: string;
  payment: Payment;
}

export interface OrderPayload extends OrderForm {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

/* ── Маска +7 (7__) ___-__-__ ── */
export function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8") || d.startsWith("7")) d = d.slice(1); // убираем код страны
  d = d.slice(0, 10);
  if (!d) return "";
  let out = "+7 (" + d.slice(0, 3);
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += "-" + d.slice(6, 8);
  if (d.length > 8) out += "-" + d.slice(8, 10);
  return out;
}
// 11 цифр и мобильный код КЗ (7XX) — та же проверка, что и на сервере
export const isPhoneValid = (p: string) => /^77\d{9}$/.test(p.replace(/\D/g, ""));

/* ── Стоимость доставки ── */
export function calcDeliveryFee(f: Fulfillment, zoneName: string, subtotal: number) {
  if (f === "pickup") return 0;
  const zone = brand.delivery.zones.find((z) => z.name === zoneName);
  if (!zone) return 0;
  return subtotal >= zone.freeFrom ? 0 : zone.price;
}

/* ── Красивый текст заказа для WhatsApp ── */
export function buildWhatsAppText(o: OrderPayload, orderId?: number) {
  const pay = PAYMENTS.find((p) => p.id === o.payment)?.title;
  const lines = [
    `🌯 *Заказ${orderId ? ` №${orderId}` : ""} — ${brand.name}*`,
    "",
    ...o.items.map((i) => `• ${i.name} (${i.variantLabel}) × ${i.qty} — ${formatPrice(i.price * i.qty)}`),
    "",
    `Сумма: ${formatPrice(o.subtotal)}`,
    o.fulfillment === "delivery"
      ? `Доставка: ${o.deliveryFee ? formatPrice(o.deliveryFee) : "бесплатно"}`
      : "Самовывоз",
    `*Итого: ${formatPrice(o.total)}*`,
    "",
    `👤 ${o.name}`,
    `📞 ${o.phone}`,
    o.fulfillment === "delivery" ? `📍 ${o.zone}, ${o.address}` : `📍 Самовывоз: ${brand.pickup.address}`,
    `💳 ${pay}`,
    o.comment && `💬 ${o.comment}`,
  ];
  return lines.filter((l) => typeof l === "string").join("\n").trim();
}

export const openWhatsApp = (o: OrderPayload) =>
  window.open(whatsappLink(buildWhatsAppText(o)), "_blank");

/* ── Отправка заказа ── */
// В браузере считаем сумму только для отображения. На сервер уходят лишь ID и количество —
// цены и итог сервер пересчитывает сам по brand.ts и возвращает настоящий total.
export async function submitOrder(o: OrderPayload, honeypot = ""): Promise<{ id: number; total: number }> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 900)); // имитация сети
    return { id: 100 + Math.floor(Math.random() * 900), total: o.total };
  }
  const res = await fetch("/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fulfillment: o.fulfillment,
      name: o.name,
      phone: o.phone,
      zone: o.zone,
      address: o.address,
      comment: o.comment,
      payment: o.payment,
      items: o.items.map((i) => ({ dishId: i.dishId, variantId: i.variantId, qty: i.qty })),
      website: honeypot,
    }),
  });
  const data: unknown = await res.json().catch(() => ({}));
  const rec = (typeof data === "object" && data !== null ? data : {}) as { id?: unknown; total?: unknown; error?: unknown };
  if (!res.ok || typeof rec.id !== "number" || typeof rec.total !== "number") {
    throw new Error(typeof rec.error === "string" ? rec.error : "Не удалось отправить заказ");
  }
  return { id: rec.id, total: rec.total };
}

// src/app/api/order/route.ts — защищённый приём заказа
//
// Порядок проверок:
// 1. Режим  → в демо API выключен
// 2. Источник (Origin)  → только свой сайт
// 3. Размер тела  → ≤ 16 КБ
// 4. Rate limit  → ≤ 3 заказа / 10 мин с одного IP
// 5. Honeypot  → скрытое поле, которое заполняют только боты
// 6. Валидация и очистка всех полей
// 7. Пересчёт цен строго по brand.ts
// 8. Чек в Telegram
import { brand, DEMO_MODE, formatPrice } from "@/config/brand";
import { PAYMENTS } from "@/lib/order";
import { priceOrder, type PricedOrder } from "@/lib/server/pricing";
import {
  bodyTooLarge, cleanText, escapeHtml, getClientIp, isSameOrigin, json, normalizeKzPhone, rateLimit,
} from "@/lib/server/security";
import { sendTelegramMessage, telegramConfigured } from "@/lib/server/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_LIMIT = 3;
const ORDER_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY = 16 * 1024;

// Номер заказа. В памяти процесса — после перезапуска начнётся заново.
// Для сквозной нумерации подключите БД (Supabase / Postgres) и берите id оттуда.
let orderSeq = 100;

export async function POST(req: Request) {
  if (DEMO_MODE) return json({ error: "Демо-режим: заказы не принимаются" }, 403);
  if (!isSameOrigin(req)) return json({ error: "Запрещено" }, 403);
  if (bodyTooLarge(req, MAX_BODY)) return json({ error: "Слишком большой запрос" }, 413);

  const ip = getClientIp(req);
  const rl = rateLimit(`order:${ip}`, ORDER_LIMIT, ORDER_WINDOW_MS);
  if (!rl.ok) {
    return json(
      { error: `Слишком много заказов. Попробуйте через ${Math.ceil(rl.retryAfter / 60)} мин или напишите в WhatsApp.` },
      429,
      { "Retry-After": String(rl.retryAfter) },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Некорректный запрос" }, 400);
  }

  // Honeypot: настоящий покупатель это поле не видит и не заполняет
  if (typeof body.website === "string" && body.website.length > 0) {
    return json({ id: 0, total: 0 }); // делаем вид, что всё ок — бот не узнает, что его поймали
  }

  /* ── Валидация полей ── */
  const fulfillment = body.fulfillment === "pickup" ? "pickup" : body.fulfillment === "delivery" ? "delivery" : null;
  const payment = PAYMENTS.find((p) => p.id === body.payment);
  const name = cleanText(body.name, 40);
  const phone = normalizeKzPhone(body.phone);
  const zone = cleanText(body.zone, 40);
  const address = cleanText(body.address, 160);
  const comment = cleanText(body.comment, 300, true);

  const errors: string[] = [];
  if (!fulfillment) errors.push("способ получения");
  if (!payment) errors.push("способ оплаты");
  if (name.length < 2) errors.push("имя");
  if (!phone) errors.push("телефон");
  if (fulfillment === "delivery" && address.length < 5) errors.push("адрес");
  if (errors.length) return json({ error: `Проверьте поля: ${errors.join(", ")}` }, 422);

  /* ── Цены: только сервер ── */
  const priced = priceOrder(body.items, fulfillment!, zone);
  if (!priced.ok) return json({ error: priced.error }, 422);

  const id = ++orderSeq;

  const receipt = buildReceipt({
    id, order: priced.order, fulfillment: fulfillment!, name, phone: phone!, zone, address, comment,
    paymentTitle: payment!.title, ip,
  });

  if (!telegramConfigured()) {
    console.error("[order] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы — заказ не доставлен", id);
    return json({ error: "Приём заказов временно недоступен. Закажите через WhatsApp." }, 503);
  }
  const sent = await sendTelegramMessage(receipt, "orders");
  if (!sent) return json({ error: "Не удалось передать заказ на кухню. Закажите через WhatsApp." }, 502);

  return json({ id, total: priced.order.total });
}

/* ───────────── Чек для Telegram ───────────── */

function buildReceipt(p: {
  id: number; order: PricedOrder; fulfillment: "delivery" | "pickup";
  name: string; phone: string; zone: string; address: string; comment: string; paymentTitle: string; ip: string;
}) {
  const e = escapeHtml;
  const time = new Date().toLocaleString("ru-RU", { timeZone: brand.timeZone, hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  const tel = p.phone.replace(/\D/g, "");

  return [
    `🧾 <b>Заказ №${p.id}</b> · ${e(brand.name)}`,
    `🕒 ${time}`,
    "━━━━━━━━━━━━━━",
    ...p.order.lines.map((l) => `• ${e(l.name)} <i>(${e(l.variantLabel)})</i>\n   ${l.qty} × ${formatPrice(l.unitPrice)} = <b>${formatPrice(l.sum)}</b>`),
    "━━━━━━━━━━━━━━",
    `Товары: ${formatPrice(p.order.subtotal)}`,
    p.fulfillment === "delivery"
      ? `Доставка: ${p.order.deliveryFee ? formatPrice(p.order.deliveryFee) : "бесплатно"}`
      : "Самовывоз",
    `💰 <b>ИТОГО: ${formatPrice(p.order.total)}</b>`,
    `💳 ${e(p.paymentTitle)}`,
    "",
    `👤 ${e(p.name)}`,
    `📞 <a href="tel:+${tel}">${e(p.phone)}</a> · <a href="https://wa.me/${tel}">WhatsApp</a>`,
    p.fulfillment === "delivery" ? `🛵 ${e(p.zone)}, ${e(p.address)}` : `🏪 Самовывоз: ${e(brand.pickup.address)}`,
    p.comment ? `💬 ${e(p.comment)}` : "",
    "",
    `<tg-spoiler>IP: ${e(p.ip)}</tg-spoiler>`,
  ].filter(Boolean).join("\n");
}

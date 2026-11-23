// src/lib/server/pricing.ts — пересчёт заказа ТОЛЬКО по brand.ts.
// Цены, названия и итоговые суммы из браузера полностью игнорируются.
import "server-only";
import { brand, findDish } from "@/config/brand";

export const MAX_LINES = 30; // разных позиций в заказе
export const MAX_QTY = 20; // штук одной позиции

export interface PricedLine {
  dishId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  qty: number;
  sum: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

type PriceResult = { ok: true; order: PricedOrder } | { ok: false; error: string };

export function priceOrder(rawItems: unknown, fulfillment: "delivery" | "pickup", zoneName: string): PriceResult {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return { ok: false, error: "Корзина пуста" };
  if (rawItems.length > MAX_LINES) return { ok: false, error: "Слишком много позиций" };

  // Склеиваем дубли (на случай подделанного запроса с одинаковыми позициями)
  const merged = new Map<string, { dishId: string; variantId: string; qty: number }>();

  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) return { ok: false, error: "Некорректная позиция" };
    const { dishId, variantId, qty } = raw as Record<string, unknown>;
    if (typeof dishId !== "string" || typeof variantId !== "string") return { ok: false, error: "Некорректная позиция" };
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return { ok: false, error: "Некорректное количество" };
    }
    const key = `${dishId}:${variantId}`;
    const prev = merged.get(key);
    merged.set(key, { dishId, variantId, qty: Math.min(MAX_QTY, (prev?.qty ?? 0) + qty) });
  }

  const lines: PricedLine[] = [];
  for (const { dishId, variantId, qty } of merged.values()) {
    const dish = findDish(dishId);
    const variant = dish?.variants.find((v) => v.id === variantId);
    if (!dish || !variant) return { ok: false, error: "Блюдо не найдено в меню" };
    if (dish.available === false) return { ok: false, error: `«${dish.name}» временно недоступно` };
    lines.push({
      dishId, variantId, qty,
      name: dish.name,
      variantLabel: variant.label,
      unitPrice: variant.price,
      sum: variant.price * qty,
    });
  }

  const subtotal = lines.reduce((n, l) => n + l.sum, 0);

  let deliveryFee = 0;
  if (fulfillment === "delivery") {
    const zone = brand.delivery.zones.find((z) => z.name === zoneName);
    if (!zone) return { ok: false, error: "Выберите район доставки" };
    deliveryFee = subtotal >= zone.freeFrom ? 0 : zone.price;
  }

  return { ok: true, order: { lines, subtotal, deliveryFee, total: subtotal + deliveryFee } };
}

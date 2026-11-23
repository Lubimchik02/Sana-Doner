// src/app/api/review/route.ts — защищённый приём отзывов
// Проверки: режим → Origin → размер → rate limit → honeypot → оценки/текст → фото (тип по сигнатуре, размер, количество)
import { brand, DEMO_MODE } from "@/config/brand";
import {
  bodyTooLarge, cleanText, escapeHtml, getClientIp, isSameOrigin, json, rateLimit,
} from "@/lib/server/security";
import { sendTelegramMessage, sendTelegramPhotos, telegramConfigured } from "@/lib/server/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_LIMIT = 3;
const REVIEW_WINDOW_MS = 60 * 60 * 1000; // 3 отзыва в час с IP
const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 МБ на фото
const MAX_BODY = MAX_PHOTOS * MAX_PHOTO_BYTES + 64 * 1024;

const CRITERIA: Record<string, string> = {
  taste: "Вкус еды", speed: "Скорость доставки", package: "Упаковка", courier: "Курьер", service: "Сервис",
};

/** Определяем реальный тип файла по первым байтам, а не по расширению/заявленному MIME */
function sniffImage(b: Uint8Array): "jpg" | "png" | "webp" | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}

export async function POST(req: Request) {
  if (DEMO_MODE) return json({ error: "Демо-режим" }, 403);
  if (!isSameOrigin(req)) return json({ error: "Запрещено" }, 403);
  if (bodyTooLarge(req, MAX_BODY)) return json({ error: "Файлы слишком большие" }, 413);

  const ip = getClientIp(req);
  const rl = rateLimit(`review:${ip}`, REVIEW_LIMIT, REVIEW_WINDOW_MS);
  if (!rl.ok) return json({ error: "Слишком много отзывов, попробуйте позже" }, 429, { "Retry-After": String(rl.retryAfter) });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return json({ error: "Некорректный запрос" }, 400);
  }

  if (String(fd.get("website") ?? "").length > 0) return json({ ok: true }); // honeypot

  /* ── Оценки ── */
  let rawRatings: unknown;
  try {
    rawRatings = JSON.parse(String(fd.get("ratings") ?? "{}"));
  } catch {
    return json({ error: "Некорректные оценки" }, 400);
  }
  const ratings: [string, number][] = [];
  if (typeof rawRatings === "object" && rawRatings !== null) {
    for (const [k, v] of Object.entries(rawRatings as Record<string, unknown>)) {
      if (k in CRITERIA && typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5) ratings.push([k, v]);
    }
  }
  if (ratings.length === 0) return json({ error: "Поставьте хотя бы одну оценку" }, 422);

  const name = cleanText(fd.get("name"), 40);
  const comment = cleanText(fd.get("comment"), 1000, true);

  /* ── Фото ── */
  const files = fd.getAll("photos").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f);
  if (files.length > MAX_PHOTOS) return json({ error: `Не больше ${MAX_PHOTOS} фото` }, 422);

  const photos: { data: Blob; name: string }[] = [];
  for (const [i, f] of files.entries()) {
    if (f.size === 0) continue;
    if (f.size > MAX_PHOTO_BYTES) return json({ error: "Каждое фото — не больше 5 МБ" }, 422);
    const bytes = new Uint8Array(await f.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) return json({ error: "Можно загружать только JPG, PNG или WebP" }, 422);
    // Пересобираем Blob с безопасным именем и правильным типом — исходное имя файла не используем
    photos.push({ data: new Blob([bytes], { type: `image/${kind === "jpg" ? "jpeg" : kind}` }), name: `review-${i + 1}.${kind}` });
  }

  /* ── Telegram ── */
  if (!telegramConfigured()) {
    console.error("[review] Telegram не настроен — отзыв не доставлен");
    return json({ error: "Отзывы временно не принимаются" }, 503);
  }

  const avg = ratings.reduce((n, [, v]) => n + v, 0) / ratings.length;
  const e = escapeHtml;
  const html = [
    `⭐ <b>Новый отзыв</b> · ${e(brand.name)}`,
    `Средняя оценка: <b>${avg.toFixed(1)}</b> / 5`,
    "━━━━━━━━━━━━━━",
    ...ratings.map(([k, v]) => `${CRITERIA[k]}: ${"★".repeat(v)}${"☆".repeat(5 - v)}`),
    "━━━━━━━━━━━━━━",
    name ? `👤 ${e(name)}` : "👤 Без имени",
    comment ? `💬 ${e(comment)}` : "",
    photos.length ? `📷 Фото: ${photos.length}` : "",
  ].filter(Boolean).join("\n");

  const ok = await sendTelegramMessage(html, "reviews");
  if (!ok) return json({ error: "Не удалось отправить отзыв" }, 502);
  if (photos.length) await sendTelegramPhotos(photos, "reviews");

  return json({ ok: true });
}

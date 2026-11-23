// src/lib/server/telegram.ts — отправка сообщений и фото в Telegram-бот владельца
import "server-only";

const TIMEOUT_MS = 8000;

function config(kind: "orders" | "reviews") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId =
    kind === "reviews"
      ? process.env.TELEGRAM_CHAT_ID_REVIEWS || process.env.TELEGRAM_CHAT_ID
      : process.env.TELEGRAM_CHAT_ID;
  return token && chatId ? { api: `https://api.telegram.org/bot${token}`, chatId } : null;
}

export const telegramConfigured = () => config("orders") !== null;

async function call(url: string, init: RequestInit): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) console.error("[telegram]", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[telegram] network error", e);
    return false;
  } finally {
    clearTimeout(t);
  }
}

/** Текст должен быть уже экранирован через escapeHtml() */
export async function sendTelegramMessage(html: string, kind: "orders" | "reviews" = "orders") {
  const cfg = config(kind);
  if (!cfg) return false;
  return call(`${cfg.api}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: cfg.chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
  });
}

/** До 10 фото одним альбомом */
export async function sendTelegramPhotos(photos: { data: Blob; name: string }[], kind: "orders" | "reviews" = "reviews") {
  const cfg = config(kind);
  if (!cfg || photos.length === 0) return false;

  const form = new FormData();
  form.append("chat_id", cfg.chatId);
  form.append(
    "media",
    JSON.stringify(photos.map((_, i) => ({ type: "photo", media: `attach://p${i}` }))),
  );
  photos.forEach((p, i) => form.append(`p${i}`, p.data, p.name));
  return call(`${cfg.api}/sendMediaGroup`, { method: "POST", body: form });
}

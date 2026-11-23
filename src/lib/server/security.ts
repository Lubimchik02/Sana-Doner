// src/lib/server/security.ts — общие механизмы защиты API.
// Только для сервера: не импортируйте этот файл в клиентские компоненты.
import "server-only";

/* ───────────── IP клиента ───────────── */

export function getClientIp(req: Request): string {
  // За Vercel / Nginx реальный IP приходит в x-forwarded-for (первый адрес)
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* ───────────── Rate limiting ───────────── */
// Скользящее окно в памяти процесса. Для одного сервера / одного инстанса этого хватает.
// При нескольких инстансах (масштабирование на Vercel) замените хранилище на Upstash Redis —
// сигнатура rateLimit() останется той же.

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((hits[0] + windowMs - now) / 1000) };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Периодическая уборка, чтобы Map не рос бесконечно
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
    });
  }
  return { ok: true, retryAfter: 0 };
}

/* ───────────── Проверка источника (CSRF) ───────────── */
// Принимаем запросы только со своего сайта. Простой и надёжный барьер от
// «чужих» страниц, которые пытаются слать заказы от имени посетителя.

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ───────────── Ограничение размера тела ───────────── */

export function bodyTooLarge(req: Request, maxBytes: number): boolean {
  const len = Number(req.headers.get("content-length") ?? 0);
  return !Number.isFinite(len) || len > maxBytes;
}

/* ───────────── Очистка строк (XSS) ───────────── */

/**
 * Приводит пользовательский ввод к безопасному виду:
 * — только строка, обрезка по длине
 * — удаляются HTML-теги, управляющие символы, невидимые символы направления текста
 * — схлопываются лишние пробелы
 */
export function cleanText(input: unknown, maxLen: number, multiline = false): string {
  if (typeof input !== "string") return "";
  let s = input.normalize("NFC");
  s = s.replace(/<[^>]*>/g, ""); // теги
  s = s.replace(/[<>]/g, ""); // одиночные скобки
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""); // управляющие
  s = s.replace(/[​-‏‪-‮⁦-⁩]/g, ""); // невидимые / bidi
  s = s.replace(/javascript:|data:text\/html|vbscript:/gi, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, maxLen);
}

/** Экранирование для Telegram parse_mode=HTML */
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Телефон Казахстана: возвращает «+7 (7XX) XXX-XX-XX» или null */
export function normalizeKzPhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let d = input.replace(/\D/g, "");
  if (d.length === 11 && (d.startsWith("7") || d.startsWith("8"))) d = d.slice(1);
  if (d.length !== 10 || !d.startsWith("7")) return null; // мобильные КЗ: 7XX
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
}

/* ───────────── Ответы ───────────── */

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });

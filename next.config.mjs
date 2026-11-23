// next.config.mjs — заголовки безопасности
/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Карты, которые разрешено встраивать (блок «Мы на карте»)
const MAP_FRAMES = [
  "https://yandex.ru",
  "https://yandex.kz",
  "https://*.yandex.ru",
  "https://widgets.2gis.com",
  "https://*.2gis.com",
  "https://*.2gis.kz",
];

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' нужен для встроенных скриптов гидрации Next.js; 'unsafe-eval' — только в dev
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Framer Motion и Tailwind пишут инлайн-стили
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  `frame-src ${MAP_FRAMES.join(" ")}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // не светим «X-Powered-By: Next.js»
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;

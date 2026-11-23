import type { NextConfig } from "next";

/*
 * Security headers applied to every route.
 *
 * Content-Security-Policy (ADR-018): payment happens on Stripe's hosted page (a top-level
 * navigation), so no Stripe script, frame or connection is needed here. Scripts are limited to our
 * own origin; inline scripts must stay allowed because a nonce would force every page to render
 * per request (incompatible with the prerendered shells of Cache Components). Everything else —
 * connections, frames, forms, plugins, base URL, framing by others — is locked down.
 */
const isDev = process.env.NODE_ENV === "development";
const isPreview = process.env.VERCEL_ENV === "preview";
const vercelLive = isPreview ? " https://vercel.live" : ""; // preview toolbar only

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${vercelLive}`,
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}${vercelLive}`,
  `frame-src https://www.youtube-nocookie.com${vercelLive}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // No upgrade-insecure-requests: HSTS already forces HTTPS in production, and the directive breaks
  // redirects of a production build served over plain HTTP locally (e2e tests).
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Data is dynamic by default; marketing content opts into caching with `use cache`.
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // AVIF first (much lighter for the veiled photos), WebP fallback.
    formats: ["image/avif", "image/webp"],
    // 60: full-bleed photos under the system's dark veil; 75: default for everything else.
    qualities: [60, 75],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

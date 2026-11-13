import type { NextConfig } from "next";

const wpUrl = process.env.WP_API_URL ? new URL(process.env.WP_API_URL) : null;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@alterpark/design-system"],
  images: {
    // Les médias viennent uniquement de la médiathèque WordPress.
    remotePatterns: wpUrl
      ? [{ protocol: wpUrl.protocol.replace(":", "") as "http" | "https", hostname: wpUrl.hostname, pathname: "/wp-content/uploads/**" }]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

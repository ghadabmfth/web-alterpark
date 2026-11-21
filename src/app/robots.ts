import type { MetadataRoute } from "next";
import { absoluteUrl, routes, siteIndexable } from "@/config/site";

/* Everything is disallowed until launch (SITE_INDEXABLE=true on Production only). */
export default function robots(): MetadataRoute.Robots {
  if (!siteIndexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: [routes.account, routes.admin, "/dev/", "/api/", routes.login, routes.register, routes.forgotPassword] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

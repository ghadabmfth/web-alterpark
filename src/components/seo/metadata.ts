import type { Metadata } from "next";
import { siteName } from "@/config/site";

/** Page metadata with a canonical URL (resolved against metadataBase) and Open Graph. */
export function pageMetadata({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} | ${siteName}`, description, url: path, siteName, locale: "fr_FR", type: "website" },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

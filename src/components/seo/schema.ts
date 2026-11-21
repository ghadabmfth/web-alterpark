import { absoluteUrl, siteContact, siteName } from "@/config/site";
import type { ParkingSummary } from "@/modules/parkings/types";

/* schema.org builders. Only facts we hold are emitted (no rating, no price until validated). */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logos/alterpark-logo.svg"),
    email: siteContact.email,
    telephone: siteContact.phone,
  };
}

export function parkingSchema(p: ParkingSummary) {
  return {
    "@context": "https://schema.org",
    "@type": "ParkingFacility",
    name: p.name,
    url: absoluteUrl(`/parkings/${p.slug}`),
    description: p.description,
    ...(p.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: p.address.line,
            postalCode: p.address.postalCode,
            addressLocality: p.address.city,
            addressCountry: p.address.country,
          },
        }
      : {}),
    ...(p.phone ? { telephone: p.phone } : {}),
    ...(p.geo ? { geo: { "@type": "GeoCoordinates", latitude: p.geo.latitude, longitude: p.geo.longitude } } : {}),
    ...(p.openingHours === "7 jours/7 et 24h/24" ? { openingHours: "Mo-Su 00:00-23:59" } : {}),
  };
}

export function faqSchema(items: { title: string; content: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({ "@type": "Question", name: q.title, acceptedAnswer: { "@type": "Answer", text: q.content } })),
  };
}

export function breadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: absoluteUrl(it.href) })),
  };
}

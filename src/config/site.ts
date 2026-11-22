/*
 * Site-wide configuration: identity, navigation, contact details.
 * Contact values come from the supplied design system (Nantes site). Phase 7 moves editable
 * values to AppSetting (back office); components always receive them as props.
 */

export const siteName = "ALTERPARK";

/** Canonical origin, without trailing slash (NEXT_PUBLIC_SITE_URL). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Search engines may index the site only when SITE_INDEXABLE=true (Production, at launch).
 * Preview and development are never indexable.
 */
export const siteIndexable = process.env.SITE_INDEXABLE === "true";

export type SiteContact = {
  phone: string;
  email: string;
  address: readonly string[];
};

export const siteContact: SiteContact = {
  phone: "02 40 731 237",
  email: "contact@alterpark.fr",
  address: ["1 Rue Dieudonné Costes", "44860 Saint-Aignan-de-Grandlieu"],
};

/** "02 40 731 237" → "tel:0240731237" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

/** Absolute URL of a path on the canonical origin. */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const routes = {
  home: "/",
  parkings: "/parkings",
  parking: (slug: string) => `/parkings/${slug}`,
  howItWorks: "/comment-ca-marche",
  services: "/services",
  faq: "/faq",
  contact: "/contact",
  booking: "/reservation",
  legal: "/mentions-legales",
  terms: "/cgv",
  privacy: "/confidentialite",
  login: "/connexion",
  register: "/inscription",
  forgotPassword: "/mot-de-passe-oublie",
  account: "/compte",
  admin: "/admin",
} as const;

export const legalLinks = [
  { label: "Mentions légales", href: routes.legal },
  { label: "CGV", href: routes.terms },
  { label: "Confidentialité", href: routes.privacy },
  { label: "FAQ", href: routes.faq },
  { label: "Espace client", href: routes.account },
];

/**
 * Social profiles. Empty until the client provides the URLs: the SocialRail and the footer only
 * render the entries that exist (no dead links).
 */
export const socialProfiles: { facebook?: string; youtube?: string } = {};

/** Google rating shown by the client's design (« relevés le 13 nov. 2026 »). Update when it changes. */
export const googleRating = { rating: 4.4, count: 1375 } as const;

/** Presentation video supplied with the design. */
export const presentationVideo = "https://youtu.be/zrJMs72gTJg";

/**
 * Mobile application store pages. Empty until the client provides the published URLs: the
 * badges are only shown with real links (no dead « Download » button).
 */
export const appStoreLinks: { appStore?: string; googlePlay?: string } = {};

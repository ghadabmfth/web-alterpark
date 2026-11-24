import { cacheLife } from "next/cache";
import { routes, socialProfiles } from "@/config/site";
import type { NavLink, SocialItem } from "@/components/ui/navigation/types";

/* Data of the public header and footer. */

/** Header links, as in the client's design (Accueil, Nov. 2026): three on each side of the logo. */
export async function publicNav(): Promise<NavLink[]> {
  return [
    { label: "Accueil", href: routes.home },
    { label: "Comment ça marche ?", href: routes.howItWorks },
    { label: "Nos tarifs", href: routes.parkings },
    {
      label: "Services Plus",
      children: [
        { label: "Tous nos Services Plus", href: routes.services },
        { label: "Nos nouveautés", href: "/#nouveautes" },
        { label: "Programme de fidélité", href: "/#fidelite" },
        { label: "Application mobile", href: "/#application" },
      ],
    },
    {
      label: "Plan accès",
      children: [
        { label: "Nantes Atlantique", href: `${routes.access}/nantes` },
        { label: "Marseille Provence", href: `${routes.access}/marseille` },
        { label: "Paris-Roissy", href: `${routes.access}/paris-roissy` },
      ],
    },
    { label: "Contactez-nous", href: routes.contact },
  ];
}

/** Rail and footer links: only profiles that exist, plus the client area. */
export function socialItems(): SocialItem[] {
  const items: SocialItem[] = [];
  if (socialProfiles.facebook) items.push({ label: "Facebook", href: socialProfiles.facebook, icon: "facebook", tone: "dark" });
  items.push({ label: "Espace client", href: routes.account, icon: "login", tone: "primary" });
  if (socialProfiles.youtube) items.push({ label: "YouTube", href: socialProfiles.youtube, icon: "youtube", tone: "light" });
  return items;
}

/** Copyright year, cached so pages stay static under Cache Components. */
export async function copyrightYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

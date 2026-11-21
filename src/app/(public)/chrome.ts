import { cacheLife } from "next/cache";
import { routes, socialProfiles } from "@/config/site";
import { listParkings } from "@/modules/parkings/queries";
import type { NavLink, SocialItem } from "@/components/ui/navigation/types";

/* Data of the public header and footer. */

export async function publicNav(): Promise<NavLink[]> {
  const parkings = await listParkings();
  return [
    { label: "Réserver", href: routes.booking },
    { label: "Nos parkings", children: [{ label: "Tous nos parkings", href: routes.parkings }, ...parkings.map((p) => ({ label: p.city === "Roissy-en-France" ? "Paris-Roissy" : p.city, href: routes.parking(p.slug) }))] },
    { label: "Comment ça marche", href: routes.howItWorks },
    { label: "FAQ", href: routes.faq },
    { label: "Contact", href: routes.contact },
    { label: "Mon compte", href: routes.account },
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

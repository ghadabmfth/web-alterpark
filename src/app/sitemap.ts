import type { MetadataRoute } from "next";
import { absoluteUrl, routes } from "@/config/site";
import { listParkings } from "@/modules/parkings/queries";

/* Public, indexable pages only. Customer area, back office and tools are excluded. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const parkings = await listParkings();
  const pages = [
    { path: routes.home, priority: 1 },
    { path: routes.parkings, priority: 0.9 },
    { path: routes.booking, priority: 0.9 },
    { path: routes.howItWorks, priority: 0.7 },
    { path: routes.services, priority: 0.7 },
    { path: routes.faq, priority: 0.6 },
    { path: routes.contact, priority: 0.5 },
    { path: routes.legal, priority: 0.2 },
    { path: routes.terms, priority: 0.2 },
    { path: routes.privacy, priority: 0.2 },
  ];
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p.path), priority: p.priority })),
    ...parkings.map((p) => ({ url: absoluteUrl(routes.parking(p.slug)), priority: 0.8 })),
  ];
}

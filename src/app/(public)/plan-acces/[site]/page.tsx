import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/components/seo/metadata";
import { AccessPage } from "@/components/site/access/AccessPage";
import { routes } from "@/config/site";
import { ACCESS_SITES, accessSite } from "@/content/access-sites";

export function generateStaticParams() {
  return ACCESS_SITES.map((s) => ({ site: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/plan-acces/[site]">): Promise<Metadata> {
  const site = accessSite((await params).site);
  if (!site) return {};
  return pageMetadata({
    title: `Plan d’accès ${site.label}`,
    description: site.routes.every((r) => r.mode === "walk")
      ? `${site.name} : plan du Terminal 1 et trajet à pied jusqu’à notre point de rencontre.`
      : `${site.name} : adresse, plan d’accès et itinéraires pour rejoindre notre parking près de l’aéroport.`,
    path: `${routes.access}/${site.slug}`,
  });
}

/* Plan accès — one page per site (client designs, Nov. 2026). */
export default async function AccessSitePage({ params }: PageProps<"/plan-acces/[site]">) {
  const site = accessSite((await params).site);
  if (!site) notFound();
  return <AccessPage site={site} />;
}

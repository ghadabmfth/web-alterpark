import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/components/seo/schema";

/*
 * Top of public inner pages: breadcrumbs (also emitted as BreadcrumbList JSON-LD) and the page's
 * single H1 in the display style. No typewriter on inner pages: the title is visible at once.
 */
export function PageIntro({ title, subtitle, crumbs, children }: { title: string; subtitle?: string; crumbs: { label: string; href: string }[]; children?: ReactNode }) {
  return (
    <div className="ap-container flex flex-col gap-8 pt-12 pb-8 lg:pt-16">
      <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <SectionHeading as="h1" title={title} subtitle={subtitle} typing={false}>
        {children}
      </SectionHeading>
    </div>
  );
}

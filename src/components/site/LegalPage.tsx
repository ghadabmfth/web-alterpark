import type { ReactNode } from "react";
import { PageIntro } from "./PageIntro";
import { Section } from "./Section";
import { Alert } from "@/components/ui/feedback/Alert";
import { Badge } from "@/components/ui/feedback/Badge";

/*
 * Legal documents. Company facts the client has not supplied yet are rendered with <Missing>,
 * a visible « À compléter » badge: nothing is invented. The banner disappears once `validated`.
 */
export function LegalPage({ title, path, updated, validated = false, children }: { title: string; path: string; updated: string; validated?: boolean; children: ReactNode }) {
  return (
    <>
      <PageIntro title={title} crumbs={[{ label: "Accueil", href: "/" }, { label: title, href: path }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <div className="mx-auto flex max-w-text flex-col gap-8">
          {validated ? null : (
            <Alert tone="warning" title="Document en cours de validation">
              <p>Ce document doit être complété et validé par ALTERPARK avant la mise en ligne. Les éléments marqués « À compléter » restent à fournir.</p>
            </Alert>
          )}
          <p className="m-0 text-text-secondary">{`Dernière mise à jour : ${updated}`}</p>
          <div className="ap-body flex flex-col gap-8 [&_h2]:m-0 [&_ul]:my-0">{children}</div>
        </div>
      </Section>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="h3 ap-h3">{title}</h2>
      {children}
    </section>
  );
}

/** A fact to be supplied by the client. */
export function Missing({ what }: { what: string }) {
  return (
    <Badge tone="warning" className="whitespace-normal">
      <span className="ap-sr">Information manquante : </span>
      {`À compléter (${what})`}
    </Badge>
  );
}

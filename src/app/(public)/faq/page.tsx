import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { pageMetadata } from "@/components/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/components/seo/schema";
import { Accordion } from "@/components/ui/content/Accordion";
import { Button } from "@/components/ui/actions/Button";
import { routes } from "@/config/site";
import { FAQ } from "@/content/site-content";

export const metadata = pageMetadata({
  title: "Questions fréquentes",
  description: "Navette, paiement, annulation, délai de réservation : les réponses à vos questions sur les parkings aéroport ALTERPARK.",
  path: routes.faq,
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(FAQ)} />
      <PageIntro title="Questions fréquentes" crumbs={[{ label: "Accueil", href: "/" }, { label: "FAQ", href: routes.faq }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <div className="mx-auto flex max-w-text flex-col gap-12">
          <Accordion items={FAQ} headingAs="h2" multiple />
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="ap-body text-text-secondary">Vous ne trouvez pas votre réponse ?</p>
            <Button href={routes.contact} variant="outline">Contactez-nous</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { pageMetadata } from "@/components/seo/metadata";
import { Steps } from "@/components/ui/content/Steps";
import { Button } from "@/components/ui/actions/Button";
import { routes } from "@/config/site";
import { HOW_IT_WORKS_DETAILS, HOW_IT_WORKS_STEPS } from "@/content/site-content";

export const metadata = pageMetadata({
  title: "Comment ça marche",
  description: "Réservez en ligne, déposez votre véhicule, prenez la navette gratuite jusqu’au terminal : le stationnement aéroport ALTERPARK en 4 étapes.",
  path: routes.howItWorks,
});

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro title="Comment ça marche ?" subtitle="Votre stationnement en 4 étapes" crumbs={[{ label: "Accueil", href: "/" }, { label: "Comment ça marche", href: routes.howItWorks }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <Steps items={HOW_IT_WORKS_STEPS} titleAs="h2" />
      </Section>
      <Section>
        <ol className="mx-auto grid max-w-text list-none gap-8 p-0 md:grid-cols-2">
          {HOW_IT_WORKS_DETAILS.map((d, i) => (
            <li key={d.title} className="rounded-md bg-surface-raised p-6">
              <h3 className="h3 ap-h3">{`${i + 1}. ${d.title}`}</h3>
              <p className="ap-body mt-2">{d.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button href={routes.booking}>Réservez ma place !</Button>
          <Button href={routes.faq} variant="outline">Questions fréquentes</Button>
        </div>
      </Section>
    </>
  );
}

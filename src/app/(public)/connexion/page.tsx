import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { LoginForm } from "@/components/site/AuthForms";
import { pageMetadata } from "@/components/seo/metadata";
import { Card } from "@/components/ui/layout/Card";
import { routes } from "@/config/site";

export const metadata = pageMetadata({ title: "Connexion", description: "Connectez-vous pour retrouver vos réservations.", path: routes.login, noindex: true });

export default function Page() {
  return (
    <>
      <PageIntro title="Connexion" crumbs={[{ label: "Accueil", href: "/" }, { label: "Connexion", href: routes.login }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <Card as="div" className="mx-auto max-w-col">
          <LoginForm />
        </Card>
      </Section>
    </>
  );
}

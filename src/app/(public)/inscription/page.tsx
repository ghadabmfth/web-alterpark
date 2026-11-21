import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { RegisterForm } from "@/components/site/AuthForms";
import { pageMetadata } from "@/components/seo/metadata";
import { Card } from "@/components/ui/layout/Card";
import { routes } from "@/config/site";

export const metadata = pageMetadata({ title: "Créer un compte", description: "Créez votre compte client ALTERPARK.", path: routes.register, noindex: true });

export default function Page() {
  return (
    <>
      <PageIntro title="Créer un compte" crumbs={[{ label: "Accueil", href: "/" }, { label: "Créer un compte", href: routes.register }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <Card as="div" className="mx-auto max-w-col">
          <RegisterForm />
        </Card>
      </Section>
    </>
  );
}

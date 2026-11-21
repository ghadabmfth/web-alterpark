import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { ForgotPasswordForm } from "@/components/site/AuthForms";
import { pageMetadata } from "@/components/seo/metadata";
import { Card } from "@/components/ui/layout/Card";
import { routes } from "@/config/site";

export const metadata = pageMetadata({ title: "Mot de passe oublié", description: "Réinitialisez le mot de passe de votre compte ALTERPARK.", path: routes.forgotPassword, noindex: true });

export default function Page() {
  return (
    <>
      <PageIntro title="Mot de passe oublié" crumbs={[{ label: "Accueil", href: "/" }, { label: "Mot de passe oublié", href: routes.forgotPassword }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <Card as="div" className="mx-auto max-w-col">
          <ForgotPasswordForm />
        </Card>
      </Section>
    </>
  );
}

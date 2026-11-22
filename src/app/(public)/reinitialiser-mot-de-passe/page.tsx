import { Suspense } from "react";
import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { ResetPasswordForm } from "@/components/site/AuthForms";
import { pageMetadata } from "@/components/seo/metadata";
import { Card } from "@/components/ui/layout/Card";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/actions/Button";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";
import { routes } from "@/config/site";

export const metadata = pageMetadata({ title: "Nouveau mot de passe", description: "Choisissez un nouveau mot de passe pour votre compte ALTERPARK.", path: "/reinitialiser-mot-de-passe", noindex: true });

async function FromLink({ searchParams }: { searchParams: PageProps<"/reinitialiser-mot-de-passe">["searchParams"] }) {
  const token = (await searchParams).token;
  if (typeof token !== "string" || token.length < 20) {
    return (
      <div className="flex flex-col gap-6">
        <Alert tone="error" title="Lien incomplet">Ce lien de réinitialisation est invalide. Demandez un nouveau lien.</Alert>
        <Button href={routes.forgotPassword} fullWidth>Demander un nouveau lien</Button>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}

export default function Page({ searchParams }: PageProps<"/reinitialiser-mot-de-passe">) {
  return (
    <>
      <PageIntro title="Nouveau mot de passe" crumbs={[{ label: "Accueil", href: "/" }, { label: "Nouveau mot de passe", href: "/reinitialiser-mot-de-passe" }]} />
      <Section className="pt-0 lg:pt-0 xl:pt-0">
        <Card as="div" className="mx-auto max-w-col">
          <Suspense fallback={<LoadingRegion><Skeleton variant="block" /></LoadingRegion>}>
            <FromLink searchParams={searchParams} />
          </Suspense>
        </Card>
      </Section>
    </>
  );
}

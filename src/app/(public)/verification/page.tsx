import { Suspense } from "react";
import { PageIntro } from "@/components/site/PageIntro";
import { Section } from "@/components/site/Section";
import { VerifyEmailForm } from "@/components/site/TokenPages";
import { pageMetadata } from "@/components/seo/metadata";
import { Card } from "@/components/ui/layout/Card";
import { Alert } from "@/components/ui/feedback/Alert";
import { LoadingRegion, Skeleton } from "@/components/ui/feedback/Skeleton";

export const metadata = pageMetadata({ title: "Confirmation de votre adresse", description: "Confirmez l’adresse e-mail de votre compte ALTERPARK.", path: "/verification", noindex: true });

async function FromLink({ searchParams }: { searchParams: PageProps<"/verification">["searchParams"] }) {
  const token = (await searchParams).token;
  if (typeof token !== "string" || token.length < 20) return <Alert tone="error" title="Lien incomplet">Ce lien de confirmation est invalide.</Alert>;
  return <VerifyEmailForm token={token} />;
}

export default function Page({ searchParams }: PageProps<"/verification">) {
  return (
    <>
      <PageIntro title="Confirmation de votre adresse" crumbs={[{ label: "Accueil", href: "/" }, { label: "Confirmation", href: "/verification" }]} />
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

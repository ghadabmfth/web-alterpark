"use client";

import { useEffect } from "react";
import { SectionHeading } from "@/components/ui/content/SectionHeading";
import { Button } from "@/components/ui/actions/Button";

/*
 * Error boundary of every page: user-safe message, retry, and the error digest so support can
 * match it with the server log. Details are never shown to the visitor.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="contenu" className="ap-container flex min-h-dvh flex-col items-center justify-center gap-8 py-16 text-center">
      <SectionHeading as="h1" title="Une erreur est survenue" align="center" typing={false}>
        <p>Nous n’avons pas pu afficher cette page. Réessayez dans un instant.</p>
        {error.digest ? <p className="text-text-muted">{`Référence de l’erreur : ${error.digest}`}</p> : null}
      </SectionHeading>
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={reset}>Réessayer</Button>
        <Button href="/" variant="outline">Retour à l’accueil</Button>
      </div>
    </main>
  );
}

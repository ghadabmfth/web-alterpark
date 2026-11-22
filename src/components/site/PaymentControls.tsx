"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { resumeCheckoutAction } from "@/modules/payments/actions";

/* « Reprendre le paiement »: reopens the hosted payment page while the space is still held. */
export function ResumePayment({ reference, label = "Reprendre le paiement" }: { reference: string; label?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resume = async () => {
    setPending(true);
    setError(null);
    try {
      const r = await resumeCheckoutAction(reference);
      if (r.status === "redirect") return window.location.assign(r.url);
      setError(r.status === "error" ? r.message : "Le paiement n’a pas pu reprendre.");
    } catch {
      setError("La connexion a été interrompue. Réessayez.");
    }
    setPending(false);
  };
  return (
    <div className="flex flex-col gap-4">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div>
        <Button size="sm" onClick={resume} loading={pending} loadingLabel="Redirection…">{label}</Button>
      </div>
    </div>
  );
}

/**
 * Back from the payment page before the webhook arrived: refreshes the server-rendered status
 * every 3 s for up to a minute. The page never confirms anything by itself.
 */
export function AwaitPaymentConfirmation() {
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= 20) return;
    const t = setTimeout(() => {
      router.refresh();
      setTries((n) => n + 1);
    }, 3000);
    return () => clearTimeout(t);
  }, [router, tries]);
  return (
    <Alert tone="info" title="Paiement en cours de vérification">
      <p>
        {tries >= 20
          ? "La confirmation prend plus de temps que prévu. Vous recevrez un e-mail dès que le paiement sera validé ; vous pouvez fermer cette page."
          : "Nous attendons la confirmation de notre prestataire de paiement. Cette page se met à jour automatiquement."}
      </p>
    </Alert>
  );
}

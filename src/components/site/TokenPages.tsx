"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { routes } from "@/config/site";
import { IDLE } from "@/lib/action-state";
import { verifyEmailAction } from "@/modules/auth/actions";

/*
 * E-mail confirmation: the token is consumed by an explicit POST (button), never by merely opening
 * the link — link prefetchers and mail scanners must not use it up.
 */
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(verifyEmailAction, IDLE);
  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-6">
        <Alert tone="success">{state.message}</Alert>
        <Button href={routes.account} fullWidth>Accéder à mon espace</Button>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-6">
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
      <p className="m-0 text-text-secondary">Confirmez votre adresse e-mail pour sécuriser votre compte ALTERPARK.</p>
      <input type="hidden" name="token" value={token} />
      <Button type="submit" fullWidth loading={pending} loadingLabel="Vérification…">Confirmer mon adresse</Button>
    </form>
  );
}

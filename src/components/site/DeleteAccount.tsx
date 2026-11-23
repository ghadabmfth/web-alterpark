"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/feedback/Alert";
import { Button } from "@/components/ui/actions/Button";
import { TextField } from "@/components/ui/forms/TextField";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { IDLE } from "@/lib/action-state";
import { deleteAccountAction } from "@/modules/privacy/actions";

/* « Supprimer mon compte » (GDPR): password + explicit confirmation; the server decides. */
export function DeleteAccount() {
  const [state, action, pending] = useActionState(deleteAccountAction, IDLE);
  return (
    <form action={action} aria-label="Supprimer mon compte" className="flex flex-col gap-6" noValidate>
      <p className="m-0">Vos nom, coordonnées, véhicules et messages sont effacés et vous êtes déconnecté. Les réservations passées sont conservées de façon anonymisée pour nos obligations comptables. Cette action est définitive.</p>
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
      <TextField label="Mot de passe" name="password" type="password" autoComplete="current-password" required error={state.fieldErrors?.password} />
      <div className="flex flex-col gap-2">
        <Checkbox name="confirm" label="Je comprends que la suppression est définitive" invalid={!!state.fieldErrors?.confirm} />
        {state.fieldErrors?.confirm ? <p className="ap-field__msg ap-field__msg--error m-0">{state.fieldErrors.confirm}</p> : null}
      </div>
      <div>
        <Button type="submit" size="sm" variant="secondary" loading={pending} loadingLabel="Suppression…">Supprimer mon compte</Button>
      </div>
    </form>
  );
}

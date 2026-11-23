"use client";

import { useActionState, useState, startTransition } from "react";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { ConfirmDialog } from "@/components/ui/feedback/ConfirmDialog";
import { TextField } from "@/components/ui/forms/TextField";
import { IDLE } from "@/lib/action-state";
import { cancelReservationAction } from "@/modules/reservations/actions";

/*
 * Customer cancellation (rule Q6). "free" and "abandon" cancel at once after confirmation;
 * "request" sends a reasoned request to the staff. The server decides again in every case.
 */
export function CancelReservation({ reference, mode, deadline }: { reference: string; mode: "free" | "abandon" | "request"; deadline?: string }) {
  const [state, action, pending] = useActionState(cancelReservationAction, IDLE);
  const [open, setOpen] = useState(false);

  if (state.status === "success") return <Alert tone="success">{state.message}</Alert>;

  const submit = (reason?: string) => {
    const fd = new FormData();
    fd.set("reference", reference);
    if (reason !== undefined) fd.set("reason", reason);
    startTransition(() => action(fd));
  };

  if (mode === "request") {
    return (
      <form
        className="flex flex-col gap-6"
        aria-label="Demande d’annulation"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit(String(new FormData(e.currentTarget).get("reason") ?? ""));
        }}
      >
        <p className="m-0">L’annulation gratuite n’est plus possible à moins de 24 h de l’arrivée. Vous pouvez envoyer une demande motivée : notre équipe vous répondra rapidement.</p>
        {state.status === "error" && !state.fieldErrors ? <Alert tone="error">{state.message}</Alert> : null}
        <TextField label="Motif de la demande" name="reason" multiline rows={4} required maxLength={1000} error={state.fieldErrors?.reason} />
        <div>
          <Button type="submit" size="sm" variant="secondary" loading={pending} loadingLabel="Envoi…">Envoyer la demande</Button>
        </div>
      </form>
    );
  }

  const label = mode === "abandon" ? "Abandonner cette réservation" : "Annuler la réservation";
  return (
    <div className="flex flex-col gap-4">
      {mode === "free" && deadline ? <p className="m-0">{`Annulation gratuite jusqu’au ${deadline}.`}</p> : null}
      {state.status === "error" ? <Alert tone="error">{state.message}</Alert> : null}
      <div>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>{label}</Button>
      </div>
      <ConfirmDialog
        open={open}
        title={label}
        confirmLabel={mode === "abandon" ? "Abandonner" : "Confirmer l’annulation"}
        cancelLabel="Retour"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          submit();
        }}
      >
        <p className="m-0">{mode === "abandon" ? "La place réservée sera libérée." : `La réservation ${reference} sera annulée. Cette action est définitive.`}</p>
      </ConfirmDialog>
    </div>
  );
}

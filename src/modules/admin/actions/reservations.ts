"use server";

import { after } from "next/server";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { processOutbox } from "@/modules/notifications/outbox";
import { runAdminAction } from "../run-action";
import { checkIn, complete, refundReservation, rejectCancellationRequest, staffCancel } from "../reservations";

const id = z.object({ id: z.uuid() });
/** "12,50" or "12.5" € → 1250 cents; empty → 0. */
const euros = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (!v) return 0;
    const n = Number(v.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(n) || n < 0 || !/^\d+([.,]\d{1,2})?$/.test(v.replace(/\s/g, ""))) {
      ctx.addIssue({ code: "custom", message: "Montant invalide. Exemple : 12,50" });
      return z.NEVER;
    }
    return Math.round(n * 100);
  });
const reason = z.string().trim().min(3, "Indiquez un motif (3 caractères au minimum).").max(500, "500 caractères au maximum.");
const sendEmails = () => after(() => processOutbox().catch((e) => console.error("outbox", e)));

export async function checkInAction(_: ActionState, fd: FormData) {
  return runAdminAction("RESERVATION_MANAGE", id, fd, async (d, actor) => {
    await checkIn(actor, d.id);
    return "Véhicule déposé : arrivée enregistrée.";
  });
}

export async function completeAction(_: ActionState, fd: FormData) {
  return runAdminAction("RESERVATION_MANAGE", id, fd, async (d, actor) => {
    await complete(actor, d.id);
    return "Véhicule rendu : réservation terminée.";
  });
}

export async function staffCancelAction(_: ActionState, fd: FormData) {
  const schema = id.extend({ reason, refund: euros, requestId: z.uuid().optional().or(z.literal("").transform(() => undefined)), note: z.string().trim().max(1000).optional() });
  return runAdminAction("RESERVATION_CANCEL", schema, fd, async (d, actor) => {
    await staffCancel(actor, { id: d.id, reason: d.reason, refundCents: d.refund, requestId: d.requestId, note: d.note });
    sendEmails();
    return d.refund > 0 ? "Réservation annulée, remboursement lancé. Le client est prévenu par e-mail." : "Réservation annulée. Le client est prévenu par e-mail.";
  });
}

export async function rejectRequestAction(_: ActionState, fd: FormData) {
  const schema = z.object({ requestId: z.uuid(), note: z.string().trim().min(5, "Expliquez la décision au client (5 caractères au minimum).").max(1000) });
  return runAdminAction("RESERVATION_CANCEL", schema, fd, async (d, actor) => {
    await rejectCancellationRequest(actor, d);
    sendEmails();
    return "Demande refusée. Le client est prévenu par e-mail.";
  });
}

export async function refundAction(_: ActionState, fd: FormData) {
  const schema = id.extend({ amount: euros.refine((n) => n > 0, "Indiquez un montant."), reason });
  return runAdminAction("PAYMENT_REFUND", schema, fd, async (d, actor) => {
    await refundReservation(actor, { id: d.id, amountCents: d.amount, reason: d.reason });
    return "Remboursement lancé.";
  });
}

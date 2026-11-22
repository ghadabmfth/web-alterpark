"use server";

import { after } from "next/server";
import { db, hasDatabase } from "@/server/db/client";
import { consumeRateLimit, RATE_LIMITS } from "@/server/security/rate-limit";
import { requestFingerprint } from "@/server/security/request";
import { env } from "@/server/config/env";
import { getCurrentUser } from "@/server/auth/session";
import { enqueue, processOutbox } from "@/modules/notifications/outbox";
import { fieldErrorsOf, formObject, type ActionState } from "@/lib/action-state";
import { CONTACT_SUBJECTS, contactSchema } from "./schema";

/*
 * Contact form submission: server validation, spam defences (honeypot + minimum fill time +
 * rate limit per IP hash), storage, staff notification through the outbox.
 * Bots get the same success answer as people, so they cannot learn what was filtered.
 */

const MIN_FILL_MS = 3000;
const SUCCESS: ActionState = { status: "success", message: "Merci, votre message a bien été envoyé. Notre équipe vous répond au plus vite." };

export async function contactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formObject(formData);
  // Honeypot filled, or submitted faster than a person can (when the timestamp is present: the
  // no-JavaScript fallback does not send it and still gets the other defences).
  const startedAt = Number(raw.startedAt);
  if (raw.website || (raw.startedAt && Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS)) return SUCCESS;

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrorsOf(parsed.error) };
  if (!hasDatabase()) return { status: "error", message: "L’envoi est momentanément indisponible. Écrivez-nous par e-mail ou appelez-nous." };

  const meta = await requestFingerprint();
  if (!(await consumeRateLimit(RATE_LIMITS.contact, meta.ipHash)).allowed) {
    return { status: "error", message: "Vous avez envoyé plusieurs messages récemment. Réessayez dans une heure ou appelez-nous." };
  }

  const d = parsed.data;
  const user = await getCurrentUser().catch(() => null);
  const parking = d.parking ? await db().parking.findUnique({ where: { slug: d.parking }, select: { id: true, name: true } }) : null;
  await db().$transaction(async (tx) => {
    const msg = await tx.contactMessage.create({
      data: { name: d.name, email: d.email.toLowerCase(), phone: d.phone || null, subject: d.subject, message: d.message, parkingId: parking?.id, userId: user?.id, ipHash: meta.ipHash },
    });
    await enqueue(
      {
        template: "contact.received",
        recipient: env("email").ADMIN_NOTIFICATION_EMAIL,
        contactMessageId: msg.id,
        dedupeKey: `contact:${msg.id}`,
        payload: { name: d.name, email: d.email, subject: CONTACT_SUBJECTS[d.subject], message: d.message, parking: parking?.name },
      },
      tx,
    );
  });
  after(() => processOutbox().catch((e) => console.error("outbox", e)));
  return SUCCESS;
}

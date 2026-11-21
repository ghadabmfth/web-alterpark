import "server-only";
import { db } from "@/server/db/client";
import type { Prisma } from "@/generated/prisma/client";
import { emailTransport } from "@/server/email/transport";
import { renderEmail, type TemplateName, type TemplatePayloads } from "./templates";

/*
 * Transactional outbox. `enqueue` is called inside the business transaction; `processOutbox`
 * sends pending e-mails (right after the response via `after()`, and from the cron job as a
 * safety net), retrying with exponential back-off.
 */

const MAX_ATTEMPTS = 6;

type Tx = Pick<ReturnType<typeof db>, "notification">;

export async function enqueue<T extends TemplateName>(
  input: { template: T; recipient: string; payload: TemplatePayloads[T]; dedupeKey?: string; userId?: string; contactMessageId?: string },
  tx: Tx = db(),
): Promise<void> {
  await tx.notification.upsert({
    where: { dedupeKey: input.dedupeKey ?? `${input.template}:${crypto.randomUUID()}` },
    create: {
      template: input.template,
      recipient: input.recipient,
      payload: input.payload as unknown as Prisma.InputJsonValue,
      dedupeKey: input.dedupeKey,
      userId: input.userId,
      contactMessageId: input.contactMessageId,
    },
    update: {},
  });
}

/** Back-off after the n-th failure: 1, 4, 16, 64, 256 minutes. */
export function nextAttemptDelayMs(attempts: number): number {
  return Math.min(256, 4 ** Math.max(0, attempts - 1)) * 60_000;
}

export async function processOutbox(limit = 20, now = new Date()): Promise<{ sent: number; failed: number }> {
  const due = await db().notification.findMany({
    where: { status: "PENDING", nextAttemptAt: { lte: now } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  const transport = emailTransport();
  let sent = 0;
  let failed = 0;
  for (const n of due) {
    // Claim the row: a concurrent worker that already claimed it updates 0 rows.
    const claim = await db().notification.updateMany({ where: { id: n.id, status: "PENDING", attempts: n.attempts }, data: { attempts: { increment: 1 } } });
    if (claim.count === 0) continue;
    try {
      await transport.send(renderEmail(n.template as TemplateName, n.recipient, n.payload as never));
      await db().notification.update({ where: { id: n.id }, data: { status: "SENT", sentAt: new Date(), lastError: null } });
      sent++;
    } catch (e) {
      const attempts = n.attempts + 1;
      await db().notification.update({
        where: { id: n.id },
        data: {
          status: attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
          lastError: String(e instanceof Error ? e.message : e).slice(0, 1000),
          nextAttemptAt: new Date(Date.now() + nextAttemptDelayMs(attempts)),
        },
      });
      failed++;
    }
  }
  return { sent, failed };
}

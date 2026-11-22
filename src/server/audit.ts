import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";

/*
 * Append-only audit trail of sensitive actions. Metadata must never contain secrets, tokens,
 * passwords or card data.
 */

export interface AuditEntry {
  actorType: "USER" | "SYSTEM" | "WEBHOOK";
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipHash?: string | null;
  userAgent?: string | null;
}

type Tx = Pick<ReturnType<typeof db>, "auditLog">;

export async function writeAudit(entry: AuditEntry, tx: Tx = db()): Promise<void> {
  await tx.auditLog.create({ data: { ...entry, actorId: entry.actorId ?? null, entityId: entry.entityId ?? null } });
}

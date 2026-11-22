import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { ContactStatus } from "@/generated/prisma/enums";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { AdminRefusal, ensure, type Actor } from "./guard";

/* Customers and contact requests in the back office. */

export async function listCustomers(actor: Actor, f: { q: string; status: string; skip: number; take: number }) {
  ensure(actor, "CUSTOMER_READ");
  const where: Prisma.UserWhereInput = { role: { isStaff: false }, deletedAt: null };
  if (f.status === "ACTIVE" || f.status === "DISABLED") where.status = f.status;
  const q = f.q.trim();
  if (q) where.OR = [{ email: { contains: q.toLowerCase() } }, { lastName: { contains: q, mode: "insensitive" } }, { firstName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }];
  const [rows, count] = await Promise.all([
    db().user.findMany({ where, orderBy: { createdAt: "desc" }, skip: f.skip, take: f.take, include: { _count: { select: { reservations: true } } } }),
    db().user.count({ where }),
  ]);
  return { rows, count };
}

export async function getCustomer(actor: Actor, id: string) {
  ensure(actor, "CUSTOMER_READ");
  return db().user.findFirst({
    where: { id, role: { isStaff: false } },
    include: {
      reservations: { orderBy: { startsAt: "desc" }, take: 50, include: { parking: { select: { name: true, timeZone: true } } } },
      vehicles: { where: { deletedAt: null } },
      contactMessages: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

/** Disabling signs the customer out everywhere (sessionVersion) and blocks new logins. */
export async function setCustomerStatus(actor: Actor, id: string, status: "ACTIVE" | "DISABLED") {
  ensure(actor, "CUSTOMER_MANAGE");
  await db().$transaction(async (tx) => {
    const { count } = await tx.user.updateMany({ where: { id, role: { isStaff: false }, status: status === "ACTIVE" ? "DISABLED" : "ACTIVE" }, data: { status, sessionVersion: { increment: 1 } } });
    if (!count) throw new AdminRefusal("Ce compte a déjà ce statut, ou n’est pas un compte client.");
    await writeAudit({ actorType: "USER", actorId: actor.id, action: status === "DISABLED" ? "customer.disable" : "customer.enable", entityType: "User", entityId: id }, tx);
  });
}

/* ---------------------------------------------------------------- contacts */

const CONTACT_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM", "ARCHIVED"] as const;

export async function listContacts(actor: Actor, f: { q: string; status: string; subject: string; mine: boolean; skip: number; take: number }) {
  ensure(actor, "CONTACT_READ");
  const where: Prisma.ContactMessageWhereInput = {};
  if ((CONTACT_STATUSES as readonly string[]).includes(f.status)) where.status = f.status as ContactStatus;
  else where.status = { in: ["NEW", "IN_PROGRESS"] }; // default: what needs an answer
  if (f.subject) where.subject = f.subject as Prisma.ContactMessageWhereInput["subject"];
  if (f.mine) where.assignedToId = actor.id;
  const q = f.q.trim();
  if (q) where.OR = [{ email: { contains: q.toLowerCase() } }, { name: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }];
  const [rows, count] = await Promise.all([
    db().contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: f.skip, take: f.take, include: { assignedTo: { select: { firstName: true, lastName: true } }, parking: { select: { name: true } } } }),
    db().contactMessage.count({ where }),
  ]);
  return { rows, count };
}

export async function getContact(actor: Actor, id: string) {
  ensure(actor, "CONTACT_READ");
  return db().contactMessage.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "asc" }, include: { author: { select: { firstName: true, lastName: true } } } }, assignedTo: { select: { id: true, firstName: true, lastName: true } }, parking: { select: { name: true } }, user: { select: { id: true } } },
  });
}

export async function staffMembers(actor: Actor) {
  ensure(actor, "CONTACT_READ");
  return db().user.findMany({ where: { role: { isStaff: true }, status: "ACTIVE" }, select: { id: true, firstName: true, lastName: true }, orderBy: { lastName: "asc" } });
}

export async function updateContact(actor: Actor, id: string, input: { status: ContactStatus; assignedToId: string | null }) {
  ensure(actor, "CONTACT_MANAGE");
  if (input.assignedToId) {
    const assignee = await db().user.findFirst({ where: { id: input.assignedToId, role: { isStaff: true }, status: "ACTIVE" } });
    if (!assignee) throw new AdminRefusal("Ce membre de l’équipe n’existe pas ou est désactivé.", "assignedToId");
  }
  await db().$transaction(async (tx) => {
    const before = await tx.contactMessage.findUnique({ where: { id } });
    if (!before) throw new AdminRefusal("Demande introuvable.");
    await tx.contactMessage.update({ where: { id }, data: { status: input.status, assignedToId: input.assignedToId, resolvedAt: input.status === "RESOLVED" ? (before.resolvedAt ?? new Date()) : null } });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "contact.update", entityType: "ContactMessage", entityId: id, metadata: { status: { from: before.status, to: input.status }, assignedToId: { from: before.assignedToId, to: input.assignedToId } } }, tx);
  });
}

export async function addContactNote(actor: Actor, id: string, body: string) {
  ensure(actor, "CONTACT_MANAGE");
  await db().$transaction(async (tx) => {
    const msg = await tx.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new AdminRefusal("Demande introuvable.");
    await tx.contactNote.create({ data: { messageId: id, authorId: actor.id, body } });
    if (msg.status === "NEW") await tx.contactMessage.update({ where: { id }, data: { status: "IN_PROGRESS", assignedToId: msg.assignedToId ?? actor.id } });
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "contact.note", entityType: "ContactMessage", entityId: id }, tx);
  });
}

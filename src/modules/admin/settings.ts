import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db/client";
import { writeAudit } from "@/server/audit";
import { readSettings, type Settings } from "@/modules/settings/settings";
import { ensure, type Actor } from "./guard";

export async function getSettings(actor: Actor) {
  ensure(actor, "SETTINGS_MANAGE");
  return readSettings();
}

export async function saveSettings(actor: Actor, next: Settings) {
  ensure(actor, "SETTINGS_MANAGE");
  const before = await readSettings();
  const changed = (Object.keys(next) as (keyof Settings)[]).filter((k) => next[k] !== before[k]);
  if (!changed.length) return;
  await db().$transaction(async (tx) => {
    for (const key of changed) {
      const value = next[key] as Prisma.InputJsonValue;
      await tx.appSetting.upsert({ where: { key }, create: { key, value, updatedById: actor.id }, update: { value, updatedById: actor.id } });
    }
    await writeAudit({ actorType: "USER", actorId: actor.id, action: "settings.update", entityType: "AppSetting", metadata: Object.fromEntries(changed.map((k) => [k, { from: before[k], to: next[k] }])) as Prisma.InputJsonValue }, tx);
  });
}

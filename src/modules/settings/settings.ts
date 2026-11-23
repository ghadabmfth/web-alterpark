import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { db, hasDatabase } from "@/server/db/client";

/*
 * Application settings (AppSetting), edited in the back office by SETTINGS_MANAGE. Each key has a
 * schema and a default: a missing or invalid stored value falls back to the default.
 * - booking.enabled: master switch of online booking (e.g. site closed, incident).
 * - booking.notice: message shown above the booking funnel.
 */

export const SETTINGS_TAG = "settings";

export const SETTING_SCHEMAS = {
  "booking.enabled": z.boolean(),
  "booking.notice": z.string().max(300),
} as const;

export type SettingKey = keyof typeof SETTING_SCHEMAS;
export type Settings = { [K in SettingKey]: z.output<(typeof SETTING_SCHEMAS)[K]> };

export const SETTING_DEFAULTS: Settings = { "booking.enabled": true, "booking.notice": "" };

export function parseSettings(rows: { key: string; value: unknown }[]): Settings {
  const out = { ...SETTING_DEFAULTS };
  for (const r of rows) {
    const schema = SETTING_SCHEMAS[r.key as SettingKey];
    const v = schema?.safeParse(r.value);
    if (v?.success) (out as Record<string, unknown>)[r.key] = v.data;
  }
  return out;
}

/** Uncached read: used by the booking services, which must see a switch-off at once. */
export async function readSettings(): Promise<Settings> {
  if (!hasDatabase()) return { ...SETTING_DEFAULTS };
  return parseSettings(await db().appSetting.findMany());
}

/** Cached read for public pages; the back office calls updateTag(SETTINGS_TAG) on save. */
export async function publicSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("hours");
  return readSettings();
}

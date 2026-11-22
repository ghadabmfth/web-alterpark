import "server-only";
import { z } from "zod";

/*
 * Server environment, validated per feature and on first use.
 *
 * Each feature reads only its own variables, so the app builds and runs while later phases are
 * not configured yet, and a misconfigured feature fails with an explicit message instead of
 * an obscure runtime error. Values are cached after the first successful parse.
 * Documentation of every variable: .env.example.
 */

const secret = (name: string, min = 32) =>
  z.string({ error: `${name} is required` }).min(min, `${name} must be at least ${min} characters`);

export const envSchemas = {
  site: z.object({
    NEXT_PUBLIC_SITE_URL: z.url().transform((u) => u.replace(/\/+$/, "")),
  }),
  database: z.object({
    DATABASE_URL: z.string().startsWith("postgres", "DATABASE_URL must be a PostgreSQL URL"),
  }),
  auth: z.object({
    AUTH_SECRET: secret("AUTH_SECRET"),
  }),
  stripe: z.object({
    STRIPE_SECRET_KEY: z.string().regex(/^(sk|rk)_(test|live)_/, "STRIPE_SECRET_KEY must be a Stripe secret or restricted key"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_", "STRIPE_WEBHOOK_SECRET must start with whsec_"),
  }),
  email: z.object({
    EMAIL_TRANSPORT: z.enum(["console", "resend"]).default("console"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().min(3),
    ADMIN_NOTIFICATION_EMAIL: z.email(),
  }).refine((e) => e.EMAIL_TRANSPORT !== "resend" || !!e.RESEND_API_KEY, {
    message: "RESEND_API_KEY is required when EMAIL_TRANSPORT=resend",
    path: ["RESEND_API_KEY"],
  }),
  security: z.object({
    IP_HASH_SALT: secret("IP_HASH_SALT"),
    CRON_SECRET: secret("CRON_SECRET"),
  }),
} as const;

export type EnvFeature = keyof typeof envSchemas;
export type FeatureEnv<F extends EnvFeature> = z.output<(typeof envSchemas)[F]>;

export class EnvError extends Error {
  override name = "EnvError";
}

/** Parses one feature's variables from `source`. Pure: used directly by the tests. */
export function parseEnv<F extends EnvFeature>(feature: F, source: Record<string, string | undefined>): FeatureEnv<F> {
  const result = envSchemas[feature].safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".") || feature}: ${i.message}`).join("; ");
    throw new EnvError(`Invalid "${feature}" configuration — ${issues}`);
  }
  return result.data as FeatureEnv<F>;
}

const cache = new Map<EnvFeature, unknown>();

/** Validated variables of a feature, read from process.env and cached. */
export function env<F extends EnvFeature>(feature: F): FeatureEnv<F> {
  if (!cache.has(feature)) cache.set(feature, parseEnv(feature, process.env));
  return cache.get(feature) as FeatureEnv<F>;
}

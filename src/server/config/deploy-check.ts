/*
 * Deployment configuration check, run at the start of every Vercel build (scripts/check-deploy-env).
 * Pure: takes the environment, returns errors (the build stops) and warnings (printed).
 * It catches the mistakes that would be silent otherwise: a preview made indexable, a live Stripe
 * key on a preview, the e2e Stripe emulator on production, missing secrets once a database exists.
 */

export interface DeployCheck {
  errors: string[];
  warnings: string[];
}

type Env = Record<string, string | undefined>;

const long = (v: string | undefined, n = 32) => !!v && v.length >= n;

export function checkDeployEnv(env: Env): DeployCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const target = env.VERCEL_ENV ?? "development";
  const production = target === "production";
  const stripeKey = env.STRIPE_SECRET_KEY ?? "";
  const live = /^(sk|rk)_live_/.test(stripeKey);

  if (env.STRIPE_API_BASE) errors.push("STRIPE_API_BASE is for end-to-end tests only: remove it from Vercel.");
  if (!production && env.SITE_INDEXABLE === "true") errors.push("SITE_INDEXABLE=true outside Production: previews must never be indexed.");
  if (!production && live) errors.push("A live Stripe key is set outside Production: use test keys on previews.");
  if (stripeKey && !env.STRIPE_WEBHOOK_SECRET) errors.push("STRIPE_SECRET_KEY without STRIPE_WEBHOOK_SECRET: payments would never be confirmed.");

  if (env.DATABASE_URL) {
    if (!long(env.AUTH_SECRET)) errors.push("AUTH_SECRET (32+ characters) is required once DATABASE_URL is set.");
    if (!long(env.IP_HASH_SALT)) errors.push("IP_HASH_SALT (32+ characters) is required once DATABASE_URL is set.");
    if (!env.EMAIL_FROM || !env.ADMIN_NOTIFICATION_EMAIL) errors.push("EMAIL_FROM and ADMIN_NOTIFICATION_EMAIL are required once DATABASE_URL is set.");
    if (!env.DIRECT_DATABASE_URL) warnings.push("DIRECT_DATABASE_URL is not set: migrations use the pooled URL.");
  } else {
    warnings.push("DATABASE_URL is not set: the site serves the static catalogue; accounts, contact and booking are unavailable.");
  }

  if (production) {
    const site = env.NEXT_PUBLIC_SITE_URL ?? "";
    if (!site.startsWith("https://")) errors.push("NEXT_PUBLIC_SITE_URL must be the https:// address of the site in Production.");
    if (env.DATABASE_URL && !long(env.CRON_SECRET)) errors.push("CRON_SECRET (32+ characters) is required in Production (scheduled job).");
    if (env.DATABASE_URL && env.EMAIL_TRANSPORT !== "resend") warnings.push("EMAIL_TRANSPORT is not « resend »: customers receive no e-mail.");
    if (stripeKey && !live) warnings.push("Production uses a Stripe TEST key: no real payment can be taken (expected before launch only).");
    if (!stripeKey) warnings.push("No Stripe key: online payment is disabled.");
    if (env.SEED_SUPER_ADMIN_EMAIL || env.SEED_SUPER_ADMIN_PASSWORD) warnings.push("SEED_SUPER_ADMIN_* are still set: delete them once the first administrator exists.");
    if (env.DESIGN_SYSTEM_GALLERY === "true") warnings.push("DESIGN_SYSTEM_GALLERY=true in Production: the component gallery is public.");
    if (env.SITE_INDEXABLE !== "true") warnings.push("SITE_INDEXABLE is not true: search engines are kept out (expected until launch).");
    if (!env.ERROR_WEBHOOK_URL) warnings.push("ERROR_WEBHOOK_URL is not set: errors only go to the Vercel logs.");
  }
  return { errors, warnings };
}

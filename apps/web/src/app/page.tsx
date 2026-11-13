import { wpFetch, WordPressError } from "@/lib/wp/client";

/*
 * Phase 1 : page technique de vérification de la liaison Next.js -> WordPress.
 * Elle sera remplacée par l'accueil (contenus WordPress) en phase 7. Non indexée.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "État de la plateforme", robots: { index: false, follow: false } };

interface Health {
  plugin: string;
  db_version: string;
  stripe_configured: boolean;
}

async function check(): Promise<{ ok: true; health: Health } | { ok: false; reason: string }> {
  try {
    const health = await wpFetch<Health>("/apbs/v1/health", { signed: true });
    return { ok: true, health };
  } catch (e) {
    const reason = e instanceof WordPressError ? `${e.status} ${e.code ?? ""} ${e.message}` : (e as Error).message;
    return { ok: false, reason };
  }
}

export default async function Page() {
  const result = await check();
  return (
    <main style={{ padding: "var(--space-16) 5%", maxWidth: "var(--container-text)" }}>
      <h1 style={{ font: "400 var(--fs-display)/1.2 var(--font-display)", textTransform: "uppercase" }}>
        État de la plateforme
      </h1>
      {result.ok ? (
        <dl>
          <dt>Plugin de réservation</dt>
          <dd>{result.health.plugin}</dd>
          <dt>Schéma de base de données</dt>
          <dd>{result.health.db_version}</dd>
          <dt>Stripe</dt>
          <dd>{result.health.stripe_configured ? "Configuré" : "Clés manquantes dans wp-config.php"}</dd>
        </dl>
      ) : (
        <p role="alert">WordPress injoignable ou signature refusée : {result.reason}</p>
      )}
    </main>
  );
}

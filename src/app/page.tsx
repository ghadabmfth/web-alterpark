import Image from "next/image";

/*
 * Phase 1 holding page: proves the design-system layer end to end (tokens, fonts, Tailwind theme).
 * Replaced by the real home page in Phase 3.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-page max-w-text flex-col items-center justify-center gap-8 py-16 text-center">
      <Image src="/brand/logos/alterpark-logo.svg" alt="ALTERPARK – L'autre parking" width={194} height={109} loading="eager" />
      <h1 className="display ap-display">Nouveau site en préparation</h1>
      <p className="ap-body max-w-col text-text-secondary">
        Parkings aéroport à Nantes, Marseille et Paris-Roissy.
      </p>
    </main>
  );
}

# Décisions d'architecture

Format court : contexte, décision, conséquences. Validées le 13/11/2026.

## ADR-001 — Monorepo, nouveau départ

Le dépôt `web-alterpark` était vide à l'audit (aucun commit) ; aucun WordPress existant n'a été signalé. Le frontend, le thème et le plugin vivent dans un même dépôt npm workspaces, testés par la même CI. Versions figées : Next.js 16.4.3, React 19.3.1, TypeScript 5.9.3, PHP 8.1 minimum, WordPress dernière version stable.

## ADR-002 — Next.js comme BFF, le navigateur ne parle jamais à WordPress

Tous les appels à WordPress partent du serveur Next.js (`src/lib/wp/client.ts`, marqué `server-only`). Les routes sensibles du plugin exigent une signature HMAC-SHA256 avec horodatage (fenêtre de 5 min, anti-rejeu). Les secrets ne sont que dans les variables serveur Vercel et dans `wp-config.php`, jamais en base ni dans le bundle client.

## ADR-003 — REST API native, sans ACF Pro

Deux espaces de noms : `alterpark/v1` (thème) et `apbs/v1` (plugin). Le plugin n'utilise rien du thème et reste installable seul. Réglages via les API natives (`register_setting`, `register_post_meta`) et une interface d'administration React (`@wordpress/components`).

## ADR-004 — Arbitrages du design system

Entre le README du design system et `tokens.json` : tailles des titres et du texte selon le README (demandes du client), reste selon `tokens.json`. Texte des boutons orange en `#313131` (5,6:1) au lieu de `#613400` ou du blanc (2,3:1). Appliqué dans `packages/design-system/decisions.css`, à reporter dans le design system source.

Rectification de l'audit : le bundle du design system contient aussi `BookingBar` (recherche parking, dates, offres), `ServiceCard`, `Highlights`, `FeatureList`, `AppShowcase` et `VideoModal`, non listés dans son index. `BookingBar` sert de base à l'étape « recherche » du parcours ; le reste du tunnel (offres, coordonnées, paiement, confirmation) est à concevoir à partir des tokens.

## ADR-005 — Paiement Stripe, piloté par WordPress

Le plugin détient la clé secrète Stripe et reçoit les webhooks, car c'est lui qui fait foi sur les réservations et doit valider paiement et réservation dans la même transaction. Next.js n'a que la clé publiable et affiche le Payment Element. Détail dans `ARCHITECTURE.md`, section Paiement.

## ADR-006 — Licences

Crossroads (« personal use ») et les étoiles Font Awesome 6 Pro exigent des licences commerciales avant la mise en ligne. Crossroads n'est pas versionnée.

## ADR-007 — npm 11

npm 10.9 échoue à résoudre l'arbre de dépendances (bug d'Arborist sur les peer dependencies optionnelles de Vitest). npm 11 est requis (`packageManager`, `engines`), en local comme en CI.

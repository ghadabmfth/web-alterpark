# ALTERPARK

Site de réservation de parkings (Roissy, Nantes, Marseille) en architecture **Next.js + WordPress headless + Vercel**.

| Dossier | Contenu | Déploiement |
|---|---|---|
| `apps/web` | Frontend Next.js 16 (App Router, React 19, TypeScript) | Vercel (répertoire racine `apps/web`) |
| `packages/design-system` | Tokens, polices et arbitrages du design system AlterPark | Consommé par `apps/web` |
| `wordpress/themes/alterpark-headless` | Thème d'administration headless, API `alterpark/v1` | Hébergement WordPress |
| `wordpress/plugins/alterpark-booking` | Plugin autonome de réservation et paiement Stripe, API `apbs/v1` | Hébergement WordPress (ZIP) |
| `wordpress/site` | Installation WordPress complète : cœur figé (Composer), `wp-config.php` sans secret, `.htaccess` | `npm run wordpress:package` → `dist/alterpark-wordpress-*.zip` |
| `docs` | Architecture, décisions, installation, API | — |

## Démarrage local

Prérequis : Node 22, npm 11, Docker (pour WordPress local), PHP 8.1+ et Composer.

```bash
npm ci
cp apps/web/.env.example apps/web/.env.local
npm run wp:start        # WordPress sur http://localhost:8888 (admin / password)
npm run dev             # Next.js sur http://localhost:3000
```

La page d'accueil affiche, en phase 1, l'état de la liaison signée Next.js → WordPress.

Voir `docs/INSTALL.md` pour la production et `docs/ARCHITECTURE.md` pour la conception.

## Avancement

- [x] Phase 1 — Audit et ossature (monorepo, CI, liaison signée, schéma de base de données)
- [ ] Phase 2 — Portage du design system et composants de réservation
- [ ] Phases 3-4 — Thème et administration graphique
- [ ] Phases 5-6 — Plugin de réservation, Stripe, API
- [ ] Phases 7-8 — Pages Next.js et intégration
- [ ] Phases 9-11 — Tests, performances, mise en production

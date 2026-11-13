# Installation

## Local

Voir le `README.md` à la racine. WordPress local tourne avec `wp-env` (Docker), qui active le thème et le plugin et définit des secrets de développement.

## WordPress (production)

1. WordPress à jour, PHP 8.1 minimum (8.3 recommandé), MySQL 8 ou MariaDB 10.6 (InnoDB obligatoire), HTTPS.
2. Ajouter à `wp-config.php` (valeurs générées, jamais réutilisées entre environnements) :

```php
define( 'ALTERPARK_FRONTEND_URL', 'https://www.alterpark.fr' );
define( 'ALTERPARK_REVALIDATE_SECRET', '…64 caractères aléatoires…' );
define( 'APBS_API_SECRET', '…64 caractères aléatoires…' );
define( 'APBS_STRIPE_SECRET_KEY', 'rk_live_…' );
define( 'APBS_STRIPE_WEBHOOK_SECRET', 'whsec_…' );
define( 'DISABLE_WP_CRON', true ); // remplacé par un cron système toutes les minutes
```

Générer un secret : `openssl rand -hex 32`.

3. Installer le thème `alterpark-headless` et l'activer.
4. Installer `alterpark-booking-<version>.zip` (artefact de la CI) et l'activer.
5. Cron système : `* * * * * curl -s https://<wordpress>/wp-cron.php?doing_wp_cron >/dev/null`.
6. Stripe : créer un endpoint de webhook vers `https://<wordpress>/wp-json/apbs/v1/stripe/webhook` (événements `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`).

## Vercel

1. Importer le dépôt, répertoire racine `apps/web`, framework Next.js.
2. Variables d'environnement (Production et Preview, valeurs distinctes) : `WP_API_URL`, `APBS_API_SECRET`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Déposer `Crossroads-Regular.ttf` (licence commerciale) dans `apps/web/public/fonts/` avant la mise en ligne.

# Installation

## Local

Voir le `README.md` à la racine. WordPress local tourne avec `wp-env` (Docker), qui active le thème et le plugin et définit des secrets de développement.

## WordPress (production)

Le dépôt ne versionne pas le cœur WordPress : sa version est figée dans `wordpress/site/composer.lock` (WordPress 7.1.4) et le paquet complet se construit en une commande (PHP 8.1+, Composer, `zip`) :

```bash
npm run wordpress:package
```

Résultat : `dist/alterpark-wordpress-<wordpress>-<plugin>.zip` (aussi produit par la CI, artefact `alterpark-wordpress`). Le dossier `alterpark-wordpress/` qu'il contient est la racine web du site : cœur WordPress, thème `alterpark-headless`, plugin `alterpark-booking` avec ses dépendances, `wp-config.php` et `.htaccess`. Thèmes et plugins par défaut sont retirés.

1. Hébergement : PHP 8.1 minimum (8.3 recommandé), MySQL 8 ou MariaDB 10.6 (InnoDB obligatoire), HTTPS, Apache avec `mod_rewrite` (sous Nginx, reprendre les règles de `.htaccess`).
2. Créer une base de données et son utilisateur.
3. Décompresser le ZIP et pointer la racine du domaine (ex. `admin.alterpark.fr`) sur `alterpark-wordpress/`.
4. Secrets : `wp-config.php` n'en contient aucun. Copier `wp-config-secrets.sample.php` en `wp-config-secrets.php`, le remplir (base de données, clés et sels, `APBS_API_SECRET`, `ALTERPARK_REVALIDATE_SECRET`, `ALTERPARK_FRONTEND_URL`, Stripe plus tard), puis `chmod 640`. Variante : définir les mêmes noms en variables d'environnement du serveur. Une valeur manquante affiche « Configuration incomplète : … » (erreur 503). Générer un secret : `openssl rand -hex 32` ; clés et sels : https://api.wordpress.org/secret-key/1.1/salt/. Valeurs jamais réutilisées entre environnements.
5. Ouvrir le site pour lancer l'installation de WordPress (ou `wp core install`), puis dans l'administration : Réglages → Permaliens → « Titre de la publication » ; Apparence → activer « Alterpark Headless » ; Extensions → activer « Alterpark Booking System » (crée les 9 tables et les parkings en brouillon).
6. Vérifier : `https://<wordpress>/wp-json/alterpark/v1/health` répond `{"theme":"0.1.0","frontend":true}`.
7. Cron système (le cron WordPress est désactivé en production) : `* * * * * curl -s https://<wordpress>/wp-cron.php?doing_wp_cron >/dev/null`.
8. Stripe (phase 5) : créer un endpoint de webhook vers `https://<wordpress>/wp-json/apbs/v1/stripe/webhook` (événements `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`).

Mise à jour : reconstruire le paquet et remplacer les fichiers, en conservant `wp-config-secrets.php` et `wp-content/uploads/`. Pour changer de version de WordPress : modifier la version dans `wordpress/site/composer.json`, puis `composer update` dans ce dossier et versionner `composer.lock`.

Si l'hébergeur fournit déjà WordPress, on peut aussi n'installer que le thème (dossier `wordpress/themes/alterpark-headless`) et le plugin (`dist/alterpark-booking-<version>.zip`), avec les mêmes constantes dans son `wp-config.php`.

## Vercel

1. Importer le dépôt. Dans **Settings → Build and Deployment** : *Root Directory* = `apps/web` (option « Include files outside the root directory » activée), *Framework Preset* = Next.js, aucune surcharge d'*Output Directory*. Le reste vient de `apps/web/vercel.json` (installation avec npm 11 à la racine du monorepo, ADR-007). Sans ce réglage, Vercel construit le dépôt comme un site statique et échoue avec « No Output Directory named "public" ».
2. Variables d'environnement (Production et Preview, valeurs distinctes) : `WP_API_URL`, `APBS_API_SECRET`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Déposer `Crossroads-Regular.ttf` (licence commerciale) dans `apps/web/public/fonts/` avant la mise en ligne.

#!/usr/bin/env bash
# Construit dist/alterpark-wordpress-<wp>-<plugin>.zip : WordPress complet prêt à déployer
# (cœur figé dans wordpress/site/composer.lock, thème alterpark-headless, plugin alterpark-booking
# avec ses dépendances de production, wp-config.php sans secret, .htaccess).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SITE="$ROOT/wordpress/site"
BUILD=$(mktemp -d)
trap 'rm -rf "$BUILD"' EXIT

# 1. Cœur WordPress, version du composer.lock.
cp "$SITE/composer.json" "$SITE/composer.lock" "$BUILD/"
( cd "$BUILD" && composer install --no-dev --no-interaction --quiet )
WEB="$BUILD/public"
WP_VERSION=$(grep -oP "\\\$wp_version = '\K[^']+" "$WEB/wp-includes/version.php")

# 2. Nettoyage : métadonnées du paquet, thèmes et plugins par défaut (surface d'attaque réduite).
find "$WEB" -type d -name .git -prune -exec rm -rf {} +
rm -f "$WEB/composer.json" "$WEB/wp-config-sample.php" "$WEB/readme.html" "$WEB/license.txt"
rm -rf "$WEB"/wp-content/themes/* "$WEB"/wp-content/plugins/*
cp "$ROOT/wordpress/site/config/index-silence.php" "$WEB/wp-content/plugins/index.php"
cp "$ROOT/wordpress/site/config/index-silence.php" "$WEB/wp-content/themes/index.php"

# 3. Thème headless.
THEME_ZIP=$(cd "$ROOT" && bash wordpress/themes/alterpark-headless/bin/build-zip.sh | tail -1)
unzip -q "$ROOT/$THEME_ZIP" -d "$WEB/wp-content/themes/"

# 4. Plugin de réservation, construit par son propre script (vendor/ de production).
PLUGIN_ZIP=$(cd "$ROOT" && bash wordpress/plugins/alterpark-booking/bin/build-zip.sh | tail -1)
unzip -q "$ROOT/$PLUGIN_ZIP" -d "$WEB/wp-content/plugins/"
PLUGIN_VERSION=$(grep -oP "define\( 'APBS_VERSION', '\K[^']+" "$ROOT/wordpress/plugins/alterpark-booking/alterpark-booking.php")

# 5. Configuration (aucun secret : voir wp-config-secrets.sample.php).
cp "$SITE/config/wp-config.php" "$SITE/config/wp-config-secrets.sample.php" "$SITE/config/.htaccess" "$WEB/"

# 6. Archive : le dossier « alterpark-wordpress » est la racine web du site.
mv "$WEB" "$BUILD/alterpark-wordpress"
mkdir -p "$ROOT/dist"
OUT="dist/alterpark-wordpress-$WP_VERSION-$PLUGIN_VERSION.zip"
rm -f "$ROOT/$OUT"
( cd "$BUILD" && zip -rq "$ROOT/$OUT" alterpark-wordpress )
echo "$OUT"

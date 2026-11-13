#!/usr/bin/env bash
# Construit alterpark-booking-<version>.zip installable (vendor/ de production inclus).
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(grep -oP "define\( 'APBS_VERSION', '\K[^']+" alterpark-booking.php)
BUILD=$(mktemp -d)
mkdir -p "$BUILD/alterpark-booking"
# tar plutôt que rsync : disponible partout (rsync manque sur certaines images).
tar -cf - --exclude=./bin --exclude=./tests --exclude=./vendor --exclude='./phpunit*' --exclude='./.phpcs*' . \
  | tar -xf - -C "$BUILD/alterpark-booking"
( cd "$BUILD/alterpark-booking" && composer install --no-dev --optimize-autoloader --no-interaction --quiet && rm -f composer.lock \
  && find vendor -type d -name .git -prune -exec rm -rf {} + )
mkdir -p ../../../dist
( cd "$BUILD" && zip -rq "$OLDPWD/../../../dist/alterpark-booking-$VERSION.zip" alterpark-booking )
rm -rf "$BUILD"
echo "dist/alterpark-booking-$VERSION.zip"

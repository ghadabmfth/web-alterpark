#!/usr/bin/env bash
# Construit alterpark-booking-<version>.zip installable (vendor/ de production inclus).
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(grep -oP "define\( 'APBS_VERSION', '\K[^']+" alterpark-booking.php)
BUILD=$(mktemp -d)
mkdir -p "$BUILD/alterpark-booking"
rsync -a --exclude bin --exclude tests --exclude vendor --exclude 'phpunit*' --exclude '.phpcs*' ./ "$BUILD/alterpark-booking/"
( cd "$BUILD/alterpark-booking" && composer install --no-dev --optimize-autoloader --no-interaction --quiet && rm -f composer.lock )
mkdir -p ../../../dist
( cd "$BUILD" && zip -rq "$OLDPWD/../../../dist/alterpark-booking-$VERSION.zip" alterpark-booking )
rm -rf "$BUILD"
echo "dist/alterpark-booking-$VERSION.zip"

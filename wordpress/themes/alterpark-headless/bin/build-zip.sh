#!/usr/bin/env bash
# Construit dist/alterpark-headless-<version>.zip, installable depuis Apparence → Thèmes → Ajouter → Téléverser.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(grep -oP '^Version:\s*\K\S+' style.css)
BUILD=$(mktemp -d)
trap 'rm -rf "$BUILD"' EXIT
mkdir -p "$BUILD/alterpark-headless"
tar -cf - --exclude=./bin . | tar -xf - -C "$BUILD/alterpark-headless"
mkdir -p ../../../dist
OUT="$(cd ../../.. && pwd)/dist/alterpark-headless-$VERSION.zip"
rm -f "$OUT"
( cd "$BUILD" && zip -rq "$OUT" alterpark-headless )
echo "dist/alterpark-headless-$VERSION.zip"

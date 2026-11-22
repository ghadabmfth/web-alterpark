#!/usr/bin/env bash
# Restore drill: restores a backup into a SCRATCH database and checks it is usable.
#   BACKUP_PASSPHRASE=… scripts/restore-drill.sh <backup.dump.gpg | backup.dump> <scratch database URL>
# The scratch database name must end in _restore or _test (never production). Prints row counts of
# the main tables and the most recent reservation, to compare with the source.
set -euo pipefail
file="${1:?backup file}"
target="${2:?scratch database URL}"
name="${target##*/}"; name="${name%%\?*}"
if [[ ! "$name" =~ _(restore|test)$ ]]; then
  echo "Refusing to restore into '$name': the database name must end in _restore or _test." >&2
  exit 1
fi
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
if [[ "$file" == *.gpg ]]; then
  : "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is required for an encrypted backup}"
  gpg --batch --quiet --decrypt --passphrase-fd 3 --output "$work/backup.dump" "$file" 3<<<"$BACKUP_PASSPHRASE"
  file="$work/backup.dump"
fi
pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error --dbname="$target" "$file"
psql "$target" -X -q -A -F ' | ' <<'SQL'
\echo table | rows
SELECT 'User', count(*) FROM "User"
UNION ALL SELECT 'Reservation', count(*) FROM "Reservation"
UNION ALL SELECT 'Payment', count(*) FROM "Payment"
UNION ALL SELECT 'Refund', count(*) FROM "Refund"
UNION ALL SELECT 'ParkingPrice', count(*) FROM "ParkingPrice"
UNION ALL SELECT 'AuditLog', count(*) FROM "AuditLog";
\echo latest reservation
SELECT coalesce(max("createdAt")::text, 'none') FROM "Reservation";
\echo applied migrations
SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL;
SQL
echo "Restore drill OK: $name is usable."

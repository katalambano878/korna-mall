#!/usr/bin/env bash
set -euo pipefail

echo "==> KORNA staging VPS setup (isolated from anael)"

# Apply schema migrations into store_korna using fleet-postgres
MIG_DIR="${1:-}"
if [[ -z "$MIG_DIR" || ! -d "$MIG_DIR" ]]; then
  echo "usage: $0 <migrations-dir>"
  exit 1
fi

# shellcheck disable=SC1091
source /data/fleet/secrets/store_korna.env
# STORE_PASS from secrets file

echo "==> Applying migrations from $MIG_DIR"
for f in "$MIG_DIR"/*.sql; do
  echo "---- $(basename "$f")"
  docker exec -i -e PGPASSWORD="$STORE_PASS" fleet-postgres \
    psql -v ON_ERROR_STOP=1 -U store_korna -d store_korna < "$f"
done

echo "==> Ensuring storage exists"
mkdir -p /data/korna/storage/{product-images,banners,categories,misc}
chown -R 1000:1000 /data/korna || true
chmod -R 775 /data/korna || true

echo "==> Listing tables"
docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  psql -U store_korna -d store_korna -c '\dt'

echo "==> Done. DB=store_korna STORAGE=/data/korna/storage"
echo "    Coolify app must still be created in UI as korna-staging"
echo "    Do NOT reuse anaelcosmetics-staging or store_anael*"

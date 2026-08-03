#!/usr/bin/env bash
set -euo pipefail
source /data/fleet/secrets/store_korna.env

echo "Bootstrapping extensions..."
docker exec -i -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  psql -v ON_ERROR_STOP=1 -U postgres -d store_korna < /home/tay/korna-bootstrap.sql

echo "Applying migrations..."
for f in /home/tay/korna-migrations/*.sql; do
  echo "---- $(basename "$f")"
  docker exec -i -e PGPASSWORD="$STORE_PASS" fleet-postgres \
    psql -v ON_ERROR_STOP=1 -U store_korna -d store_korna < "$f"
done

echo "Tables:"
docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  psql -U store_korna -d store_korna -c '\dt'

echo "DONE store_korna ready"

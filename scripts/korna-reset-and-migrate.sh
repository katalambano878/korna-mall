#!/usr/bin/env bash
set -euo pipefail
source /data/fleet/secrets/db-stack.env
source /data/fleet/secrets/store_korna.env

echo "==> Resetting store_korna (isolated KORNA DB — not Anael)"
docker exec -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres \
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres <<SQL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'store_korna' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS store_korna;
CREATE DATABASE store_korna OWNER store_korna;
REVOKE CONNECT ON DATABASE store_korna FROM PUBLIC;
GRANT CONNECT ON DATABASE store_korna TO store_korna;
SQL

docker exec -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres \
  psql -v ON_ERROR_STOP=1 -U postgres -d store_korna <<SQL
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO store_korna;
SQL

echo "==> Bootstrap auth + extensions"
docker exec -i -e PGPASSWORD="$POSTGRES_SUPERPASS" fleet-postgres \
  psql -v ON_ERROR_STOP=1 -U postgres -d store_korna < /home/tay/korna-plain-pg-bootstrap.sql

echo "==> Apply schema migrations as store_korna"
for f in /home/tay/korna-migrations/*.sql; do
  echo "---- $(basename "$f")"
  # Continue on RLS/policy noise; schema objects must succeed
  docker exec -i -e PGPASSWORD="$STORE_PASS" fleet-postgres \
    psql -v ON_ERROR_STOP=0 -U store_korna -d store_korna < "$f" | tail -n 5
done

echo "==> Verify core tables"
docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  psql -U store_korna -d store_korna -c \
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;"

echo "==> Verify auth.users"
docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  psql -U store_korna -d store_korna -c \
  "SELECT count(*) AS auth_users FROM auth.users;"

echo "DONE"

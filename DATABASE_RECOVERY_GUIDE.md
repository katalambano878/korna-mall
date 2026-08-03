# DATABASE_RECOVERY_GUIDE — KORNA MALL (staging)

Target: `store_korna` on fleet-postgres (VPS). Never assume a URL labeled “staging” is safe — always verify `current_database()` before destructive work.

## Confirm environment (no secrets)

```bash
ssh big-vps
# load secrets with sudo, then:
sudo docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  psql -U store_korna -d store_korna -tAc 'SELECT current_database(), current_user, version();'
```

Expect: `store_korna|store_korna|PostgreSQL 16...`

## Backup (schema + data)

```bash
TS=$(date +%Y%m%d_%H%M%S)
sudo docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  pg_dump -U store_korna -d store_korna -Fc \
  > /data/fleet/backups/store_korna_${TS}.dump

# plain SQL also useful for inspection
sudo docker exec -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  pg_dump -U store_korna -d store_korna --schema-only \
  > /data/fleet/backups/store_korna_${TS}_schema.sql
```

Record row counts before risky changes:

```sql
SELECT 'orders' AS t, count(*) FROM orders
UNION ALL SELECT 'products', count(*) FROM products
UNION ALL SELECT 'payment_attempts', count(*) FROM payment_attempts
UNION ALL SELECT 'auth.users', count(*) FROM auth.users;
```

## Restore

```bash
# WARNING: replaces objects in store_korna
sudo docker exec -i -e PGPASSWORD="$STORE_PASS" fleet-postgres \
  pg_restore -U store_korna -d store_korna --clean --if-exists \
  < /data/fleet/backups/store_korna_YYYYMMDD_HHMMSS.dump
```

Or rebuild empty then re-migrate:

1. `scripts/korna-plain-pg-bootstrap.sql`
2. Apply `supabase/migrations/*.sql` in order
3. `SELECT * FROM schema_migrations;`

## Migration rollback

Prefer **forward fixes**. For `20260803120000_db_health_repair` only, see SQL in `MIGRATION_STATUS_REPORT.md`.

Do not edit already-applied migration files; add a new corrective migration.

## Payment-safe recovery

1. Restore `orders`, `payment_attempts`, `callback_events` together.  
2. Re-check: paid orders should have matching successful attempts when Moolre was used.  
3. Do **not** re-send SMS/email without clearing `metadata.confirmation_sent` consciously.  
4. Never mark paid from a browser redirect alone after restore — re-verify with Moolre if unsure.

## Data-repair scripts

Use dry-run style SQL first (`SELECT` candidates), then wrapped `BEGIN`/`ROLLBACK` rehearsal, then `COMMIT`. Prefer additive fixes over DELETE.

## Verify after restore

```bash
# from repo with DATABASE_URL
npm run db:schema-smoke
curl -sS https://korna-staging.169-58-8-203.sslip.io/api/health
```

Checks: required tables, `auth.role`, `mark_order_paid`, health `database: ok`.

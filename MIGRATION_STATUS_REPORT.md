# MIGRATION_STATUS_REPORT — KORNA MALL

## Migration tool

- **Primary:** hand-authored SQL in `supabase/migrations/`
- **Apply path (staging):** `scripts/korna-reset-and-migrate.sh` / `scripts/korna-plain-pg-bootstrap.sql` then `psql` apply of each file
- **App helper:** `npm run db:migrate` → `scripts/run-migration.mjs` (uses `DATABASE_URL`)
- **Not used for runtime:** hosted Supabase CLI against cloud project
- **Ledger:** `public.schema_migrations` (added 2026-08-03)

## History (repository)

| ID | File | Notes |
| -- | ---- | ----- |
| 20260209000000 | `complete_schema.sql` | Full ecommerce baseline (enums, tables, RLS policies, RPCs) |
| 20260218000000 | `allow_null_order_items_product_fks.sql` | Soft product deletes |
| 20260730000000 | `mark_order_paid_idempotent.sql` | Idempotent paid RPC |
| 20260803000000 | `payment_audit_tables.sql` | payment_attempts, callback_events, sms_attempts, claim fn |
| 20260803120000 | `db_health_repair.sql` | auth.role, storage stub, payment guards, ledger |

## Applied on staging `store_korna` (verified)

All five IDs present in `schema_migrations` after repair apply.

Pre-repair bootstrap had already created baseline + payment audit objects. Corrective migration was **additive** and applied successfully (`APPLY_OK`).

## Pending

None for schema. Application code updates (health checks, audit hardening) require Coolify redeploy of branch `staging/plain-postgres`.

## Failed / noisy historical applies

During first bootstrap:

- Missing `extensions` / `auth` schemas → fixed by `korna-plain-pg-bootstrap.sql`
- `storage.buckets` inserts failed → stubbed in health repair
- Some `auth.role()` policy statements failed previously → function now exists
- Duplicate enum notices if re-applied → non-fatal; prefer ledger + IF NOT EXISTS

## Destructive operations

- Staging DB was reset once during initial Korna bootstrap (empty project; no business data).  
- This repair pass: **no drops**, no truncate, no data deletion.

## Rollback notes

```sql
-- Reverse health-repair pieces only if needed (staging):
DROP TRIGGER IF EXISTS trg_protect_successful_payment_attempt ON payment_attempts;
DROP FUNCTION IF EXISTS protect_successful_payment_attempt();
DROP INDEX IF EXISTS idx_payment_attempts_gateway_ref_uq;
DROP INDEX IF EXISTS idx_callback_events_external_uq;
DROP INDEX IF EXISTS idx_sms_attempts_order_confirm_uq;
DROP INDEX IF EXISTS idx_callback_events_processing;
ALTER TABLE payment_attempts DROP CONSTRAINT IF EXISTS payment_attempts_amount_expected_nonneg;
ALTER TABLE payment_attempts DROP CONSTRAINT IF EXISTS payment_attempts_amount_paid_nonneg;
-- Keep auth.role() and storage stub unless you know policies don't need them.
DELETE FROM schema_migrations WHERE id = '20260803120000_db_health_repair';
```

Full restore: see `DATABASE_RECOVERY_GUIDE.md`.

## Deployment order

1. Confirm DB host/name = staging `store_korna`
2. Backup (pg_dump)
3. Apply bootstrap if blank DB
4. Apply migrations in timestamp order
5. `npm run db:schema-smoke` (with DATABASE_URL)
6. Redeploy app
7. Hit `/api/health`

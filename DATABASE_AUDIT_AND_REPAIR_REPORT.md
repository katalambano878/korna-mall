# DATABASE_AUDIT_AND_REPAIR_REPORT — KORNA MALL

**Date:** 2026-08-03  
**Target DB (confirmed):** `store_korna` @ fleet-postgres on VPS `169.58.8.203` (staging Coolify app `korna-staging`)  
**PostgreSQL:** 16.14 (Debian)  
**App mode:** plain Postgres (`NEXT_PUBLIC_USE_PLAIN_PG=true`)

## Baseline (before this repair pass)

| Check | Result |
| ----- | ------ |
| DB connection | OK (`store_korna` role) |
| Critical tables | Present (33 public + `auth.users`) |
| Business data | Empty staging (0 products/orders/users) — expected new project |
| `auth.uid()` | Present |
| `auth.role()` | **Missing** |
| `storage.buckets` | **Missing** (local disk storage used) |
| `mark_order_paid` / `claim_order_confirmation` | Present |
| Payment audit tables | Present |
| Staging `/api/health` | `ok`, `database: ok`, Moolre env missing |
| Production build (local) | Succeeded |
| Lint | Clean |

## Architecture

- **ORM:** none (raw `pg` Pool)
- **Compatibility layer:** `lib/db/supabase-compat.ts` + `/rest/v1`, `/auth/v1`, `/storage/v1`
- **Browser client:** `@supabase/supabase-js` pointed at **app origin** (not Supabase cloud)
- **Auth:** local JWT + bcrypt against `auth.users` (`lib/db/auth.ts`)
- **ACL:** `lib/db/rest-acl.ts` (replaces RLS for HTTP)
- **Migrations:** SQL files under `supabase/migrations/` applied via bootstrap/scripts (not hosted Supabase)
- **Connection:** singleton Pool in `lib/db/pool.ts` (`globalThis`), statement/idle/connect timeouts

Confirmed this is **staging** DB name `store_korna` (not Anael / not production store DBs). Host is private fleet-postgres; credentials live in `/data/fleet/secrets/store_korna.env` (not printed).

## Schema-drift matrix (confirmed)

| Object | Code Expectation | Migration State | Actual Database (pre) | Problem | Repair |
| ------ | ---------------- | --------------- | --------------------- | ------- | ------ |
| `auth.role()` | Used by legacy RLS SQL | In complete_schema policies | Missing | Policy create noise / incomplete compat | Added in `20260803120000_db_health_repair.sql` |
| `storage.buckets` | Referenced by old migration inserts | In complete_schema | Missing | Re-apply noise; app uses disk | Stub schema+table+seed rows |
| Payment amount checks | Non-negative amounts | Partial | No CHECK | Integrity gap | Added CHECKs |
| Gateway ref uniqueness | Dedup provider txs | Index only | Non-unique | Duplicate provider refs possible | Partial UNIQUE index |
| Callback external id | Dedup | payload_hash only | No external unique | Alternate duplicate path | Partial UNIQUE on `(gateway, external_event_id)` |
| Successful→failed overwrite | Forbidden | App only | Possible via UPDATE | Race from delayed fail | Trigger + app CASE guard |
| Migration ledger | Track applied SQL | None | Unknown | Hard to know state | `schema_migrations` table |
| Hubtel/Paystack tables | N/A | N/A | Absent | Not implemented | Documented only |

## Table classification (public)

| Table | Class |
| ----- | ----- |
| addresses, audit_logs, banners, blog_posts, cart_items, categories, cms_content, coupons, customers, navigation_*, notifications, order_*, orders, pages, product_*, products, profiles, return_*, review_*, site_settings, store_*, support_*, wishlist_items | **Healthy** (schema matches app; empty data) |
| payment_attempts, callback_events, sms_attempts | **Repaired** (constraints/indexes/trigger) |
| schema_migrations | **Created** |
| storage.buckets | **Created** (stub; not used for runtime I/O) |
| auth.users | **Healthy** |

No obsolete business tables identified for deletion.

## Repairs completed

1. Applied `supabase/migrations/20260803120000_db_health_repair.sql` on `store_korna`.
2. Hardened `lib/payments/audit.ts` against demoting successful attempts.
3. Callback amount-mismatch / missing-amount now marks callback event failed.
4. Health endpoint extended to check required tables + helpers (deploy pending).
5. Added `scripts/db-schema-smoke.mjs` and audit helpers.
6. Bootstrap updated with `auth.role()` for future resets.

## Remaining issues (manual)

- Moolre + callback secret + SMS + Resend env not set in Coolify → payments/SMS not live-testable.
- Staging has no catalog/admin user yet → seed via admin create script after env ready.
- Code health/schema checks need Coolify redeploy to appear on staging URL.
- `@supabase/supabase-js` remains as **HTTP client** to app shims (intentional; not cloud DB).

## Final readiness

**Ready after listed manual actions** — database schema and integrity layers are staging-ready; payment provider credentials and catalog seeding remain outside DB repair scope.

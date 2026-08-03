# KORNA MALL Staging

Isolated staging stack — **not** linked to Anael Cosmetics.

## URLs / resources

| Resource | Value |
|----------|--------|
| Staging URL | https://korna-staging.169-58-8-203.sslip.io |
| Coolify app | `korna-staging` (`ctbyds1otp9tk6x0imp5xkhm`) |
| GitHub repo | https://github.com/ecrimah/korna-mall |
| Branch | `staging/plain-postgres` |
| Database | `store_korna` (fleet-postgres / pgbouncer) |
| Uploads | `/data/korna/storage` |
| DB secret file (VPS) | `/data/fleet/secrets/store_korna.env` |

## Explicitly NOT used

- `anaelcosmetics-staging`
- `store_anaelcosmetics` (if present)
- `katalambano878/anaelcosmetics.git`
- Anael Moolre / Resend credentials

## Health

```bash
curl -s https://korna-staging.169-58-8-203.sslip.io/api/health
```

Expect `mode: plain_postgres`, `database: ok`.

## Still to configure (in Coolify env)

- `MOOLRE_*` payment + callback secret
- `MOOLRE_SMS_API_KEY`
- `RESEND_API_KEY` / real `EMAIL_FROM` / `ADMIN_EMAIL`
- Create admin: `node scripts/create-admin-user.mjs` with `DATABASE_URL` (direct URL)

## Redeploy

```bash
sudo fleet deploy korna-staging
```

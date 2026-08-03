#!/usr/bin/env bash
set -euo pipefail
# Attach kornamall.com to korna-staging and point public URL envs at it.

APP_UUID="${APP_UUID:-ctbyds1otp9tk6x0imp5xkhm}"
DOMAIN_LIST="https://kornamall.com,https://www.kornamall.com,https://korna-staging.169-58-8-203.sslip.io"
PRIMARY="https://kornamall.com"
BASE="http://127.0.0.1:8000/api/v1"

if [[ ! -f /tmp/korna-coolify.token ]]; then
  echo "Missing /tmp/korna-coolify.token — mint a Coolify token first"
  exit 1
fi
TOKEN=$(tr -d '\r\n' </tmp/korna-coolify.token)
AUTH="Authorization: Bearer ${TOKEN}"

echo "==> Set FQDN on application $APP_UUID"
docker exec coolify-db psql -U coolify -d coolify -c \
  "UPDATE applications SET fqdn='$DOMAIN_LIST' WHERE uuid='$APP_UUID'; SELECT name, uuid, fqdn FROM applications WHERE uuid='$APP_UUID';"

CODE=$(curl -sS -o /tmp/korna-dom.json -w "%{http_code}" -X PATCH "$BASE/applications/$APP_UUID" \
  -H "$AUTH" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"fqdn\":\"$DOMAIN_LIST\"}" || true)
echo "PATCH fqdn HTTP $CODE"
head -c 300 /tmp/korna-dom.json; echo

echo "==> Update public URL envs (does not touch payment secrets)"
curl -sS -X PATCH "$BASE/applications/$APP_UUID/envs/bulk" \
  -H "$AUTH" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"data\":[
    {\"key\":\"NEXT_PUBLIC_APP_URL\",\"value\":\"$PRIMARY\",\"is_literal\":true,\"is_preview\":false},
    {\"key\":\"NEXT_PUBLIC_SUPABASE_URL\",\"value\":\"$PRIMARY\",\"is_literal\":true,\"is_preview\":false},
    {\"key\":\"STORAGE_PUBLIC_URL\",\"value\":\"$PRIMARY\",\"is_literal\":true,\"is_preview\":false}
  ]}"
echo

echo "==> Trigger redeploy"
curl -sS -X POST "$BASE/deploy" \
  -H "$AUTH" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"uuid\":\"$APP_UUID\",\"force\":true}"
echo

echo "Done. Proxy/SSL may take a minute for Let's Encrypt."

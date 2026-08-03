#!/usr/bin/env bash
set -euo pipefail
TOKEN=$(tr -d '\r\n' </tmp/korna-coolify.token)
APP_UUID=$(tr -d '\r\n' </tmp/korna-app.uuid)
BASE="http://127.0.0.1:8000/api/v1"

# Add storage with type
curl -sS -X POST "$BASE/applications/$APP_UUID/storages" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"type":"directory","name":"korna-storage","host_path":"/data/korna/storage","mount_path":"/data/korna/storage"}' || true
echo

for i in $(seq 1 18); do
  RESP=$(curl -sS -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" "$BASE/applications/$APP_UUID")
  STATUS=$(echo "$RESP" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("status",""))')
  FQDN=$(echo "$RESP" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("fqdn",""))')
  REPO=$(echo "$RESP" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("git_repository",""))')
  echo "[$i] status=$STATUS fqdn=$FQDN repo=$REPO"
  if echo "$STATUS" | grep -qi 'running:healthy'; then
    echo "HEALTHY"
    curl -sS -o /tmp/korna-health.json -w "health_http=%{http_code}\n" "https://korna-staging.169-58-8-203.sslip.io/api/health" || true
    head -c 500 /tmp/korna-health.json; echo
    exit 0
  fi
  if echo "$STATUS" | grep -qi 'error\|failed'; then
    echo "FAILED"
    exit 1
  fi
  sleep 20
done
echo "TIMEOUT waiting for healthy"
exit 2

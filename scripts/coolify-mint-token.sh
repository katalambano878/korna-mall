#!/usr/bin/env bash
set -euo pipefail
# Mint a short-lived Coolify API token for provisioning korna-staging
docker exec coolify php artisan tinker --execute="
\$user = \\App\\Models\\User::query()->orderBy('id')->first();
if (!\$user) { echo 'NO_USER'; exit(1); }
\$plain = \$user->createToken('korna-provision', ['*'])->plainTextToken;
echo \$plain;
"

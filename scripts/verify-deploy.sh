#!/bin/bash
# End-to-end deployment verification for Linux/macOS shells.
# Usage: ./scripts/verify-deploy.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_env_file() {
  if [ ! -f ".env" ]; then
    echo "ERROR: .env not found in repository root."
    echo "Create it first: cp .env.production.example .env"
    exit 1
  fi
}

require_env_value() {
  local name="$1"
  if ! grep -Eq "^${name}=.+" .env; then
    echo "ERROR: required variable ${name} is missing or empty in .env"
    exit 1
  fi
}

require_env_file
require_env_value "JWT_SECRET"
require_env_value "WX_APPID"
require_env_value "WX_APP_SECRET"

echo "[1/6] Validate compose configuration"
docker compose config >/dev/null

echo "[2/6] Build backend image"
docker build -f shizi-backend/Dockerfile -t shizi-backend:local-check .

echo "[3/6] Start services"
docker compose up -d

echo "[4/6] Check health endpoint"
health_json="$(curl -fsS http://localhost/api/health)"
echo "$health_json"
if ! echo "$health_json" | grep -q '"status":"ok"'; then
  echo "ERROR: /api/health did not return status=ok"
  exit 1
fi

echo "[5/6] Seed data"
docker compose exec -T app node dist/scripts/seed.js

echo "[6/6] Check libraries endpoint"
libraries_json="$(curl -fsS http://localhost/api/libraries)"
echo "$libraries_json"
if echo "$libraries_json" | grep -q '"data":\[\]'; then
  echo "ERROR: /api/libraries returned empty data set"
  exit 1
fi
if ! echo "$libraries_json" | grep -q '"data":\['; then
  echo "ERROR: /api/libraries response format is unexpected"
  exit 1
fi

echo "Deployment verification passed."

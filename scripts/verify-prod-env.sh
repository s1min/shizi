#!/bin/bash
# Validate production env file before deployment.
# Usage: ./scripts/verify-prod-env.sh [.env-path]

set -euo pipefail

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: env file not found: $ENV_FILE"
  exit 1
fi

get_env_value() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
  if [ -z "$line" ]; then
    echo ""
    return
  fi
  local value="${line#*=}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  echo "$value"
}

assert_required() {
  local key="$1"
  local value="$2"
  if [ -z "$value" ]; then
    echo "ERROR: required env variable is missing or empty: $key"
    exit 1
  fi
}

assert_not_placeholder() {
  local key="$1"
  local value="$2"
  if echo "$value" | grep -Eiq '^(replace-with-|your-|change-me|local-check-|.*example.*|.*placeholder.*)'; then
    echo "ERROR: $key looks like a placeholder value: $value"
    exit 1
  fi
}

jwt_secret="$(get_env_value JWT_SECRET)"
wx_appid="$(get_env_value WX_APPID)"
wx_app_secret="$(get_env_value WX_APP_SECRET)"

assert_required "JWT_SECRET" "$jwt_secret"
assert_required "WX_APPID" "$wx_appid"
assert_required "WX_APP_SECRET" "$wx_app_secret"

assert_not_placeholder "JWT_SECRET" "$jwt_secret"
assert_not_placeholder "WX_APPID" "$wx_appid"
assert_not_placeholder "WX_APP_SECRET" "$wx_app_secret"

if [ "${#jwt_secret}" -lt 32 ]; then
  echo "ERROR: JWT_SECRET is too short. Use at least 32 characters."
  exit 1
fi

echo "Production env validation passed: $ENV_FILE"

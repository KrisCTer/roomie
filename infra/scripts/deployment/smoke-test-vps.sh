#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8888}"

check() {
  local name="$1"
  local path="$2"

  if curl -fsS "$BASE_URL$path" >/dev/null; then
    echo "[OK] $name"
  else
    echo "[FAIL] $name"
    exit 1
  fi
}

echo "Running smoke tests on $BASE_URL"
check "Gateway health" "/actuator/health"
check "Gateway route metadata" "/actuator/info"

echo "Smoke tests passed"

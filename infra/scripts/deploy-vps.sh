#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INFRA_DIR="$ROOT_DIR/infra"
ENV_FILE="$INFRA_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] Missing $ENV_FILE"
  exit 1
fi

cd "$INFRA_DIR"

echo "[1/4] Pulling images..."
docker compose --env-file "$ENV_FILE" pull

echo "[2/4] Applying deployment..."
docker compose --env-file "$ENV_FILE" up -d --remove-orphans

echo "[3/4] Waiting for API gateway health..."
for i in {1..24}; do
  if curl -fsS "http://127.0.0.1:8888/actuator/health" >/dev/null; then
    echo "[OK] API gateway is healthy"
    break
  fi
  if [[ "$i" -eq 24 ]]; then
    echo "[ERROR] API gateway health check timed out"
    exit 1
  fi
  sleep 5
done

echo "[4/4] Deployment completed"

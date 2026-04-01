#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INFRA_DIR="$ROOT_DIR/infra"
ENV_FILE="${ENV_FILE:-$INFRA_DIR/.env}"
BACKUP_ROOT="${BACKUP_ROOT:-$INFRA_DIR/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[ERROR] Missing env file: $ENV_FILE"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_ROOT/mysql" "$BACKUP_ROOT/mongodb" "$BACKUP_ROOT/neo4j"

require_container() {
  local name="$1"
  if ! docker ps --format '{{.Names}}' | grep -Fxq "$name"; then
    echo "[ERROR] Container is not running: $name"
    exit 1
  fi
}

require_container "roomie-mysql"
require_container "roomie-mongodb"
require_container "roomie-neo4j"

MYSQL_FILE="$BACKUP_ROOT/mysql/mysql_${TIMESTAMP}.sql.gz"
MONGO_FILE="$BACKUP_ROOT/mongodb/mongo_${TIMESTAMP}.archive.gz"
NEO4J_FILE="$BACKUP_ROOT/neo4j/neo4j_data_${TIMESTAMP}.tar.gz"

echo "[1/3] Backing up MySQL..."
docker exec roomie-mysql sh -c "exec mysqldump -uroot -p\"$MYSQL_ROOT_PASSWORD\" --databases \"$MYSQL_DATABASE\" --single-transaction --quick --routines --events" | gzip > "$MYSQL_FILE"

echo "[2/3] Backing up MongoDB..."
docker exec roomie-mongodb sh -c "exec mongodump --username \"$MONGO_ROOT_USERNAME\" --password \"$MONGO_ROOT_PASSWORD\" --authenticationDatabase admin --archive --gzip" > "$MONGO_FILE"

echo "[3/3] Backing up Neo4j volume..."
NEO4J_VOLUME="${NEO4J_VOLUME:-}"
if [[ -z "$NEO4J_VOLUME" ]]; then
  NEO4J_VOLUME="$(docker volume ls --format '{{.Name}}' | grep -E '(^|_)neo4j_data$' | head -n 1 || true)"
fi

if [[ -z "$NEO4J_VOLUME" ]]; then
  echo "[ERROR] Could not detect Neo4j data volume. Set NEO4J_VOLUME and retry."
  exit 1
fi

docker run --rm \
  -v "$NEO4J_VOLUME:/source:ro" \
  -v "$BACKUP_ROOT/neo4j:/backup" \
  alpine:3.20 sh -c "tar -czf /backup/$(basename "$NEO4J_FILE") -C /source ."

echo "Cleaning up old backups older than $BACKUP_RETENTION_DAYS days..."
find "$BACKUP_ROOT" -type f -mtime +"$BACKUP_RETENTION_DAYS" -delete

echo "Backup completed"
echo "- $MYSQL_FILE"
echo "- $MONGO_FILE"
echo "- $NEO4J_FILE"

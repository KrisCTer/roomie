#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INFRA_DIR="$ROOT_DIR/infra"
LAN_ENV_EXAMPLE="$INFRA_DIR/.env.lan.example"
TARGET_ENV="$INFRA_DIR/.env"

if [[ "${EUID}" -ne 0 ]]; then
  echo "[ERROR] Please run as root (use sudo)."
  exit 1
fi

if ! command -v apt-get >/dev/null 2>&1; then
  echo "[ERROR] This script is intended for Ubuntu/Debian (apt-get required)."
  exit 1
fi

echo "[1/8] Updating apt packages..."
apt-get update -y

echo "[2/8] Installing base dependencies..."
apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https

echo "[3/8] Installing Docker Engine + Compose plugin..."
install -m 0755 -d /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/docker.asc ]]; then
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
fi

ARCH="$(dpkg --print-architecture)"
CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
echo "deb [arch=$ARCH signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $CODENAME stable" > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "[4/8] Enabling Docker service..."
systemctl enable --now docker

echo "[5/8] Installing Tailscale..."
if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi
systemctl enable --now tailscaled

echo "[6/8] Preparing Roomie environment file..."
if [[ ! -f "$LAN_ENV_EXAMPLE" ]]; then
  echo "[ERROR] Missing $LAN_ENV_EXAMPLE"
  exit 1
fi

if [[ ! -f "$TARGET_ENV" ]]; then
  cp "$LAN_ENV_EXAMPLE" "$TARGET_ENV"
  echo "Created $TARGET_ENV from LAN template."
else
  echo "$TARGET_ENV already exists, skipping overwrite."
fi

echo "[7/8] Printing Tailscale join command..."
echo "Run this command manually to join your tailnet:"
echo "  sudo tailscale up"
echo "Then get host IP:"
echo "  tailscale ip -4"

echo "[8/8] Next steps..."
echo "1. Edit $TARGET_ENV and replace 100.64.0.10 with this host's Tailscale IP."
echo "2. Fill all CHANGE_ME secrets."
echo "3. Start infrastructure:"
echo "   cd $INFRA_DIR && docker compose --env-file .env up -d"
echo "4. Test backup:"
echo "   bash $INFRA_DIR/scripts/backup-db.sh"
echo "5. Add cron (optional):"
echo "   crontab -e"
echo "   0 2 * * * /bin/bash $INFRA_DIR/scripts/backup-db.sh >> $INFRA_DIR/backups/backup.log 2>&1"

echo "Setup completed."

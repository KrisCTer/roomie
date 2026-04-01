# Roomie Shared DB Access (LAN / Tailscale)

Use this guide when one machine hosts Roomie infrastructure and other machines need to share the same databases.

---

## 1. Host Machine (runs Docker services)

1. Install Tailscale and log in.
2. Get host Tailscale IP:

```bash
tailscale ip -4
```

3. Set this IP in `infra/.env` for shared endpoints:

```dotenv
MYSQL_HOST=<HOST_IP>
MONGO_HOST=<HOST_IP>
REDIS_HOST=<HOST_IP>
NEO4J_HOST=<HOST_IP>
KAFKA_HOST=<HOST_IP>
KAFKA_ADVERTISED_HOST=<HOST_IP>
ELASTICSEARCH_HOST=<HOST_IP>
```

4. Start infrastructure:

```bash
cd infra
docker-compose --env-file .env up -d
```

5. Start backend services as normal.

---

## 2. Partner / Client Machine

### 2.1 One-Time Setup

1. Install Tailscale and join the same tailnet.
2. Get `infra/.env` from the host owner (via secure channel, **never** in chat/git).
3. Replace all `*_HOST` values with the host's Tailscale/LAN IP.

### 2.2 Copy-Paste Environment Block

Add or override these variables in your `infra/.env`:

```dotenv
# Replace <HOST_IP> with actual host Tailscale/LAN IP
MYSQL_HOST=<HOST_IP>
MYSQL_PORT=3306

MONGO_HOST=<HOST_IP>
MONGO_PORT=27017

REDIS_HOST=<HOST_IP>
REDIS_PORT=6379

NEO4J_HOST=<HOST_IP>
NEO4J_PORT=7687

ELASTICSEARCH_HOST=<HOST_IP>
ELASTICSEARCH_PORT=9200

KAFKA_HOST=<HOST_IP>
KAFKA_PORT=9092
```

Note:
- If your app runs inside the same Docker network as Kafka broker, use `kafka:29092`.
- If your app runs on host machine (normal local run), use `<HOST_IP>:9092`.

### 2.3 Connectivity Test

**Windows PowerShell:**

```powershell
Test-NetConnection <HOST_IP> -Port 3306
Test-NetConnection <HOST_IP> -Port 27017
Test-NetConnection <HOST_IP> -Port 6379
Test-NetConnection <HOST_IP> -Port 7687
Test-NetConnection <HOST_IP> -Port 9092
Test-NetConnection <HOST_IP> -Port 9200
```

**Linux/macOS:**

```bash
nc -zv <HOST_IP> 3306
nc -zv <HOST_IP> 27017
nc -zv <HOST_IP> 6379
nc -zv <HOST_IP> 7687
nc -zv <HOST_IP> 9092
nc -zv <HOST_IP> 9200
```

Expected: all checks should be reachable/open.

### 2.4 Run Application

- Partner does NOT need local MySQL/Mongo/Redis/Kafka/Neo4j/Elasticsearch containers.
- Start backend/frontend as normal — services will connect to the shared host.

---

## 3. Security

1. Keep strong credentials in `infra/.env`.
2. Do not expose DB ports publicly on router/cloud firewall.
3. Share access only through tailnet members.
4. Rotate passwords if a device leaves your team.
5. If any credentials were shared in chat or logs, rotate secrets in `infra/.env` and distribute updated values via secure channel.

---

## 4. Quick Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Connection refused` on all ports | Host infra is down, or firewall blocks inbound | Check `docker-compose ps` on host |
| Only Kafka fails | App using wrong Kafka address | Use `<HOST_IP>:9092` for host-run apps, not `kafka:29092` |
| Intermittent Kafka errors | Kafka still stabilizing after start | Wait 30s, retry |
| Neo4j auth failure | Credentials mismatch | Verify `NEO4J_AUTH` in `.env` matches on both machines |

---

## 5. Host-Side Health Commands (for owner)

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml ps
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f kafka
```

---

## 6. Optional: Automated Backups

Run backup script daily on host machine:

```bash
bash infra/scripts/database/backup-db.sh
```

Linux cron example:

```bash
0 2 * * * /bin/bash /path/to/roomie/infra/scripts/database/backup-db.sh >> /path/to/roomie/infra/backups/backup.log 2>&1
```

# Roomie Partner Onboarding Checklist (Shared Infra)

This guide is for partner machines connecting to a shared infra host.
Current host in this setup: `100.96.78.62`.

## 1) Prerequisites

- Partner machine can reach host `100.96.78.62` on LAN/VPN.
- Backend/frontend source is already available on partner machine.
- Partner does NOT run local MySQL/Mongo/Redis/Kafka/Neo4j/Elasticsearch containers.

## 2) Copy-Paste Environment Block

Add or override these variables in partner env file:

```dotenv
MYSQL_HOST=100.96.78.62
MYSQL_PORT=3306

MONGO_HOST=100.96.78.62
MONGO_PORT=27017

REDIS_HOST=100.96.78.62
REDIS_PORT=6379

NEO4J_HOST=100.96.78.62
NEO4J_PORT=7687

ELASTICSEARCH_HOST=100.96.78.62
ELASTICSEARCH_PORT=9200

# Kafka for apps running outside Docker network
KAFKA_HOST=100.96.78.62
KAFKA_PORT=9092
KAFKA_BOOTSTRAP=100.96.78.62:9092
```

Note:

- If your app runs inside the same Docker network as Kafka broker, use `kafka:29092`.
- If your app runs on host machine (normal local run), use `100.96.78.62:9092`.

## 3) One-Time Connectivity Test

### Windows PowerShell

```powershell
# Run the shared script (tests 3306, 27017, 6379, 7687, 9092, 9200)
powershell -ExecutionPolicy Bypass -File infra/scripts/partner-port-test.ps1 -HostIp 100.96.78.62

# Optional: manual checks
Test-NetConnection 100.96.78.62 -Port 3306
Test-NetConnection 100.96.78.62 -Port 27017
Test-NetConnection 100.96.78.62 -Port 6379
Test-NetConnection 100.96.78.62 -Port 7687
Test-NetConnection 100.96.78.62 -Port 9092
Test-NetConnection 100.96.78.62 -Port 9200
```

### Linux/macOS

```bash
nc -zv 100.96.78.62 3306
nc -zv 100.96.78.62 27017
nc -zv 100.96.78.62 6379
nc -zv 100.96.78.62 7687
nc -zv 100.96.78.62 9092
nc -zv 100.96.78.62 9200
```

Expected: all checks should be reachable/open.

## 4) Run Application

- Start backend/frontend as normal on partner machine.
- Ensure app uses the env values above.

## 5) Quick Troubleshooting

- `Connection refused` on all ports:
  - Host machine infra is down, or firewall blocks inbound traffic.
- Only Kafka fails:
  - Verify app uses `100.96.78.62:9092` (outside Docker), not `kafka:29092`.
- Intermittent Kafka startup errors:
  - Wait for Kafka to stabilize, then re-run app.

## 6) Host-Side Health Commands (for owner)

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml ps
docker compose --env-file infra/.env -f infra/docker-compose.yml logs -f kafka
```

## 7) Security Note

If any credentials were shared in chat or logs, rotate secrets in `infra/.env` and distribute updated values to partners via secure channel.

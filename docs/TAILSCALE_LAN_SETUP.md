# Roomie Shared DB Access via Tailscale

Use this guide when one machine hosts Roomie infrastructure and other machines need to use the same DB/API.

## 1. Host Machine (runs Docker services)

1. Install Tailscale and log in.
2. Get host Tailscale IP:

```bash
tailscale ip -4
```

3. Set this IP in `infra/.env` for shared endpoints:

- `MYSQL_HOST=<host-tailscale-ip>`
- `MONGO_HOST=<host-tailscale-ip>`
- `REDIS_HOST=<host-tailscale-ip>`
- `NEO4J_HOST=<host-tailscale-ip>`
- `KAFKA_HOST=<host-tailscale-ip>`
- `KAFKA_ADVERTISED_HOST=<host-tailscale-ip>`
- `ELASTICSEARCH_HOST=<host-tailscale-ip>`

4. Start infrastructure and backend services.

## 2. Client Machine (other teammate)

1. Install Tailscale and join the same tailnet.
2. Verify connectivity to host machine:

```bash
ping <host-tailscale-ip>
```

3. In local backend env, point DB host variables to host Tailscale IP.
4. Use shared API base URL to access services.

## 2.1 Connectivity Checks (Recommended)

Run these from a client machine before starting services:

```bash
nc -vz <host-tailscale-ip> 3306
nc -vz <host-tailscale-ip> 27017
nc -vz <host-tailscale-ip> 6379
nc -vz <host-tailscale-ip> 7687
nc -vz <host-tailscale-ip> 9092
nc -vz <host-tailscale-ip> 9200
```

If `nc` is unavailable on Windows PowerShell, use:

```powershell
Test-NetConnection <host-tailscale-ip> -Port 3306
Test-NetConnection <host-tailscale-ip> -Port 27017
Test-NetConnection <host-tailscale-ip> -Port 6379
Test-NetConnection <host-tailscale-ip> -Port 7687
Test-NetConnection <host-tailscale-ip> -Port 9092
Test-NetConnection <host-tailscale-ip> -Port 9200
```

## 3. Security Baseline

1. Keep strong credentials in `infra/.env`.
2. Do not expose DB ports publicly on router/cloud firewall.
3. Share access only through tailnet members.
4. Rotate passwords if a device leaves your team.

## 4. Optional Automation

- Run backup script daily on host machine:

```bash
bash infra/scripts/backup-db.sh
```

Linux cron example:

```bash
0 2 * * * /bin/bash /path/to/roomie/infra/scripts/backup-db.sh >> /path/to/roomie/infra/backups/backup.log 2>&1
```

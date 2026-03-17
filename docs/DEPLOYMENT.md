# Roomie Deployment Guide

> IMPORTANT: Never commit passwords, API keys, or other secrets to version control.

Roomie contains 13 backend microservices and a React frontend application.
This guide explains how to build, configure, and run the full project safely.

## Runtime Endpoints (Local)

- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8888`
- API Prefix via Gateway: `/api/v1`

Current gateway routes include:

- identity, admin, profile, property, booking, contract, billing, payment, file, chat

Not currently routed via gateway config:

- notification-service
- ai-service

---

## 1. Prerequisites

- Docker and Docker Compose
- Java 21
- Maven 3.9+
- Node.js 20+

---

## 2. Infrastructure Setup

Infrastructure services include MySQL, MongoDB, Neo4j, Redis, MinIO, Zookeeper, Kafka, and Elasticsearch.

### 2.0 Shared Database Connectivity (Multi-Machine)

If multiple developers or users need to use the same databases from different machines:

1. Pick one machine/VPS as the shared infrastructure host.
2. Set host variables in `infra/.env` to that machine IP/domain:
   `MYSQL_HOST`, `MONGO_HOST`, `REDIS_HOST`, `NEO4J_HOST`, `KAFKA_HOST`, `ELASTICSEARCH_HOST`.
3. Set `KAFKA_ADVERTISED_HOST` to the same reachable IP/domain so Kafka clients on other machines receive a valid broker address.
4. Keep credentials synchronized across services (`MYSQL_PASSWORD`, `MONGO_ROOT_PASSWORD`, `REDIS_PASSWORD`, `NEO4J_AUTH`, JWT keys).
5. Open only required ports in firewall and restrict source IPs whenever possible.

All backend services are configured to read these host/port variables with localhost fallback.

Quick-start files for this mode:

1. LAN env template: [infra/.env.lan.example](infra/.env.lan.example)
2. Automated backup script: [infra/scripts/backup-db.sh](infra/scripts/backup-db.sh)
3. Tailscale sharing guide: [docs/TAILSCALE_LAN_SETUP.md](docs/TAILSCALE_LAN_SETUP.md)
4. Ubuntu one-time setup script: [infra/scripts/setup-ubuntu.sh](infra/scripts/setup-ubuntu.sh)

### 2.1 Create Environment Variables

1. Go to the infrastructure directory:

```bash
cd infra
```

2. Create `.env` from `.env.example` if available:

```bash
# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

If `.env.example` is not present, create `.env` manually and define all required variables.

3. Replace all placeholder values with strong secrets.
   Use at least 16 characters with uppercase, lowercase, numbers, and symbols.

Optional password generator:

```bash
openssl rand -base64 24
```

### 2.2 Start Infrastructure

```bash
docker-compose --env-file .env up -d
docker-compose ps
```

---

## 3. Backend Deployment

Backend services are managed under a single parent POM at [backend/pom.xml](backend/pom.xml).

### 3.1 Build Backend

```bash
cd backend
mvn -f pom.xml clean install -DskipTests
```

`-DskipTests` is acceptable for deployment speed only when tests already passed in CI.

### 3.2 Run Services Locally (Development)

Windows:

```cmd
cd backend
run-all-services.bat
```

Suggested manual startup order (if needed):

1. api-gateway
2. identity-service and profile-service
3. remaining domain services

---

## 4. Frontend Deployment

### 4.1 Frontend Environment

```bash
cd frontend
```

If `.env.example` exists, copy it to `.env` and fill in required values.

### 4.2 Install Dependencies

```bash
npm install
```

Windows PowerShell fallback:

```powershell
npm.cmd install
```

### 4.3 Run Frontend Locally

```bash
npm start
```

Windows PowerShell fallback:

```powershell
npm.cmd start
```

Default local URL: `http://localhost:3000`

### 4.4 Build Frontend for Production

```bash
npm run build
```

Windows PowerShell fallback:

```powershell
npm.cmd run build
```

The output folder (`build`) can be served by Nginx, CDN, or static hosting.

---

## 5. Pre-Release Security and Quality Checklist

Before production release:

1. Run project checklist:

```bash
python .agent/scripts/checklist.py .
```

2. Verify `.env` files are ignored by Git:

```bash
git check-ignore infra/.env frontend/.env
```

3. Confirm admin routes are protected with role-based guards.
4. Ensure no sensitive stack traces or secrets are exposed in API responses or browser logs.

---

## 6. VPS Production-Ready Checklist (Recommended)

Target architecture:

- One Ubuntu VPS for backend services and infrastructure via Docker Compose
- One public domain for API (Nginx + HTTPS)
- Frontend deployed either on the same VPS (Nginx static hosting) or on Vercel/Netlify

### 6.1 Server Bootstrap

1. Provision Ubuntu 22.04+ VPS (minimum: 4 vCPU, 8 GB RAM, SSD).
2. Create non-root deploy user and disable password SSH login.
3. Configure firewall (allow only 22, 80, 443 from public internet).
4. Install Docker Engine and Docker Compose plugin.

### 6.2 Secrets and Environment

1. Store service secrets in `infra/.env` on server only.
2. Ensure all JWT keys are at least 32 bytes (`JWT_SIGNER_KEY`).
3. Rotate default credentials for MySQL, MongoDB, Redis, Neo4j, MinIO.
4. Never commit `.env` to git.

### 6.3 Network and Exposure

1. Expose only API Gateway through Nginx.
2. Keep databases and internal services private (Docker network only).
3. Disable direct public access to DB ports in cloud security group.

### 6.4 Reverse Proxy and HTTPS

1. Configure Nginx for `api.your-domain.com` -> `api-gateway:8888`.
2. Issue TLS certificate with Let's Encrypt.
3. Enforce HTTPS redirect and secure headers.

### 6.5 Build and Deploy Workflow

1. Build artifacts in CI (backend jars + frontend build).
2. Deploy with immutable version tags (no `latest` in production).
3. Use `docker compose pull` then `docker compose up -d` for rollout.
4. Verify `/actuator/health` for gateway and critical services.

### 6.6 Data Protection

1. Schedule daily backups for MySQL, MongoDB, Neo4j volumes.
2. Keep at least 7-14 restore points.
3. Test restore process monthly.

### 6.7 Observability and Operations

1. Collect logs centrally (Loki/ELK or cloud logging).
2. Keep Prometheus/Grafana enabled for metrics and alerts.
3. Alert on CPU, memory, restart loops, disk usage, and API 5xx rates.

### 6.8 Release Safety

1. Keep a rollback script for previous image versions.
2. Apply DB migration strategy per service (forward-only migrations).
3. Run smoke tests after each deploy (login, token issue, profile flow).

### 6.9 Ready-to-Use Templates In This Repo

The repository now includes practical VPS deployment templates:

- Nginx reverse proxy template: [infra/config/nginx/nginx.vps.conf.template](infra/config/nginx/nginx.vps.conf.template)
- Deploy script: [infra/scripts/deploy-vps.sh](infra/scripts/deploy-vps.sh)
- Smoke test script: [infra/scripts/smoke-test-vps.sh](infra/scripts/smoke-test-vps.sh)

Suggested first run on VPS:

1. Copy Nginx template to `/etc/nginx/sites-available/roomie-api` and set your domain.
2. Enable site, reload Nginx, then issue TLS with Let's Encrypt.
3. Run deployment script from repository root:

```bash
bash infra/scripts/deploy-vps.sh
```

4. Run smoke test:

```bash
bash infra/scripts/smoke-test-vps.sh https://api.your-domain.com
```

---

## 7. Deployment Roadmap (Recommended)

### Phase 1: Single VPS + Docker Compose + Automated DB Backups

Goal: reach stable production quickly with minimal operational complexity.

1. Deploy all backend services on one Ubuntu VPS using Docker Compose.
2. Keep infrastructure databases on the same VPS in private Docker network.
3. Expose only API Gateway via Nginx + HTTPS.
4. Run daily automated backups for MySQL, MongoDB, and Neo4j.
5. Keep a tested restore procedure and retention policy (7-14 restore points).

Exit criteria:

1. Stable uptime and monitoring alerts configured.
2. Backup and restore test executed successfully.

### Phase 2: Move Databases to Managed Services (App Stays on Compose)

Goal: improve reliability and reduce database operations burden.

1. Migrate MySQL and MongoDB to managed providers.
2. Keep application containers on VPS with Docker Compose.
3. Update environment variables to managed DB endpoints and credentials.
4. Restrict DB network access to VPS outbound IP and enforce TLS.
5. Run migration and compatibility tests before cutover.

Exit criteria:

1. All services operate with managed DB endpoints.
2. Latency and error rates remain within baseline thresholds.

### Phase 3: Migrate to Kubernetes When Load Requires It

Goal: scale and automate operations for higher traffic.

1. Containerize and publish versioned images for all services.
2. Move runtime orchestration from Compose to Kubernetes.
3. Introduce ingress, autoscaling, centralized secrets, and rolling strategy.
4. Keep managed databases outside the cluster for persistence reliability.
5. Adopt GitOps or CI/CD deployment policy with progressive rollout.

When to start Phase 3:

1. Frequent scaling needs and uneven traffic patterns.
2. More than one VPS or environment becomes hard to manage manually.
3. Deployment/rollback speed and reliability become bottlenecks.

---

## 8. Useful References

- Project overview: [README.md](README.md)
- API docs: [docs/API.md](docs/API.md)
- Architecture docs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

# Roomie Monorepo

Roomie is a rental property management platform built with a microservices architecture.

## Repository Overview

- Backend: 13 Spring Boot microservices in [backend](backend)
- Frontend: React application in [frontend](frontend)
- Infrastructure: Docker Compose and infrastructure setup in [infra](infra)
- Agent kit: rules, workflows, and skills in [.agent](.agent)

## Main Structure

- [backend](backend): parent Maven project and all microservices
- [frontend](frontend): React application
- [infra](infra): Docker Compose, initialization scripts, and infra config
- [docs](docs): architecture and API documentation
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): full deployment guide

## Backend Services

- api-gateway
- identity-service
- profile-service
- property-service
- booking-service
- payment-service
- billing-service
- contract-service
- chat-service
- notification-service
- file-service
- ai-service
- admin-service

## Service Ports (Source of Truth)

| Service              | Port | Context Path  |
| -------------------- | ---- | ------------- |
| api-gateway          | 8888 | (none)        |
| identity-service     | 8080 | /identity     |
| admin-service        | 8081 | /admin        |
| profile-service      | 8082 | /profile      |
| property-service     | 8083 | /property     |
| booking-service      | 8084 | /booking      |
| contract-service     | 8085 | /contract     |
| billing-service      | 8086 | /billing      |
| payment-service      | 8087 | /payment      |
| file-service         | 8088 | /file         |
| chat-service         | 8089 | /chat         |
| notification-service | 8090 | /notification |
| ai-service           | 8091 | /ai           |

Gateway base URL (local): `http://localhost:8888/api/v1`

Note: Current gateway config does not include routes for `notification-service` and `ai-service`.

## System Requirements

- Docker and Docker Compose
- Java 21
- Maven 3.9+
- Node.js 20+

## Quick Start

### 1) Start Infrastructure

```bash
cd infra
docker-compose --env-file .env up -d
docker-compose ps
```

### 2) Build Backend

```bash
cd backend
mvn -f pom.xml clean install -DskipTests
```

### 3) Run Backend Locally

Windows:

```cmd
infra\scripts\backend-runtime\run-from-jars.bat
```

Optional helpers (works from CMD/PowerShell/Git Bash):

```cmd
powershell -NoProfile -ExecutionPolicy Bypass -File .\infra\scripts\backend-runtime\stop-all-services.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\infra\scripts\backend-runtime\check-services.ps1
```

Health check output meanings:

- HEALTHY: endpoint returned HTTP 200
- DEGRADED: service is running and reachable, but health endpoint returned non-200 (often HTTP 503)
- OFFLINE: service process/port not reachable

Important: DEGRADED is commonly caused by dependency health checks (for example Eureka, Elasticsearch, Redis, or Mail), not by a crashed JVM.

Runtime backend scripts are centralized under `infra/scripts/backend-runtime` to avoid duplicate copies.

> **Note on Swagger UI:** Swagger API documentation is disabled by default for security. To view it, start your services using the `dev` profile (e.g., `mvn spring-boot:run -Dspring-boot.run.profiles=dev`) and visit `http://localhost:<PORT><CONTEXT_PATH>/swagger-ui.html`. See [docs/API.md](docs/API.md) for details.

### 4) Run Frontend Locally

```bash
cd frontend
npm install
npm start
```

If Windows PowerShell blocks npm.ps1, use npm.cmd:

```powershell
npm.cmd install
npm.cmd start
```

## Related Documentation

- Deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- API docs: [docs/API.md](docs/API.md)
- Architecture docs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Security Notes

- Never commit .env files or secrets to Git.
- Keep all application.yml environment placeholders in the format ${VAR_NAME:fallback}.

## Issues and Feedback

- Open an issue with error logs, affected service, and clear reproduction steps.

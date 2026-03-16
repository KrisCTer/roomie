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
cd backend
run-all-services.bat
```

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

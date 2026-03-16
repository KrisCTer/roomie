# Roomie Deployment Guide

> IMPORTANT: Never commit passwords, API keys, or other secrets to version control.

Roomie contains 13 backend microservices and a React frontend application.
This guide explains how to build, configure, and run the full project safely.

---

## 1. Prerequisites

- Docker and Docker Compose
- Java 21
- Maven 3.9+
- Node.js 20+

---

## 2. Infrastructure Setup

Infrastructure services include MySQL, MongoDB, Neo4j, Redis, MinIO, Zookeeper, Kafka, and Elasticsearch.

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

## 6. Useful References

- Project overview: [README.md](README.md)
- API docs: [docs/API.md](docs/API.md)
- Architecture docs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)


# Infra Script Map

This folder is organized by function for easier usage, maintenance, and onboarding.

## backend-runtime
- `build-all.ps1`: clean compile (or package) all 13 backend services via Maven.
- `launch-all-fast.ps1`: launch 13 backend services from local JARs.
- `check-services.ps1`: health check with `HEALTHY/DEGRADED/OFFLINE` classification.
- `stop-all-services.ps1`: stop backend Java service processes.
- `run-from-jars.bat`: batch launcher for JAR-based startup.

## database
- `backup-db.sh`: backup MySQL, MongoDB, and Neo4j data.
- `seed-all.ps1`: seed MySQL, MongoDB, and Neo4j in one flow.
- `seed-neo4j.ps1`: seed Neo4j only.

## deployment
- `setup-ubuntu.sh`: prepare Ubuntu host (Docker, Tailscale, env bootstrap).
- `deploy-vps.sh`: pull + deploy + gateway health gate.
- `smoke-test-vps.sh`: quick post-deploy smoke tests.

## operations
- `start-all.sh`: start infrastructure and service stack.
- `stop-all.sh`: stop stack with optional cleanup.
- `restart-service.sh`: restart one service.
- `logs.sh`: tail logs for one service.

## diagnostics
- `health-check.sh`: basic health checks for key local endpoints.
- `partner-port-test.ps1`: test partner host connectivity on required ports.

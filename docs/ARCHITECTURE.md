# Roomie System Architecture

Roomie is a Java Spring Boot microservices monorepo with a React frontend and shared infrastructure.

## 1. Monorepo Layout

- `backend/`: parent Maven project and 13 microservices
- `frontend/`: React 19 application
- `infra/`: Docker Compose and infrastructure bootstrap files
- `.agent/`: agent, skill, and workflow system used for AI-assisted development
- `docs/`: project documentation

## 2. Backend Services

All backend modules are listed in `backend/pom.xml`.

| Service              | Port | Context Path    |
| -------------------- | ---- | --------------- |
| api-gateway          | 8888 | (none)          |
| identity-service     | 8080 | `/identity`     |
| admin-service        | 8081 | `/admin`        |
| profile-service      | 8082 | `/profile`      |
| property-service     | 8083 | `/property`     |
| booking-service      | 8084 | `/booking`      |
| contract-service     | 8085 | `/contract`     |
| billing-service      | 8086 | `/billing`      |
| payment-service      | 8087 | `/payment`      |
| file-service         | 8088 | `/file`         |
| chat-service         | 8089 | `/chat`         |
| notification-service | 8090 | `/notification` |
| ai-service           | 8091 | `/ai`           |

## 3. API Gateway

Gateway configuration source:

- `backend/api-gateway/src/main/resources/application.yml`

Current routing prefix:

- `/api/v1`

Current gateway routes:

- identity, admin, profile, property, booking, contract, billing, payment, file, chat

Not currently routed in gateway config:

- notification-service
- ai-service

## 4. Data and Infrastructure Topology

Infrastructure is defined in `infra/docker-compose.yml`.

### 4.1 Shared Infrastructure Services

- MySQL 8 (`3306`)
- MongoDB 7 (`27017`)
- Redis 7 (`6379`)
- Neo4j 5 (`7474`, `7687`)
- Elasticsearch 8.11 (`9200`, `9300`, `xpack.security.enabled=true`)
- Kafka + Zookeeper (`9092`, `2181`)
- MinIO (`9000`, `9001`)
- Prometheus (`9090`)
- Eureka Server (`8761`)

### 4.2 Service Dependency Map (from application.yml)

| Service              | Main Data/Infra Dependencies           |
| -------------------- | -------------------------------------- |
| identity-service     | MySQL, Redis, Kafka                    |
| admin-service        | MongoDB, Redis, Elasticsearch, Kafka   |
| profile-service      | MongoDB, Redis, Neo4j, Kafka           |
| property-service     | MongoDB, Redis, Elasticsearch          |
| booking-service      | MongoDB, Redis, Kafka                  |
| contract-service     | MongoDB, Redis, Kafka                  |
| billing-service      | MongoDB, Redis, Kafka                  |
| payment-service      | MongoDB, Redis, Kafka                  |
| file-service         | MongoDB, Redis, MinIO                  |
| chat-service         | MongoDB, Redis                         |
| notification-service | MongoDB, Kafka                         |
| ai-service           | MongoDB                                |
| api-gateway          | Routing layer (no local DB configured) |

## 5. Startup Model

### 5.1 Infrastructure

Start infra from `infra/` first with Docker Compose.

### 5.2 Backend

- Build all modules via parent POM in `backend/pom.xml`.
- Local multi-service startup script: `backend/run-all-services.bat`.

### 5.3 Frontend

- Run frontend from `frontend/`.
- Default dev port is `3000` (or another available port if `3000` is occupied).

## 6. Configuration Rules

- Keep Spring environment placeholders in format: `${VAR_NAME:fallback}`
- Do not commit secrets; use local env files or OS-level environment variables
- Elasticsearch credentials must use `spring.elasticsearch.username` and `spring.elasticsearch.password`

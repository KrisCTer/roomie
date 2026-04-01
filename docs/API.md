# Roomie API Documentation

This document is aligned with current source configuration in:

- `backend/api-gateway/src/main/resources/application.yml`
- each service `backend/*/src/main/resources/application.yml`

## 1. Base URLs

- API Gateway (local): `http://localhost:8888`
- API prefix: `/api/v1`

Gateway base:

- `http://localhost:8888/api/v1`

## 2. Gateway Routing Map

The current gateway routes are:

| Route Prefix          | Target Service   | Target URL              |
| --------------------- | ---------------- | ----------------------- |
| `/api/v1/identity/**` | identity-service | `http://localhost:8080` |
| `/api/v1/admin/**`    | admin-service    | `http://localhost:8081` |
| `/api/v1/profile/**`  | profile-service  | `http://localhost:8082` |
| `/api/v1/property/**` | property-service | `http://localhost:8083` |
| `/api/v1/booking/**`  | booking-service  | `http://localhost:8084` |
| `/api/v1/contract/**` | contract-service | `http://localhost:8085` |
| `/api/v1/billing/**`  | billing-service  | `http://localhost:8086` |
| `/api/v1/payment/**`  | payment-service  | `http://localhost:8087` |
| `/api/v1/file/**`     | file-service     | `http://localhost:8088` |
| `/api/v1/chat/**`     | chat-service     | `http://localhost:8089` |

## 3. Services Not Routed via Gateway Yet

The services below exist and run locally, but there is no route in current gateway config:

- notification-service (`http://localhost:8090/notification`)
- ai-service (`http://localhost:8091/ai`)

TODO:

- Add gateway routes for `/api/v1/notification/**` and `/api/v1/ai/**` if these services must be publicly reachable through gateway.

## 4. Service Context Paths

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

## 5. Authentication

Authentication and token flow are handled by identity-service.

- Service context path: `/identity`
- Through gateway: `/api/v1/identity/**`

For exact endpoint contracts (request/response schemas), use controller source of each service as source of truth.

## 5.1 Health Endpoint Notes

Health endpoint must include each service context path:

- Correct format: `http://localhost:<PORT><CONTEXT_PATH>/actuator/health`
- Example: `http://localhost:8082/profile/actuator/health`

If you call `http://localhost:<PORT>/actuator/health` on services that have context path, you will typically get HTTP 404.

When health returns HTTP 503, the service may still be running; this usually indicates downstream dependency checks are DOWN.

## 6. Swagger / OpenAPI Documentation

All 13 microservices have individual Swagger UI pages for exploring and testing their APIs.

**Important Requirements:**
- Services **MUST** be started with the `dev` profile to enable Swagger. (Example: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`)
- By default, Swagger is entirely disabled for security reasons to prevent API exposure in production.

**Accessing Swagger UI:**
The URL format for any service is: `http://localhost:<PORT><CONTEXT_PATH>/swagger-ui.html`

*Examples:*
- Identity Service: `http://localhost:8080/identity/swagger-ui.html` 
- Profile Service: `http://localhost:8082/profile/swagger-ui.html`
- API Gateway: `http://localhost:8888/swagger-ui.html`

**Testing with JWT:**
Each service's Swagger UI includes an **Authorize** button. You can paste your JWT Bearer token there to easily test protected endpoints directly from the browser.

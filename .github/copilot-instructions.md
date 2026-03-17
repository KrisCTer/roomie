# GitHub Copilot Instructions — Roomie Project

> This workspace uses the **Antigravity Kit** — a modular agent/skill system located in `.agent/`.
> Full protocol is defined in `AGENTS.md` at the project root. All rules there are binding.

---

## CRITICAL: READ FIRST

Before ANY code or design response, you MUST:

1. **Classify** the request (see Request Classifier below).
2. **Select** the correct agent from `.agent/agents/{name}.md`.
3. **Announce** `🤖 Applying knowledge of @[agent-name]...`
4. **Load** required skills listed in the agent's frontmatter `skills:` field via `.agent/skills/{name}/SKILL.md`.

Rule priority: `AGENTS.md` (P0) > Agent `.md` (P1) > `SKILL.md` (P2).

---

## Agent & Skill Paths

| Resource              | Path                            |
| --------------------- | ------------------------------- |
| Architecture overview | `.agent/ARCHITECTURE.md`        |
| Agents (20)           | `.agent/agents/{name}.md`       |
| Skills (36)           | `.agent/skills/{name}/SKILL.md` |
| Workflows (11)        | `.agent/workflows/{name}.md`    |
| Global rules          | `.agent/rules/GEMINI.md`        |
| Scripts               | `.agent/scripts/`               |

---

## Request Classifier

| Request Type       | Trigger Keywords                           | Action                              |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| **QUESTION**       | "what is", "how does", "explain"           | Text response only                  |
| **SURVEY / INTEL** | "analyze", "list", "overview"              | Explorer agent, no file edits       |
| **SIMPLE CODE**    | "fix", "add", "change" (single file)       | Inline edit                         |
| **COMPLEX CODE**   | "build", "create", "implement", "refactor" | Full agent + skills                 |
| **DESIGN / UI**    | "design", "UI", "page", "dashboard"        | frontend-specialist + ui-ux-pro-max |
| **SLASH CMD**      | `/create`, `/debug`, `/orchestrate`        | Read `.agent/workflows/{cmd}.md`    |

---

## Agent Routing (Auto)

| Agent                    | Domain                           | Skills to Load                                            |
| ------------------------ | -------------------------------- | --------------------------------------------------------- |
| `orchestrator`           | Multi-agent coordination         | parallel-agents, behavioral-modes                         |
| `project-planner`        | Discovery, task planning         | brainstorming, plan-writing, architecture                 |
| `frontend-specialist`    | Web UI/UX, React, Next.js        | frontend-design, tailwind-patterns, web-design-guidelines |
| `backend-specialist`     | API, business logic, Spring Boot | api-patterns, database-design, clean-code                 |
| `database-architect`     | Schema design, SQL, MongoDB      | database-design                                           |
| `mobile-developer`       | iOS, Android, React Native       | mobile-design                                             |
| `game-developer`         | Game logic, mechanics            | game-development                                          |
| `devops-engineer`        | CI/CD, Docker, Kubernetes        | deployment-procedures                                     |
| `security-auditor`       | Security compliance, OWASP       | vulnerability-scanner, red-team-tactics                   |
| `penetration-tester`     | Offensive security               | red-team-tactics                                          |
| `test-engineer`          | Testing strategies               | testing-patterns, tdd-workflow, webapp-testing            |
| `debugger`               | Root cause analysis              | systematic-debugging                                      |
| `performance-optimizer`  | Speed, Web Vitals                | performance-profiling                                     |
| `seo-specialist`         | SEO, Core Web Vitals             | seo-fundamentals, geo-fundamentals                        |
| `documentation-writer`   | Docs, manuals                    | documentation-templates                                   |
| `product-manager`        | Requirements, user stories       | plan-writing, brainstorming                               |
| `product-owner`          | Strategy, backlog, MVP           | plan-writing, brainstorming                               |
| `qa-automation-engineer` | E2E testing, CI pipelines        | webapp-testing, testing-patterns                          |
| `code-archaeologist`     | Legacy code, refactoring         | clean-code, code-review-checklist                         |
| `explorer-agent`         | Codebase analysis                | —                                                         |

> 🔴 Mobile ≠ `frontend-specialist`. Mobile = `mobile-developer` ONLY.

---

## Socratic Gate (Complex Requests)

**MANDATORY: Every request must pass through this gate before ANY implementation.**

| Request Type            | Strategy       | Required Action                                                  |
| ----------------------- | -------------- | ---------------------------------------------------------------- |
| **New Feature / Build** | Deep Discovery | ASK minimum 3 strategic questions                                |
| **Code Edit / Bug Fix** | Context Check  | Confirm understanding + ask impact questions                     |
| **Vague / Simple**      | Clarification  | Ask Purpose, Users, and Scope                                    |
| **Full Orchestration**  | Gatekeeper     | STOP subagents until user confirms plan                          |
| **Direct "Proceed"**    | Validation     | Even if answers given, ask 2 edge-case questions before starting |

1. **Never assume** — if 1% is unclear, ask.
2. Do NOT invoke sub-agents until user confirms the plan.
3. Full protocol: `.agent/skills/brainstorming/SKILL.md`

---

## Modes

| Mode   | Agent             | Behavior                                                                             |
| ------ | ----------------- | ------------------------------------------------------------------------------------ |
| `plan` | `project-planner` | 4-phase: Analysis → Planning → Solutioning → Implementation. NO CODE before Phase 4. |
| `ask`  | —                 | Focus on understanding. Ask questions only.                                          |
| `edit` | `orchestrator`    | Execute directly. Check `{task-slug}.md` first.                                      |

---

## Slash Commands (Workflows)

When user sends a slash command, read the workflow file **before** acting:

| Command          | File                                | Purpose                       |
| ---------------- | ----------------------------------- | ----------------------------- |
| `/create`        | `.agent/workflows/create.md`        | Scaffold new feature/service  |
| `/debug`         | `.agent/workflows/debug.md`         | Root cause analysis & fix     |
| `/orchestrate`   | `.agent/workflows/orchestrate.md`   | Multi-agent task coordination |
| `/plan`          | `.agent/workflows/plan.md`          | Discovery & task breakdown    |
| `/deploy`        | `.agent/workflows/deploy.md`        | Deployment checklist          |
| `/test`          | `.agent/workflows/test.md`          | Testing strategy & execution  |
| `/enhance`       | `.agent/workflows/enhance.md`       | Refactor / optimize           |
| `/brainstorm`    | `.agent/workflows/brainstorm.md`    | Ideation & exploration        |
| `/preview`       | `.agent/workflows/preview.md`       | Live preview & validation     |
| `/status`        | `.agent/workflows/status.md`        | Project health check          |
| `/ui-ux-pro-max` | `.agent/workflows/ui-ux-pro-max.md` | Deep UI/UX design workflow    |

---

## Universal Rules (Always Active)

- **Language**: Respond in the user's language. Code/comments stay in English.
- **Clean code**: Follow `.agent/skills/clean-code/SKILL.md`. No over-engineering.
- **Secrets**: Never hardcode credentials — use env vars with `${VAR:fallback}` format.
- **File deps**: Before editing any file, identify and update ALL dependent files together.
- **Read → Understand → Apply**: Never read agent file and start coding immediately.

---

## Project Context — Roomie

> Java Spring Boot microservices monorepo.

| Detail                | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| Language / Framework  | Java 21, Spring Boot 3.2.5                             |
| Frontend              | React 19, Tailwind CSS                                 |
| Backend services (13) | `backend/` — parent POM at `backend/pom.xml`           |
| Infrastructure        | Docker Compose — `infra/docker-compose.yml`            |
| Databases             | MySQL 8 (port 3306), MongoDB 7 (27017), Redis 7 (6379) |
| Search                | Elasticsearch 8.11 (9200, xpack.security=true)         |
| Messaging             | Kafka                                                  |
| Credentials           | `infra/.env` (never commit)                            |

### Service Map

| Service              | Port | DB                                      |
| -------------------- | ---- | --------------------------------------- |
| api-gateway          | 8888 | —                                       |
| identity-service     | 8080 | MySQL + Redis + Kafka                   |
| profile-service      | 8082 | MongoDB + Redis + Neo4j                 |
| property-service     | 8083 | MongoDB + Elasticsearch                 |
| booking-service      | 8084 | MongoDB + Redis + Kafka                 |
| payment-service      | 8087 | MongoDB + Redis + Kafka                 |
| billing-service      | 8086 | MongoDB                                 |
| contract-service     | 8085 | MongoDB + Redis + Kafka                 |
| chat-service         | 8089 | MongoDB + Redis                         |
| notification-service | 8090 | MongoDB + Kafka                         |
| file-service         | 8088 | MongoDB + Redis + MinIO                 |
| ai-service           | 8091 | MongoDB                                 |
| admin-service        | 8081 | MongoDB + Redis + Elasticsearch + Kafka |

### Key Config Notes

- All `application.yml` env vars use `${VAR_NAME:fallback}` format.
- ES credentials: `spring.elasticsearch.username/password` (NOT `spring.data.elasticsearch.*`).
- Env vars set at Windows User level via `[System.Environment]::SetEnvironmentVariable(..., "User")`.

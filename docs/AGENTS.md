# AGENTS.md — Roomie Project

> AI Agent instruction file for OpenAI Codex and compatible agents.
> This workspace uses the **Antigravity Kit** — a modular agent/skill system located in `.agent/`.

---

## CRITICAL: AGENT & SKILL PROTOCOL (START HERE)

> **MANDATORY:** Before ANY implementation, read the appropriate agent file and its skills. This is the highest priority rule.

### Skill Loading Protocol

Agent activated → Check frontmatter `skills:` → Read `SKILL.md` (index) → Read only sections matching the request.

- **Selective Reading:** Do NOT read all files in a skill folder. Read `SKILL.md` first, then only matching sections.
- **Rule Priority:** `AGENTS.md` (P0) > Agent `.md` (P1) > `SKILL.md` (P2). All are binding.

### Paths

| Resource              | Path                            |
| --------------------- | ------------------------------- |
| Architecture overview | `.agent/ARCHITECTURE.md`        |
| Agents (20)           | `.agent/agents/{name}.md`       |
| Skills (36)           | `.agent/skills/{name}/SKILL.md` |
| Workflows (11)        | `.agent/workflows/{name}.md`    |
| Global rules          | `.agent/rules/GEMINI.md`        |
| Scripts               | `.agent/scripts/`               |

---

## STEP 1 — REQUEST CLASSIFIER

Before any action, classify the request:

| Request Type       | Trigger Keywords                           | Action                              |
| ------------------ | ------------------------------------------ | ----------------------------------- |
| **QUESTION**       | "what is", "how does", "explain"           | Text response only                  |
| **SURVEY / INTEL** | "analyze", "list", "overview"              | Explorer agent, no file edits       |
| **SIMPLE CODE**    | "fix", "add", "change" (single file)       | Inline edit                         |
| **COMPLEX CODE**   | "build", "create", "implement", "refactor" | Full agent + skills                 |
| **DESIGN / UI**    | "design", "UI", "page", "dashboard"        | frontend-specialist + ui-ux-pro-max |
| **SLASH CMD**      | `/create`, `/debug`, `/orchestrate`        | Read `.agent/workflows/{cmd}.md`    |

---

## STEP 2 — INTELLIGENT AGENT ROUTING (AUTO)

Before responding to ANY code or design request, silently analyze and select the best agent(s).

### Available Agents (20) — with Skill Mapping

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

### Response Format (MANDATORY)

When auto-applying an agent:

```
🤖 Applying knowledge of @[agent-name]...

[Response]
```

### Agent Routing Checklist

Before ANY code or design response, complete this checklist:

1. ✅ Identified the correct agent for this domain?
2. ✅ Read `.agent/agents/{agent}.md` (or recalled its rules)?
3. ✅ Announced `🤖 Applying knowledge of @[agent]...`?
4. ✅ Loaded required skills from frontmatter `skills:` field?

---

## TIER 0 — UNIVERSAL RULES (Always Active)

### Language Handling

- Internally translate non-English prompts for better comprehension.
- **Respond in the user's language** — match their communication.
- Code, comments, and variable names remain in English.

### Clean Code (Mandatory)

All code MUST follow `.agent/skills/clean-code/SKILL.md`. No exceptions.

- Concise, direct, no over-engineering. Self-documenting.
- Testing: Pyramid (Unit > Integration > E2E) + AAA pattern.
- Performance: Measure first. Adhere to Core Web Vitals 2025.
- Secrets: Never hardcode credentials — use env vars.

### File Dependency Awareness

Before modifying any file:

1. Identify dependent files.
2. Update ALL affected files together.

### System Map

> **MANDATORY:** Read `.agent/ARCHITECTURE.md` at session start.

```
Agents  → .agent/agents/
Skills  → .agent/skills/
Scripts → .agent/scripts/
Rules   → .agent/rules/
```

### Read → Understand → Apply

```
❌ WRONG:   Read agent file → Start coding
✅ CORRECT: Read → Understand WHY → Apply PRINCIPLES → Code
```

---

## TIER 1 — CODE RULES

### Project Type Routing

| Project Type            | Agent                 | Skills                                  |
| ----------------------- | --------------------- | --------------------------------------- |
| **Mobile**              | `mobile-developer`    | mobile-design                           |
| **Web (React/Next.js)** | `frontend-specialist` | frontend-design, tailwind-patterns      |
| **Backend (API/DB)**    | `backend-specialist`  | api-patterns, database-design           |
| **Security**            | `security-auditor`    | vulnerability-scanner, red-team-tactics |
| **Testing**             | `test-engineer`       | testing-patterns, tdd-workflow          |
| **DevOps**              | `devops-engineer`     | deployment-procedures, docker-expert    |

> 🔴 Mobile ≠ `frontend-specialist`. Mobile = `mobile-developer` ONLY.

### Socratic Gate (Complex Requests)

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

## TIER 2 — FINAL CHECKLIST

Trigger when user says "final checks", "verify all", "pre-deploy":

```bash
python .agent/scripts/checklist.py .
python .agent/scripts/checklist.py . --url <URL>  # with live URL
```

Priority order: **Security → Lint → Schema → Tests → UX → SEO → Lighthouse/E2E**

A task is NOT finished until `checklist.py` returns success.

### Available Scripts (12)

| Script                     | Skill                 | When to Use         |
| -------------------------- | --------------------- | ------------------- |
| `security_scan.py`         | vulnerability-scanner | Always on deploy    |
| `dependency_analyzer.py`   | vulnerability-scanner | Weekly / Deploy     |
| `lint_runner.py`           | lint-and-validate     | Every code change   |
| `test_runner.py`           | testing-patterns      | After logic change  |
| `schema_validator.py`      | database-design       | After DB change     |
| `ux_audit.py`              | frontend-design       | After UI change     |
| `accessibility_checker.py` | frontend-design       | After UI change     |
| `seo_checker.py`           | seo-fundamentals      | After page change   |
| `bundle_analyzer.py`       | performance-profiling | Before deploy       |
| `mobile_audit.py`          | mobile-design         | After mobile change |
| `lighthouse_audit.py`      | performance-profiling | Before deploy       |
| `playwright_runner.py`     | webapp-testing        | Before deploy       |

Invoke via: `python .agent/skills/<skill>/scripts/<script>.py`

### Modes

| Mode   | Agent             | Behavior                                                                             |
| ------ | ----------------- | ------------------------------------------------------------------------------------ |
| `plan` | `project-planner` | 4-phase: Analysis → Planning → Solutioning → Implementation. NO CODE before Phase 4. |
| `ask`  | —                 | Focus on understanding. Ask questions only.                                          |
| `edit` | `orchestrator`    | Execute directly. Check `{task-slug}.md` first.                                      |

---

## WORKFLOWS — Slash Commands

When user sends a slash command, read the corresponding workflow file **before** acting:

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

## Project Context — Roomie

> Java Spring Boot microservices monorepo.

| Detail                | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| Language / Framework  | Java 21, Spring Boot 3.2.5                             |
| Frontend              | React 18, Tailwind CSS                                 |
| Backend services (13) | `backend/` — parent POM at `backend/pom.xml`           |
| Infrastructure        | Docker Compose — `infra/docker-compose.yml`            |
| Databases             | MySQL 8 (port 3306), MongoDB 7 (27017), Redis 7 (6379) |
| Search                | Elasticsearch 8.11 (9200, xpack.security=true)         |
| Messaging             | Kafka                                                  |
| Credentials           | `infra/.env` (never commit)                            |

### Service Map

| Service              | Port | DB                      |
| -------------------- | ---- | ----------------------- |
| api-gateway          | 8080 | —                       |
| identity-service     | 8081 | MySQL                   |
| profile-service      | 8082 | MySQL + MongoDB         |
| property-service     | 8083 | MongoDB + Elasticsearch |
| booking-service      | 8084 | MongoDB                 |
| payment-service      | 8085 | MongoDB                 |
| billing-service      | 8086 | MongoDB                 |
| contract-service     | 8087 | MongoDB                 |
| chat-service         | 8088 | MongoDB                 |
| notification-service | 8089 | MongoDB                 |
| file-service         | 8090 | MongoDB + MinIO         |
| ai-service           | 8091 | MongoDB                 |
| admin-service        | 8092 | MySQL + MongoDB         |

### Key Config Notes

- All `application.yml` env vars use `${VAR_NAME:fallback}` format.
- ES credentials: `spring.elasticsearch.username/password` (NOT `spring.data.elasticsearch.*`).
- Env vars set at Windows User level via `[System.Environment]::SetEnvironmentVariable(..., "User")`.

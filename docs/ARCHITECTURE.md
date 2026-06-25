# BlueprintAI — Architecture Reference (Phase 0)

This document is the official project architecture for BlueprintAI Version 1.

---

## 1. System Overview

BlueprintAI follows a **modular monolith** backend and a **feature-first** frontend. Both are designed for ~100 users in V1 while supporting extraction into microservices in V2+ without rewriting business workflows.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                      │
│  Feature Modules ──► Shared UI / API / Theme / Hooks        │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST /api/v1
┌──────────────────────────▼──────────────────────────────────┐
│              Backend (Spring Boot Modular Monolith)          │
│  ┌─────────┐ ┌─────────┐ ┌────────────┐ ┌───────────────┐  │
│  │  Auth   │ │ Project │ │ AI Gateway │ │ Orchestrator  │  │
│  └────┬────┘ └────┬────┘ └─────┬──────┘ └───────┬───────┘  │
│       │           │            │                 │           │
│  ┌────▼───────────▼────────────▼─────────────────▼───────┐  │
│  │                    blueprintai-common                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │ PostgreSQL  │   Redis   │
              └─────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Layer Responsibilities

| Layer | Path | Responsibility |
|-------|------|----------------|
| **App Shell** | `src/app/` | Routing, layouts, global providers — no business logic |
| **Features** | `src/features/` | Self-contained product capabilities (auth, projects, canvas…) |
| **Shared** | `src/shared/` | Reusable UI, API client, hooks, types, theme, constants |
| **Assets** | `src/assets/` | Static images, fonts, icons |

### 2.2 Feature-First Structure

Each feature is isolated and owns its pages, components, API calls, hooks, and types:

```
features/
├── auth/           # Phase 1 — login, register, session
├── projects/       # Phase 2 — project CRUD
├── canvas/         # Phase 3 — React Flow workspace
├── ai-chat/        # Phase 4 — contextual assistant
├── home/           # Landing page
├── dashboard/      # Workspace shell
└── not-found/      # 404 handling
```

**Why feature-first?** As BlueprintAI grows to 10+ modules, organizing by `components/`, `pages/`, `hooks/` creates cross-feature coupling. Feature folders keep cohesion high and coupling low.

### 2.3 App Shell

```
app/
├── App.tsx                 # Root component
├── providers/
│   ├── AppProviders.tsx    # Composes all providers
│   ├── QueryProvider.tsx   # TanStack Query client
│   └── ThemeProvider.tsx   # Light/dark/system theme
├── router/
│   ├── index.tsx           # Router with Suspense
│   ├── routes.tsx          # Lazy-loaded route definitions
│   └── RouteFallback.tsx   # Skeleton loading state
├── layouts/
│   └── RootLayout.tsx      # Header + outlet
└── components/
    └── AppHeader.tsx       # Global navigation
```

### 2.4 Shared Layer

| Directory | Purpose |
|-----------|---------|
| `shared/ui/` | shadcn/ui-based design system components |
| `shared/theme/` | CSS tokens, globals — **no hardcoded colors in components** |
| `shared/api/` | HTTP client, query keys — caching-ready |
| `shared/hooks/` | Cross-feature hooks (`useTheme`, `useDebounce`) |
| `shared/stores/` | Zustand stores (theme persistence) |
| `shared/constants/` | Routes, HTTP status, env-backed config |
| `shared/types/` | Shared TypeScript interfaces |
| `shared/utils/` | `cn()` and pure utilities |

### 2.5 Design System

Tokens live in `shared/theme/tokens.css`:

- **Typography** — font families, size scale, weights
- **Color** — semantic tokens (`--color-primary`, `--color-muted`, …) for light and `.dark`
- **Spacing** — 4px base scale
- **Radius** — sm → xl
- **Elevation** — shadow levels 1–3
- **Motion** — duration and easing curves

Components reference tokens via Tailwind utilities mapped in `globals.css` (`bg-primary`, `text-muted-foreground`, etc.).

### 2.6 Performance (Day 1)

- **Lazy loading** — all route pages use `React.lazy()`
- **Code splitting** — Vite `manualChunks` for vendor, query, motion bundles
- **Route fallbacks** — skeleton components during chunk load
- **TanStack Query** — stale-time defaults, retry limits, cache key registry
- **Tree shaking** — ESM + Vite production build

### 2.7 Inter-Module Communication (Frontend)

Features **must not import from other features**. They communicate via:

1. Shared types and constants
2. Shared API layer
3. URL routing (deep links)
4. Global stores (sparingly, for cross-cutting concerns like theme)

---

## 3. Backend Architecture

### 3.1 Modular Monolith

The backend is a Gradle multi-module project. Each module is a bounded context with:

- `api/` — public interfaces and DTOs (the module contract)
- `internal/` — implementation details (package-private by convention)
- `config/` — Spring configuration for the module

```
backend/
├── blueprintai-common/                    # Shared infrastructure
├── blueprintai-auth/                      # Authentication & JWT
├── blueprintai-project/                   # Project management
├── blueprintai-ai-gateway/                # LLM provider abstraction
├── blueprintai-architecture-orchestrator/ # Architecture generation pipeline
├── blueprintai-diagram-engine/            # Diagram persistence & layout
├── blueprintai-learning-engine/           # Educational content enrichment
├── blueprintai-knowledge/                 # Engineering knowledge base
├── blueprintai-search/                    # Full-text / semantic search
├── blueprintai-export/                    # PDF, PNG, JSON export
├── blueprintai-review/                    # Feedback & quality tracking
└── blueprintai-app/                       # Application entry + HTTP adapters
```

### 3.2 Module Responsibilities

| Module | Responsibility | Phase |
|--------|---------------|-------|
| **common** | ApiResponse wrapper, exception handling, CORS, logging aspect | 0 |
| **auth** | JWT, BCrypt, Spring Security, user identity | 1 |
| **project** | Projects, ownership, templates | 2 |
| **ai-gateway** | Provider routing, retries, caching, failover | 4 |
| **architecture-orchestrator** | HLD/LLD/API/DB/security generators | 4 |
| **diagram-engine** | Nodes, edges, canvas state | 3 |
| **learning-engine** | What/Why/Why Not/Principles per component | 5 |
| **knowledge** | Engineering patterns, best practices corpus | 5 |
| **search** | Cross-project and knowledge search | 5 |
| **export** | Diagram and document export | 5 |
| **review** | Ratings, corrections, prompt feedback loop | 5 |
| **app** | `main()`, controllers, Flyway migrations, config | 0 |

### 3.3 Common Layer

| Component | Purpose |
|-----------|---------|
| `ApiResponse<T>` | Uniform success/error envelope for all endpoints |
| `GlobalExceptionHandler` | Centralized error mapping |
| `BusinessException` + `ErrorCode` | Typed domain errors — no magic strings |
| `WebConfig` | CORS for frontend origins |
| `LoggingAspect` | Service-layer execution timing |

### 3.4 Inter-Module Communication (Backend)

Modules communicate through **constructor-injected interfaces** only:

```java
// app module controller depends on auth API, not implementation
public HealthController(AuthService authService, ProjectService projectService, ...) {}
```

Rules:

1. `api` packages are the only public surface of a module
2. No direct database access across module boundaries
3. `blueprintai-app` is the composition root — wires modules, exposes HTTP
4. Future extraction: move `internal/` to a separate deployable, keep `api/` as client SDK

### 3.5 Database

PostgreSQL with Flyway migrations in `blueprintai-app/src/main/resources/db/migration/`.

**V1 foundation tables:** users, projects, diagrams, diagram_nodes, diagram_edges, templates, reviews, chat_messages, ai_logs.

Schema is forward-compatible — JSONB metadata columns allow evolution without migrations for experimental fields.

### 3.6 Security Foundation

- Stateless JWT sessions (configured, filter in Phase 1)
- BCrypt password encoder
- CORS locked to known frontend origins
- Rate limiting — Phase 1
- Input validation via Jakarta Validation

### 3.7 Caching

Redis configured as Spring Cache provider. AI Gateway will cache identical prompts in Phase 4.

---

## 4. Infrastructure

### Docker Compose Services

| Service | Port | Purpose |
|---------|------|---------|
| postgres | 5432 | Primary database |
| redis | 6379 | Cache + session store |
| backend | 8080 | Spring Boot API |
| frontend | 5173 (80 in container) | Nginx-served SPA |

### Environment Variables

See `.env.example` at project root and `frontend/.env.example`.

---

## 5. Quality Tooling

| Tool | Scope | Purpose |
|------|-------|---------|
| ESLint | Frontend | TypeScript strict linting |
| Prettier | Frontend | Code formatting + Tailwind class sorting |
| Husky + lint-staged | Root | Pre-commit quality gate |
| EditorConfig | All | Consistent editor settings |
| Flyway | Backend | Versioned schema migrations |
| Spring Actuator | Backend | Health, metrics, observability |

---

## 6. Design Decisions

| Decision | Rationale |
|----------|-----------|
| Modular monolith over microservices | V1 targets 100 users; avoids operational overhead while preserving module boundaries |
| Feature-first frontend | Scales with product modules; prevents god folders |
| CSS token design system | Light/dark parity; Framer-inspired premium aesthetic without hardcoded values |
| Interface-driven modules | Enables testing, swapping implementations, future service extraction |
| Gradle multi-module | Enforces compile-time boundaries between backend modules |
| TanStack Query over Redux | Server state caching with minimal boilerplate |
| Zustand for client state | Lightweight theme/UI preferences |
| Flyway over ddl-auto | Production-safe schema evolution |
| Lazy routes + code splitting | Reduces initial bundle for dashboard-scale apps |

---

## 7. Engineering Principles Applied

- **SOLID** — single-responsibility modules, interface segregation via `api` packages, dependency injection
- **Clean Architecture** — domain services in `internal/`, adapters in `app/`
- **High cohesion, low coupling** — features and modules are self-contained
- **DRY** — shared layers eliminate duplication
- **No god classes** — small services, small components
- **No magic strings** — constants, ErrorCode enum, query keys registry
- **Accessibility** — semantic HTML, focus rings, aria labels on interactive elements

---

## 8. Future Scalability Plan

### V1 → V2 (Collaboration)

- Add WebSocket module or integrate Liveblocks
- Extract diagram-engine real-time sync to dedicated service if needed
- Redis pub/sub for presence

### V2 → V3 (Simulation & Scoring)

- Add simulation module behind `ArchitectureOrchestratorService` interface
- Background job queue (Spring Batch or external worker)

### V3 → V4 (Enterprise)

- Extract **ai-gateway** to standalone service with dedicated GPU/LLM routing
- Multi-tenant schema or database-per-tenant
- API gateway (Kong/Envoy) in front of decomposed services
- Kubernetes deployment — Dockerfiles already in place

### Extraction Path per Module

Each Gradle module maps 1:1 to a future microservice:

1. Move `internal/` implementation to new repo
2. Publish `api/` as shared library or OpenAPI client
3. Replace in-process calls with HTTP/gRPC via interface adapters
4. **Business workflows unchanged** — only transport layer changes

---

## 9. Phase 0 Deliverables Checklist

- [x] Monorepo with frontend + backend
- [x] Feature-first React architecture
- [x] Modular monolith with 10 bounded contexts + common + app
- [x] Design system with light/dark themes
- [x] ESLint, Prettier, Husky, EditorConfig
- [x] Docker Compose (Postgres, Redis, backend, frontend)
- [x] Flyway foundation schema
- [x] API client + TanStack Query foundation
- [x] Lazy routes + code splitting
- [x] Health endpoint verifying all modules wired
- [x] Documentation (this file + README)

**Not in Phase 0:** Authentication flows, project CRUD, canvas editing, AI generation, search, export.

---

*BlueprintAI Phase 0 — Foundation complete. Ready for Phase 1 instructions.*

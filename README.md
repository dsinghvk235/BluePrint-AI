# BlueprintAI

**The AI workspace for understanding how systems work.**

BlueprintAI is an AI-native engineering platform for understanding, designing, and learning system architecture through interactive diagrams, engineering explanations, and a visual workspace.

> Phase 0 establishes the engineering foundation. Business features are implemented in subsequent phases.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Flow, Framer Motion, Zustand, TanStack Query, React Router, React Hook Form, Zod |
| Backend | Java 21, Spring Boot 3.5, Spring Security, JWT, PostgreSQL, Redis, Flyway |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
BluePrint-AI/
├── frontend/          # React feature-first SPA
├── backend/           # Spring Boot modular monolith (Gradle multi-module)
├── docs/              # Architecture documentation
├── docker-compose.yml # Local development stack
└── .env.example       # Environment variable template
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the complete architecture reference.

## Prerequisites

- Node.js 22+
- Java 21
- Docker & Docker Compose

## Quick Start

### 1. Environment setup

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

### 2. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Run backend

```bash
cd backend
./gradlew :blueprintai-app:bootRun
```

API available at `http://localhost:8080/api/v1/health`

### 4. Run frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

### Full stack with Docker

```bash
docker compose up --build
```

## Development Commands

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | root / frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |
| `npm run lint` | frontend | ESLint |
| `npm run format` | frontend | Prettier |
| `./gradlew :blueprintai-app:build` | backend | Compile & test |
| `./gradlew :blueprintai-app:bootRun` | backend | Run API server |

## Architecture Principles

- **Feature-first frontend** — code organized by product capability, not file type
- **Modular monolith backend** — independent Gradle modules with clear `api` / `internal` boundaries
- **Design tokens** — light/dark themes via CSS variables; no hardcoded colors in components
- **Interface-driven** — modules communicate through public service contracts
- **Performance-first** — lazy routes, code splitting, API layer ready for caching

## Phase Roadmap

| Phase | Focus |
|-------|-------|
| 0 | Foundation & architecture (current) |
| 1 | Authentication & user management |
| 2 | Projects & templates |
| 3 | Diagram canvas (React Flow) |
| 4 | AI Gateway & Architecture Orchestrator |
| 5 | Learning Engine & educational content |

## License

Proprietary — BlueprintAI Version 1

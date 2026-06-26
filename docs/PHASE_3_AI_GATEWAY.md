# Phase 3 — AI Gateway & Architecture Orchestrator

Technical documentation for BlueprintAI's intelligence layer (Version 1).

---

## 1. Overview

Phase 3 delivers the production AI infrastructure that powers architecture generation without exposing provider details to users or business modules. The system is designed for ~100 users in V1 while supporting provider expansion, local models, and future agent workflows without rewrites.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     blueprintai-app (HTTP)                          │
│  AiController  ──►  ArchitectureOrchestratorService                 │
│                           │                                         │
│                           ▼                                         │
│                     AiGatewayService (single entry point)             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  PromptManager      ProviderRouter        AiResponseCache
        │                   │                   │
        ▼                   ▼                   ▼
  Prompt Templates    Provider Clients     Redis / In-Memory
  (YAML, versioned)  (OpenAI, Claude,     (SHA-256 keyed)
                      Gemini, DeepSeek,
                      Ollama stub)
```

**Modules involved:**

| Module | Responsibility |
|--------|----------------|
| `blueprintai-ai-gateway` | Provider abstraction, routing, caching, validation, logging |
| `blueprintai-architecture-orchestrator` | Multi-generator pipeline, job tracking, model merge |
| `blueprintai-app` | HTTP adapters (`AiController`), Flyway migrations |
| `blueprintai-common` | Correlation IDs, AI error codes, global exception handling |

---

## 2. AI Gateway Architecture

### 2.1 Design Principle

All AI traffic flows through `AiGatewayService`. Business modules (orchestrator, future learning engine) **never** import provider SDKs or construct raw HTTP calls.

### 2.2 Service Responsibilities

| Service | Single Responsibility |
|---------|----------------------|
| `AiGatewayServiceImpl` | Orchestrates completion flow end-to-end |
| `ProviderManager` | Registry of `AiProviderClient` implementations |
| `ProviderRouter` | Score-based provider selection |
| `CircuitBreakerRegistry` | Per-provider failure isolation |
| `PromptManager` | Load, version, render prompt templates |
| `ResponseValidator` | JSON schema validation |
| `JsonRepairService` | Extract/repair malformed LLM JSON |
| `AiCacheService` | Prompt-hash keyed response cache |
| `UsageAnalyticsService` | Token, latency, cost, quota tracking |
| `AiLogService` / `PromptLogService` | Persist request and prompt audit trails |

### 2.3 Provider Abstraction

Each provider implements `AiProviderClient`:

```java
AiProviderType getProviderType();
boolean isAvailable();
ProviderCompletionResult complete(ProviderCompletionRequest request);
```

**Supported providers (V1):**

| Provider | Client Class | API Style |
|----------|-------------|-----------|
| OpenAI | `OpenAiProviderClient` | OpenAI Chat Completions |
| Claude | `ClaudeProviderClient` | Anthropic Messages API |
| Gemini | `GeminiProviderClient` | Google Generative Language API |
| DeepSeek | `DeepSeekProviderClient` | OpenAI-compatible |
| Ollama | `OllamaProviderClient` | Local OpenAI-compatible stub |

**Future-ready:** Ollama is wired but disabled by default. Enable via `OLLAMA_ENABLED=true`.

### 2.4 Why This Design

- **Testability:** Mock `AiGatewayService` in orchestrator tests
- **Extraction:** AI Gateway can become a standalone microservice; `api/` package becomes client SDK
- **Security:** API keys stay in configuration, never in business code

---

## 3. Provider Routing Strategy

`ProviderRouter.rankProviders()` scores each available provider:

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Circuit breaker state | Hard filter | Skip open circuits |
| Average latency | Up to -40 pts | Prefer responsive providers |
| Quota usage | -0.3 × usage% | Avoid exhausted providers |
| Cost per 1K tokens | -10 × cost | Cost efficiency |
| Task type affinity | +10–15 pts | Architecture tasks favor Claude/OpenAI; chat favors DeepSeek/Gemini |

**Routing order:** Configured `provider-priority` list filtered by availability, then sorted by score.

Users never see which provider responded — `AiCompletionResponse` omits provider details in API responses (provider info is logged internally only).

---

## 4. Retry, Failover & Circuit Breaker

### 4.1 Automatic Failover

1. Rank providers for task type
2. Try highest-ranked provider
3. On failure: record circuit failure, log, exponential backoff, try next provider
4. Repeat until success or all providers exhausted

### 4.2 Exponential Backoff

```
delay = retryInitialDelay × (retryMultiplier ^ attempt)
```

Defaults: 500ms initial, 2.0 multiplier, 3 max attempts (configurable).

### 4.3 Circuit Breaker

Per-provider in-memory state:

- **Closed:** Normal operation
- **Open:** After `circuit-breaker-failure-threshold` consecutive failures (default: 5)
- **Half-open:** After `circuit-breaker-reset-timeout` (default: 2 minutes), next request tests recovery

### 4.4 JSON Validation Retry

For structured generation (`completeJson`):

1. Parse response via `JsonRepairService`
2. Validate against schema via `ResponseValidator`
3. On failure: retry with next provider or re-attempt repair
4. Graceful error: `AI_VALIDATION_FAILED` (422) if all attempts fail

---

## 5. Architecture Orchestrator Flow

Instead of one monolithic prompt, the orchestrator runs **12 specialized generators** sequentially, accumulating context:

```
Requirements → Functional Req → Non-Functional Req → Assumptions
    → High-Level Design → Low-Level Design → Database Schema
    → API Design → Security → Deployment → Scaling → Diagram JSON
```

### 5.1 Generator Pipeline

Each generator:

1. Receives `systemDescription`, `systemType`, and accumulated context from prior steps
2. Calls `AiGatewayService.completeJson()` with its versioned prompt
3. Returns validated JSON merged into `architecture_payload`

### 5.2 Async Job Model

`POST /api/v1/ai/architecture/generate` returns `202 Accepted` immediately.

| Field | Description |
|-------|-------------|
| `generationId` | Track job via status endpoint |
| `status` | PENDING → IN_PROGRESS → COMPLETED / FAILED |
| `currentStep` | Active generator name |
| `progressPercent` | 0–100 |
| `architecture` | Full model when COMPLETED |

Persistence: `architecture_generations` table (PostgreSQL JSONB).

### 5.3 Why Sequential Generators

- **Quality:** Each step builds on prior structured output
- **Debuggability:** Failures pinpoint exact generator
- **Regeneration:** `POST /architecture/regenerate` re-runs a single section
- **Cost control:** Smaller prompts per step vs. one massive prompt

---

## 6. Prompt Management Design

### 6.1 Centralized Templates

All prompts live in:

```
blueprintai-ai-gateway/src/main/resources/prompts/*.yaml
```

**Never hardcoded in business logic.**

### 6.2 Template Format

```yaml
id: requirements
version: "1.0.0"
taskType: ARCHITECTURE_GENERATION
generatorName: requirements-generator
systemPrompt: |
  You are a senior software architect...
userPrompt: |
  System description: {{systemDescription}}
  System type: {{systemType}}
```

### 6.3 Features

| Feature | Implementation |
|---------|----------------|
| Versioning | `id` + `version` key (`requirements:1.0.0`) |
| Variables | `{{variableName}}` interpolation |
| Context injection | Orchestrator passes accumulated context as `{{context}}` |
| System/User separation | Distinct prompt fields per template |
| Prompt logging | `prompt_logs` table stores rendered prompts per correlation ID |

### 6.4 Prompt Versioning Strategy

- Bump `version` in YAML filename and content for changes
- `metadata.generatorVersions` in output tracks which versions were used
- Enables A/B testing and feedback loops (review module, Phase 5)

---

## 7. JSON Schemas

Architecture generation **never returns free-form text** to the frontend for structured sections.

### 7.1 Schema Location

```
blueprintai-ai-gateway/src/main/resources/schemas/architecture-model.schema.json
```

### 7.2 Top-Level Model

| Section | Key Fields |
|---------|-----------|
| Requirements | `title`, `summary`, `stakeholders`, `constraints` |
| Functional Requirements | `id`, `title`, `description`, `priority` |
| Non-Functional Requirements | `id`, `category`, `title`, `metric` |
| High-Level Design | `services[]`, `connections[]` |
| Database Schema | `tables[]`, `relationships[]` |
| APIs | `apis[]` with path, method, auth |
| Security | `controls[]`, `threatMitigations[]` |
| Diagram | `nodes[]`, `connections[]` (React Flow ready) |
| Metadata | `schemaVersion`, `generatedAt`, `generatorVersions` |

### 7.3 Validation Flow

```
LLM Response → JsonRepairService → ResponseValidator → Business Logic
                      ↓ fail
                 Retry / Failover
                      ↓ all fail
              AI_VALIDATION_FAILED (422)
```

---

## 8. Caching Strategy

### 8.1 Cache Key

```
SHA-256(promptId + version + systemPrompt + userPrompt)
```

### 8.2 Storage

| Environment | Backend |
|-------------|---------|
| Production (Redis available) | Redis with TTL |
| Tests / no Redis | In-memory `ConcurrentHashMap` fallback |

### 8.3 TTL Strategy

| Task Type | TTL | Rationale |
|-----------|-----|-----------|
| Architecture generation | 24 hours | Stable for identical inputs |
| Chat | 30 minutes | Conversations evolve |

### 8.4 Invalidation

- `invalidate(promptHash)` — single entry
- Regenerate section sets `useCache=false`
- Chat always bypasses cache

### 8.5 Why Cache

Repeated identical architecture prompts (templates, demos, retries) avoid redundant API costs and reduce latency from seconds to milliseconds.

---

## 9. Logging, Cost & Observability

### 9.1 Correlation IDs

`CorrelationIdFilter` assigns `X-Correlation-Id` to every HTTP request (MDC-backed). Propagated through AI requests, logs, and `ai_logs` / `prompt_logs`.

### 9.2 AI Request Logging (`ai_logs`)

| Column | Purpose |
|--------|---------|
| `request_id` | Unique per completion |
| `correlation_id` | Trace across services |
| `provider`, `model` | Internal analytics only |
| `tokens_input/output` | Usage tracking |
| `latency_ms` | Performance monitoring |
| `cost_usd` | Per-request cost |
| `status` | SUCCESS / FAILURE |
| `prompt_hash` | Cache correlation |

### 9.3 Usage Analytics

In-memory daily counters per provider:

- Token consumption vs. `daily-quota-tokens`
- Rolling average latency
- Cumulative cost per provider

### 9.4 Health Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Module readiness (`ai-gateway`, `architecture-orchestrator`) |
| `GET /api/v1/ai/providers/health` | Per-provider availability, circuit state, latency, quota |

### 9.5 Error Codes

| Code | HTTP | When |
|------|------|------|
| `AI_PROVIDER_UNAVAILABLE` | 503 | No providers configured |
| `AI_GENERATION_FAILED` | 502 | All providers failed |
| `AI_VALIDATION_FAILED` | 422 | JSON schema validation failed |
| `AI_RATE_LIMITED` | 429 | Rate limit hook (future Bucket4j) |

Internal errors never expose provider implementation details to clients.

---

## 10. API Specifications

Base path: `/api/v1/ai` (JWT authentication required)

### 10.1 Generate Architecture

```
POST /architecture/generate
```

**Request:**
```json
{
  "projectId": "uuid",
  "systemDescription": "Build a real-time chat app for 100 users...",
  "systemType": "web-application",
  "useCache": true
}
```

**Response:** `202 Accepted`
```json
{
  "status": "success",
  "data": {
    "generationId": "uuid",
    "status": "PENDING",
    "progressPercent": 0,
    "currentStep": "initializing"
  }
}
```

### 10.2 Get Generation Status

```
GET /architecture/generations/{generationId}
```

**Response:** Full status including `architecture` when `COMPLETED`.

### 10.3 Regenerate Section

```
POST /architecture/regenerate
```

**Request:**
```json
{
  "projectId": "uuid",
  "generationId": "uuid",
  "section": "SECURITY",
  "additionalContext": "Must support SAML SSO"
}
```

### 10.4 Validate Architecture

```
POST /architecture/validate
```

**Request:** `{ "architecture": { ... } }`  
**Response:** `{ "valid": true, "errors": [], "warnings": [] }`

### 10.5 Continue Conversation

```
POST /architecture/conversation
```

**Request:**
```json
{
  "projectId": "uuid",
  "generationId": "uuid",
  "message": "Why did you choose PostgreSQL over MongoDB?"
}
```

### 10.6 Provider Health (Admin)

```
GET /providers/health
```

---

## 11. Configuration

### 11.1 Environment Variables

See `.env.example` for all provider keys. Enable at least one provider:

```bash
OPENAI_ENABLED=true
OPENAI_API_KEY=sk-...
```

### 11.2 Application Properties

```yaml
blueprintai.ai:
  enabled: true
  cache-ttl: 24h
  max-retry-attempts: 3
  provider-priority: [OPENAI, CLAUDE, GEMINI, DEEPSEEK]
  providers:
    OPENAI:
      enabled: true
      api-key: ${OPENAI_API_KEY}
      default-model: gpt-4o-mini
```

---

## 12. Database Schema (V3 Migration)

| Table | Purpose |
|-------|---------|
| `architecture_generations` | Async job state + JSONB architecture payload |
| `prompt_logs` | Rendered prompts for audit/debug |
| `ai_logs` (extended) | Correlation ID, cost, task type, generator name |

---

## 13. Future Extension Points

### 13.1 Additional Providers

1. Implement `AiProviderClient` (extend `AbstractHttpProviderClient`)
2. Register as `@Component`
3. Add config block under `blueprintai.ai.providers`
4. Add to `provider-priority` list

### 13.2 Local Models (Ollama)

Already stubbed via `OllamaProviderClient`. Enable with:

```bash
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
```

### 13.3 AI Agents

The orchestrator's generator pattern supports:

- Parallel generator execution (V2)
- Agent loops with tool calling (inject via `AiGatewayService.complete()`)
- Human-in-the-loop approval between steps

### 13.4 Rate Limiting

`RateLimitFilter` in auth module is a pass-through placeholder. Wire Bucket4j with Redis for per-user AI quotas.

### 13.5 Streaming

Add `AiGatewayService.completeStream()` returning `Flux<String>` for SSE endpoints.

### 13.6 Microservice Extraction

```
blueprintai-ai-gateway  →  standalone LLM routing service
api/ package              →  published client library
Orchestrator              →  calls gateway via HTTP adapter
```

Business workflows unchanged — only transport layer changes.

---

## 14. What Is NOT in Phase 3

Per requirements, the following belong to later phases:

- React Flow canvas UI integration (Phase 3/4 frontend)
- Diagram persistence via `diagram-engine`
- Learning Engine explanations
- Frontend `ai-chat` feature wiring

The backend returns structured `diagram.nodes` and `diagram.connections` JSON ready for future canvas integration.

---

*BlueprintAI Phase 3 — AI Gateway & Architecture Orchestrator complete.*

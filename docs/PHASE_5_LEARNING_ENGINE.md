# Phase 5 — Learning Engine, Knowledge System & AI Engineering Mentor

BlueprintAI's identity is **not** a diagram generator — it is an **AI Engineering Mentor**. Phase 5 implements the Learning Engine: the product differentiator that transforms every architecture into an interactive engineering education experience.

## Educational Philosophy

| Principle | Implementation |
|-----------|----------------|
| Never overwhelm | 9 progressive layers unlock sequentially |
| Never under-explain | Knowledge corpus + contextual synthesis per component |
| Teach how engineers think | Decision logs, trade-offs, alternatives, interview prep |
| Context always matters | Explanations reference diagram topology, neighbors, technology |
| Exploration over reading | Click nodes, highlight dependencies, ask follow-ups |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                            │
│  ┌──────────────┐   ┌─────────────────┐   ┌─────────────────────┐ │
│  │ Canvas Store │   │ Learning Store  │   │ Learning Panel UI   │ │
│  │ (diagram)    │   │ (mode, layers)  │   │ Progressive layers  │ │
│  └──────┬───────┘   └────────┬────────┘   │ Mentor chat         │ │
│         │                    │             │ Dependency explorer │ │
│         └────────┬───────────┘             └──────────┬──────────┘ │
│                  │                                    │             │
│         ┌────────▼────────────────────────────────────▼─────────┐ │
│         │     learning-engine/ (framework-agnostic TypeScript)    │ │
│         │  context-builder · explanation-pipeline · cache         │ │
│         └────────────────────────┬────────────────────────────────┘ │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │ REST API
┌──────────────────────────────────▼──────────────────────────────────┐
│                    blueprintai-app (LearningController)              │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────┐    ┌───────────▼──────────┐   ┌─────────▼────────┐
│ learning-engine │    │ knowledge            │   │ diagram-engine   │
│ Explanation     │◄───│ 16 concept corpus    │   │ canvas JSONB     │
│ MentorChat      │    │ extensible JSON      │   │                  │
│ Decision logs   │    └──────────────────────┘   └──────────────────┘
│ LearningCache   │
└────────┬────────┘
         │ AiGatewayService only (never provider SDKs)
┌────────▼────────┐
│ ai-gateway      │
│ EXPLANATION     │
│ CHAT            │
└─────────────────┘
```

**Modularity rule:** The Learning Engine never imports React components or AI provider SDKs. The frontend `learning-engine/` module has zero React dependencies.

---

## Knowledge System Design

### Location
- **Backend:** `backend/blueprintai-knowledge/`
- **Catalog:** `src/main/resources/knowledge/catalog.json`
- **Extensions:** Drop additional `knowledge/concepts/*.json` files — loaded automatically

### Concept Schema
Each concept includes:
- Overview, purpose, engineering principles, design patterns, SOLID (if applicable)
- Advantages, disadvantages, trade-offs
- Alternatives (name, description, whenToUse)
- Real-world examples, common mistakes, interview questions
- Related concepts and references

### Covered Topics (v1.0.0)
Databases · Caching · Queues · Load Balancers · Microservices · Event-Driven Architecture · CAP Theorem · CQRS · Circuit Breaker · API Gateway · OAuth · JWT · Docker · Kubernetes · CDN · Service Discovery

### Resolution Strategy
`KnowledgeService.resolveConcept(technology, nodeCategory)` matches:
1. Technology string (e.g. "Redis" → caching)
2. Node category alias (e.g. `database` → databases)
3. Token splitting for compound technology fields

### API
| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/knowledge/concepts` | List all concepts |
| `GET /api/v1/knowledge/concepts?q=` | Search |
| `GET /api/v1/knowledge/concepts/{id}` | Full concept |
| `GET /api/v1/knowledge/concepts/{id}/related` | Related concepts |

---

## Learning Engine

### Location
- **Backend:** `backend/blueprintai-learning-engine/`
- **Frontend module:** `frontend/src/learning-engine/` (no React)
- **Frontend feature:** `frontend/src/features/learning/` (UI + API)

### Progressive Learning Layers

| Order | Layer ID | Content |
|-------|----------|---------|
| 1 | `overview` | What is this component? |
| 2 | `purpose` | Why is it used? |
| 3 | `reasoning` | Why selected in *this* architecture? |
| 4 | `principle` | Engineering principles & patterns |
| 5 | `tradeoffs` | Advantages, disadvantages, costs |
| 6 | `alternatives` | Other viable technologies |
| 7 | `best-practices` | Production lessons, common mistakes |
| 8 | `interview` | Practice questions |
| 9 | `advanced` | Deep analysis (mode-gated) |

Layers unlock sequentially in the UI. Users click **Continue to [next layer]** to progress naturally.

### Learning Modes

| Mode | Tone |
|------|------|
| Beginner | Simple language, analogies, define all terms |
| Intermediate | Basic CS assumed, clear trade-offs |
| SDE-1 | Interview-ready implementation depth |
| Senior Engineer | Scale, failure modes, operations |
| Staff Engineer | Strategic framing, org impact, evolution |

The same component produces different content depth and tone via `ExplanationSynthesizer`.

### Explanation Pipeline

```
Diagram JSON (canvas)
    → LearningContextBuilder (nodes, edges, neighbors)
    → KnowledgeService.resolveConcept(technology, category)
    → ExplanationSynthesizer (9 layers + decision log)
    → LearningCacheService (Redis / in-memory, 24h TTL)
    → ComponentKnowledgeResponse
```

**AI enhancement path (optional):** When `AiGatewayService.isReady()`, `MentorChatService` uses `mentor-chat-1.0.0` prompt. Component explanations use knowledge synthesis by default (fast, no API cost). Future: `component-explanation` prompt for AI-enriched layers.

### API
| Endpoint | Description |
|----------|-------------|
| `GET /projects/{id}/learning/nodes/{nodeId}?mode=&layer=` | Component knowledge |
| `GET /projects/{id}/learning/overview?mode=` | Architecture overview |
| `GET /projects/{id}/learning/decisions?nodeId=` | Decision logs |
| `GET /projects/{id}/learning/dependencies/{nodeId}` | Upstream/downstream |
| `POST /projects/{id}/learning/mentor` | AI Engineering Mentor chat |

---

## AI Engineering Mentor Workflow

Unlike generic chatbots, the mentor:

1. **Receives full architecture context** — all nodes and connections
2. **Receives selected component context** — label, technology, upstream/downstream
3. **Adapts to learning mode** — tone guidance injected into prompt
4. **Maintains conversation history** — multi-turn context
5. **Falls back gracefully** — knowledge-based responses when AI unavailable

### Example Questions Supported
- "Why Redis?" / "Why not MongoDB?"
- "Replace RabbitMQ with Kafka"
- "Explain this to a beginner"
- "Explain like a Staff Engineer"
- "Suggest improvements" / "Find bottlenecks"

### Prompt
`backend/blueprintai-ai-gateway/src/main/resources/prompts/mentor-chat-1.0.0.yaml`

---

## Decision Log Structure

Every component gets a contextual decision log:

```json
{
  "decision": "Use Redis as the Caching component",
  "reason": "Placed with 2 inbound, 3 outbound connections...",
  "engineeringPrinciple": "Cache-aside pattern",
  "assumptions": ["Architecture generated for described system"],
  "alternativesConsidered": [
    { "name": "Memcached", "reasonRejected": "Not selected — pure key-value at scale" }
  ],
  "tradeoffs": ["Consistency vs speed"],
  "potentialRisks": ["Cache invalidation without strategy"],
  "futureImprovements": ["Monitor under production load"]
}
```

Persisted schema: `decision_logs` table (V5 migration). Runtime generation works without DB writes; table ready for caching/persistence.

---

## Context Management

| State | Store | Responsibility |
|-------|-------|----------------|
| Canvas nodes/edges | `useCanvasStore` | Diagram editing, selection |
| Learning mode, expanded layer | `useLearningStore` | Progressive UX, mentor messages |
| Highlighted dependencies | `useLearningStore` | Dims non-related nodes on canvas |
| Server explanations | TanStack Query | Cached API responses |

**Separation:** Learning state never mutates canvas data. Canvas selection syncs to learning store via `useEffect` in `LearningPanel`.

---

## Caching Strategy

| Layer | Key Pattern | TTL |
|-------|-------------|-----|
| Component knowledge | `learning:component:{projectId}:{nodeId}:{mode}` | 24h |
| Mentor responses | `learning:mentor:{projectId}:{nodeId}:{mode}:{hash}` | AI gateway chat TTL |
| Frontend memory | `component:{projectId}:{nodeId}:{mode}` | 24h |

**Invalidation:** Diagram edits should invalidate component cache (future: hook into autosave). `useCache=true` by default on GET endpoints.

---

## Interactive Exploration

| Action | Behavior |
|--------|----------|
| Click node | Opens learning panel, loads component knowledge |
| Dependency explorer | Highlights upstream/downstream on canvas |
| Click dependency chip | Selects that node, updates learning context |
| Switch learning mode | Refetches explanations with new tone/depth |
| Mentor chat | Context-aware Q&A about selected component |

---

## Future Extensions (designed in, not yet built)

### Quiz Engine
- `LearningLayer.INTERVIEW` already generates questions
- Add `QuizService` consuming `ComponentKnowledgeResponse.layers[interview]`
- Store scores in new `learning_progress` table

### Interview Mode
- Timed sessions using interview layer + mentor chat
- Rubric scoring via `AiTaskType.EXPLANATION`

### Simulation Integration
- Decision log `futureImprovements` → simulation parameters
- Load test suggestions from mentor "find bottlenecks" responses

### AI-Enriched Layers
- `component-explanation-1.0.0.yaml` prompt ready
- Hybrid: knowledge base + AI enhancement for `reasoning` and `advanced` layers

---

## File Reference

### Backend
| Path | Purpose |
|------|---------|
| `blueprintai-knowledge/` | Knowledge corpus module |
| `blueprintai-learning-engine/` | Learning Engine module |
| `blueprintai-app/.../LearningController.java` | REST API |
| `db/migration/V5__learning_engine.sql` | Persistence tables |
| `prompts/mentor-chat-1.0.0.yaml` | Mentor AI prompt |

### Frontend
| Path | Purpose |
|------|---------|
| `src/learning-engine/` | Framework-agnostic core |
| `src/features/learning/` | React feature (API, hooks, components) |
| `src/features/canvas/components/LearningPanel.tsx` | Inspector integration |

---

## Health Check

Both modules report `isReady(): true` when the knowledge catalog loads:
- `GET /api/v1/health` → `learning-engine: true`, `knowledge: true`

---

## Testing the Feature

1. Open a project workspace with a generated diagram
2. Select any node on the canvas
3. Open **Learn** tab — progressive layers load from API
4. Switch **Learning mode** — content depth changes
5. Use **Dependencies** to highlight related services
6. Open **Mentor** tab — ask "Why was this chosen?"
7. Expand **Decision Log** accordion for AI reasoning transparency

With AI providers configured, mentor chat uses live AI. Without providers, knowledge-based fallbacks still educate effectively.

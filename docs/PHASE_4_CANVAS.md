# Phase 4 — Interactive Canvas & Diagram Engine

BlueprintAI's canvas is an interactive engineering workspace — not a static diagram generator. This document describes the architecture, data flow, and design decisions for Phase 4.

## Overview

```
User Prompt
    ↓
Architecture Orchestrator (backend)
    ↓
Structured JSON (diagram.nodes / diagram.connections)
    ↓
Diagram Engine (frontend) — validate, normalize, layout
    ↓
React Flow Canvas (Zustand state)
    ↓
User Interaction (edit, connect, arrange)
    ↓
Autosave → Diagram API (backend persistence)
```

**Critical rule:** Raw AI output never reaches React Flow directly. All diagram data passes through `processDiagramJson()` in the Diagram Engine.

---

## Canvas Architecture

### Three-panel layout

| Region | Component | Responsibility |
|--------|-----------|----------------|
| Left sidebar | `WorkspaceLeftPanel` | Explorer, component library, templates, layers |
| Center | `CanvasFlow` | Infinite React Flow canvas |
| Right sidebar | `LearningPanel` | Learn, AI explanation, properties inspector |
| Top | `CanvasToolbar` | Generate, save, undo/redo, export, align |
| Bottom | `CanvasStatusBar` | Zoom, cursor position, selection count, connection status |

Panel visibility is managed by `useCanvasUiStore` (Zustand). Canvas graph state lives in `useCanvasStore` (Zustand). Server data uses TanStack Query via `useDiagram` and `useSaveDiagram`.

### Why separate UI and canvas stores?

- **Canvas store** — high-frequency updates (node drag, selection). Subscribed by React Flow and node components.
- **UI store** — low-frequency panel/dialog state. Avoids re-rendering the entire graph when toggling panels.
- **TanStack Query** — server diagram snapshots, project metadata, generation polling.

This mirrors the project's existing pattern: Zustand for client state, Query for server state.

---

## Diagram Engine Flow

Entry point: `frontend/src/features/canvas/engine/diagram-engine.ts`

### Pipeline stages

1. **Validate** (`validate.ts`)
   - Parse `nodes` and `connections` arrays
   - Reject invalid entries, deduplicate IDs
   - Remove connections with missing endpoints or self-loops
   - Normalize node types via alias map

2. **Cycle detection** (`cycle-detector.ts`)
   - DFS-based cycle detection for layout warnings
   - Cycles are flagged but not removed (valid in some architectures)

3. **Auto-layout** (`layout.ts`)
   - Layered topological layout for nodes without positions
   - Snap-to-grid (20px) for alignment consistency
   - Preserves explicit AI-provided coordinates

4. **React Flow adapter** (`react-flow-adapter.ts`)
   - Maps AI schema → `BlueprintNode` / `BlueprintEdge`
   - Enriches nodes with category config, status, technology metadata

### Why a frontend Diagram Engine?

The backend orchestrator produces schema-valid JSON, but production diagrams need:

- Invalid link removal (AI hallucinates node IDs)
- Consistent node typing across providers
- Automatic positioning when AI omits coordinates
- Unified metadata shape for the property inspector

Keeping transformation on the frontend allows instant feedback during generation without round-trips, while the backend Diagram API stores the **post-engine** canvas snapshot.

---

## Node System

### Custom node: `BlueprintNode`

Located at `frontend/src/features/canvas/components/nodes/BlueprintNode.tsx`.

Every node supports:

| Feature | Implementation |
|---------|----------------|
| Icon | Category-driven via `NODE_CATEGORIES` |
| Title / subtitle | `data.label`, `data.subtitle` |
| Status badge | `active`, `loading`, `error`, `draft`, `deprecated` |
| Technology tag | `data.technology` |
| Color coding | CSS variables per category in `tokens.css` |
| Hover animation | Tailwind `hover:-translate-y-0.5` |
| Selection ring | React Flow `selected` prop |
| Loading / error | `data.loading`, `data.status`, `data.error` |
| Inline rename | Double-click → input field |

### Categories

`api-gateway`, `microservice`, `service`, `database`, `cache`, `queue`, `cdn`, `storage`, `load-balancer`, `external-api`, `authentication`, `worker`, `monitoring`, `client`, `custom`

AI types (`service`, `database`, etc.) map to these via `normalizeNodeType()`.

---

## Edge System

Custom edge: `BlueprintEdge` with bezier paths, animated flow dots for async connections, and inline labels via `EdgeLabelRenderer`.

Default connection style: animated `blueprint` type edges created on connect.

---

## State Management

### `useCanvasStore`

| State | Purpose |
|-------|---------|
| `nodes`, `edges` | React Flow graph |
| `viewport` | Pan/zoom for autosave |
| `past`, `future` | Undo/redo history (max 50 entries) |
| `isDirty` | Unsaved changes indicator |
| `diagramVersion` | Optimistic concurrency for saves |
| `engineWarnings` | Diagram engine validation messages |

History is pushed only on meaningful changes (not selection or in-progress drags).

### Clipboard

Copy/paste uses an in-memory clipboard in the store module (not system clipboard) for node + internal edge duplication.

---

## React Flow Integration

`CanvasFlow` configures:

- `snapToGrid` + 20px grid
- `SelectionMode.Partial` for rectangle selection
- `panOnScroll`, `zoomOnScroll`, `zoomOnPinch`
- `ConnectionMode.Loose`
- `MiniMap` with category-colored nodes
- Drag-and-drop from component library via `dataTransfer`
- Right-click context menu (copy, paste, duplicate, delete, auto-arrange)

React Flow CSS is imported once in `WorkspacePage`. Heavy `@xyflow` code is code-split via Vite (`flow` chunk).

### Performance

- `BlueprintNode` and `BlueprintEdge` are wrapped in `memo()`
- Store selectors limit subscriptions (`useCanvasStore(s => s.nodes)`)
- Node types registered once via `nodeTypes` / `edgeTypes` objects
- History capped at 50 entries to bound memory

---

## AI Gateway Integration

### Flow

1. User opens Generate dialog → `useArchitectureGeneration`
2. `POST /api/v1/ai/architecture/generate` → `generationId`
3. Poll `GET /api/v1/ai/architecture/generations/{id}` every 2s
4. On `COMPLETED`, extract `architecture.diagram`
5. `loadFromEngine(diagram)` → `processDiagramJson()` → canvas update
6. `GenerationProgress` overlay shows step + percent

The frontend never parses raw LLM text — only structured JSON from the orchestrator.

---

## Autosave Strategy

`useAutosave` debounces dirty state (2s) and calls `PUT /api/v1/projects/{id}/diagram`.

| Feature | Behavior |
|---------|----------|
| Autosave | After 2s of no changes when `isDirty` |
| Manual save | Toolbar ⌘S → immediate save |
| Unsaved indicator | Toolbar shows "Unsaved" / "Saving…" |
| Version metadata | `lastSavedAt`, `source: user` sent with each save |
| Conflict detection | `expectedVersion` on save → 409 on mismatch |
| Local recovery | `localStorage` backup keyed by `projectId` |
| Refresh recovery | Load server diagram; fall back to localStorage if empty |

### Why JSONB canvas snapshots?

The normalized `diagram_nodes` / `diagram_edges` tables remain for future analytics. Phase 4 stores the full React Flow snapshot in `diagrams.canvas_data` (JSONB) for:

- Fast round-trip without ORM mapping complexity
- Viewport preservation
- Future collaboration (operational transform on snapshot)
- Version metadata for conflict resolution

---

## Backend API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/projects/{projectId}/diagram` | Load diagram (empty snapshot if new) |
| `PUT` | `/api/v1/projects/{projectId}/diagram` | Save canvas snapshot |

DTOs: `DiagramResponse`, `SaveDiagramRequest` in `blueprintai-diagram-engine`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘Z | Undo |
| ⌘⇧Z / ⌘Y | Redo |
| ⌘C | Copy selected |
| ⌘V | Paste |
| ⌘D | Duplicate |
| ⌘S | Save |
| ⌘0 | Fit view |
| Backspace / Delete | Delete selected |

---

## Future Collaboration Readiness

| Concern | Current foundation |
|---------|-------------------|
| Version conflicts | `diagram.version` + `expectedVersion` on save |
| Version metadata | `version_metadata` JSONB column |
| Operational history | Undo/redo stack (local); extensible to server-side ops log |
| Normalized storage | `diagram_nodes` / `diagram_edges` tables ready for sync |
| User attribution | `versionMetadata.lastSavedBy` placeholder in save payload |

---

## File Map

```
frontend/src/features/canvas/
├── api/
│   ├── architecture-api.ts
│   └── diagrams-api.ts
├── components/
│   ├── nodes/BlueprintNode.tsx
│   ├── edges/BlueprintEdge.tsx
│   ├── CanvasFlow.tsx
│   ├── CanvasToolbar.tsx
│   ├── CanvasStatusBar.tsx
│   ├── GenerateDialog.tsx
│   ├── GenerationProgress.tsx
│   ├── EmptyCanvasGuide.tsx
│   ├── WorkspaceLeftPanel.tsx
│   └── LearningPanel.tsx
├── engine/
│   ├── diagram-engine.ts      # Main entry
│   ├── validate.ts
│   ├── layout.ts
│   ├── cycle-detector.ts
│   ├── react-flow-adapter.ts
│   └── node-config.ts
├── hooks/
│   ├── use-diagram.ts
│   ├── use-architecture-generation.ts
│   ├── use-autosave.ts
│   └── use-canvas-keyboard.ts
├── stores/
│   ├── canvas-store.ts
│   └── canvas-ui-store.ts
├── types/diagram.ts
└── pages/WorkspacePage.tsx

backend/blueprintai-diagram-engine/
├── api/DiagramService.java
├── api/dto/
├── internal/DiagramServiceImpl.java
├── internal/entity/Diagram.java
└── internal/repository/DiagramRepository.java
```

---

## Design Decisions Summary

1. **Diagram Engine on frontend** — Instant feedback, no extra latency, single transformation path for AI and import/export.
2. **Zustand over Redux** — Matches existing project patterns; simpler API for high-frequency canvas updates.
3. **JSONB snapshots** — Pragmatic persistence for Phase 4; normalized tables deferred to collaboration phase.
4. **Custom nodes over default** — Premium UX requirement; category system scales to new component types.
5. **Separate concerns** — Engine transforms data; store manages graph; Query manages server; UI store manages chrome.

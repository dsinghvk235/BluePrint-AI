import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type Viewport,
  addEdge,
} from '@xyflow/react'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { autoLayoutNodes, alignNodes } from '@/features/canvas/engine/layout'
import { processDiagramJson } from '@/features/canvas/engine/diagram-engine'
import {
  aiConnectionsToReactFlow,
  aiNodesToReactFlow,
  createNodeFromCategory,
} from '@/features/canvas/engine/react-flow-adapter'
import type {
  BlueprintEdge,
  BlueprintNode,
  BlueprintNodeData,
} from '@/features/canvas/types/diagram'

const MAX_HISTORY = 50
const GRID_SNAP = 20

interface HistoryEntry {
  nodes: BlueprintNode[]
  edges: BlueprintEdge[]
}

interface CanvasState {
  nodes: BlueprintNode[]
  edges: BlueprintEdge[]
  viewport: Viewport
  past: HistoryEntry[]
  future: HistoryEntry[]
  isDirty: boolean
  diagramVersion: number
  engineWarnings: string[]

  setViewport: (viewport: Viewport) => void
  onNodesChange: (changes: NodeChange<BlueprintNode>[]) => void
  onEdgesChange: (changes: EdgeChange<BlueprintEdge>[]) => void
  onConnect: (connection: Connection) => void

  loadFromEngine: (input: unknown) => void
  loadSnapshot: (nodes: BlueprintNode[], edges: BlueprintEdge[], viewport?: Viewport) => void
  setDiagramVersion: (version: number) => void
  markClean: () => void

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  deleteSelected: () => void
  duplicateSelected: () => void
  copySelected: () => void
  paste: () => void

  addNode: (category: BlueprintNodeData['category'], position: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Partial<BlueprintNodeData>) => void
  renameNode: (id: string, label: string) => void
  autoArrange: () => void
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void

  getSelectedNodes: () => BlueprintNode[]
  getSelectedCount: () => number
}

let clipboard: { nodes: BlueprintNode[]; edges: BlueprintEdge[] } | null = null

function snapPosition(pos: { x: number; y: number }) {
  return {
    x: Math.round(pos.x / GRID_SNAP) * GRID_SNAP,
    y: Math.round(pos.y / GRID_SNAP) * GRID_SNAP,
  }
}

function snapshot(state: CanvasState): HistoryEntry {
  return {
    nodes: structuredClone(state.nodes),
    edges: structuredClone(state.edges),
  }
}

function pushHistory(state: CanvasState): Partial<CanvasState> {
  const entry = snapshot(state)
  const past = [...state.past, entry].slice(-MAX_HISTORY)
  return { past, future: [], isDirty: true }
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    past: [],
    future: [],
    isDirty: false,
    diagramVersion: 0,
    engineWarnings: [],

    setViewport: (viewport) => set({ viewport }),

    onNodesChange: (changes) => {
      const hasMeaningfulChange = changes.some((c) => {
        if (c.type === 'select' || c.type === 'dimensions') return false
        if (c.type === 'position') return c.dragging === false
        return true
      })
      set((state) => {
        const nodes = applyNodeChanges(changes, state.nodes) as BlueprintNode[]
        const snapped = nodes.map((n) =>
          changes.some(
            (c) => c.type === 'position' && 'id' in c && c.id === n.id && c.dragging === false,
          )
            ? { ...n, position: snapPosition(n.position) }
            : n,
        )
        return {
          nodes: snapped,
          ...(hasMeaningfulChange ? pushHistory(state) : {}),
        }
      })
    },

    onEdgesChange: (changes) => {
      const hasMeaningfulChange = changes.some((c) => c.type !== 'select')
      set((state) => ({
        edges: applyEdgeChanges(changes, state.edges) as BlueprintEdge[],
        ...(hasMeaningfulChange ? pushHistory(state) : {}),
      }))
    },

    onConnect: (connection) => {
      set((state) => ({
        edges: addEdge(
          {
            ...connection,
            type: 'blueprint',
            animated: true,
            id: `edge-${crypto.randomUUID().slice(0, 8)}`,
          },
          state.edges,
        ) as BlueprintEdge[],
        ...pushHistory(state),
      }))
    },

    loadFromEngine: (input) => {
      const result = processDiagramJson(input)
      set({
        nodes: result.nodes,
        edges: result.edges,
        engineWarnings: result.warnings,
        past: [],
        future: [],
        isDirty: true,
      })
    },

    loadSnapshot: (nodes, edges, viewport) => {
      set({
        nodes,
        edges,
        viewport: viewport ?? { x: 0, y: 0, zoom: 1 },
        past: [],
        future: [],
        isDirty: false,
        engineWarnings: [],
      })
    },

    setDiagramVersion: (version) => set({ diagramVersion: version }),
    markClean: () => set({ isDirty: false }),

    undo: () => {
      const { past, nodes, edges, future } = get()
      if (past.length === 0) return
      const previous = past[past.length - 1]!
      set({
        nodes: previous.nodes,
        edges: previous.edges,
        past: past.slice(0, -1),
        future: [{ nodes, edges }, ...future].slice(0, MAX_HISTORY),
        isDirty: true,
      })
    },

    redo: () => {
      const { future, nodes, edges, past } = get()
      if (future.length === 0) return
      const next = future[0]!
      set({
        nodes: next.nodes,
        edges: next.edges,
        future: future.slice(1),
        past: [...past, { nodes, edges }].slice(-MAX_HISTORY),
        isDirty: true,
      })
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    deleteSelected: () => {
      set((state) => {
        const selectedIds = new Set(state.nodes.filter((n) => n.selected).map((n) => n.id))
        if (selectedIds.size === 0) return state
        return {
          nodes: state.nodes.filter((n) => !n.selected),
          edges: state.edges.filter(
            (e) => !e.selected && !selectedIds.has(e.source) && !selectedIds.has(e.target),
          ),
          ...pushHistory(state),
        }
      })
    },

    duplicateSelected: () => {
      set((state) => {
        const selected = state.nodes.filter((n) => n.selected)
        if (selected.length === 0) return state

        const idMap = new Map<string, string>()
        const newNodes = selected.map((n) => {
          const newId = `${n.id}-copy-${crypto.randomUUID().slice(0, 6)}`
          idMap.set(n.id, newId)
          return {
            ...structuredClone(n),
            id: newId,
            position: { x: n.position.x + 40, y: n.position.y + 40 },
            selected: true,
          }
        })

        const selectedIds = new Set(selected.map((n) => n.id))
        const newEdges = state.edges
          .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
          .map((e) => ({
            ...structuredClone(e),
            id: `edge-${crypto.randomUUID().slice(0, 8)}`,
            source: idMap.get(e.source)!,
            target: idMap.get(e.target)!,
          }))

        return {
          nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
          edges: [...state.edges, ...newEdges],
          ...pushHistory(state),
        }
      })
    },

    copySelected: () => {
      const selected = get().nodes.filter((n) => n.selected)
      if (selected.length === 0) return
      const selectedIds = new Set(selected.map((n) => n.id))
      clipboard = {
        nodes: structuredClone(selected),
        edges: structuredClone(
          get().edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target)),
        ),
      }
    },

    paste: () => {
      if (!clipboard || clipboard.nodes.length === 0) return
      const idMap = new Map<string, string>()
      const newNodes = clipboard.nodes.map((n) => {
        const newId = `${n.data.category}-${crypto.randomUUID().slice(0, 8)}`
        idMap.set(n.id, newId)
        return {
          ...structuredClone(n),
          id: newId,
          position: { x: n.position.x + 60, y: n.position.y + 60 },
          selected: true,
        }
      })
      const newEdges = clipboard.edges.map((e) => ({
        ...structuredClone(e),
        id: `edge-${crypto.randomUUID().slice(0, 8)}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }))

      set((state) => ({
        nodes: [...state.nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
        edges: [...state.edges, ...newEdges],
        ...pushHistory(state),
      }))
    },

    addNode: (category, position) => {
      const node = createNodeFromCategory(category, snapPosition(position))
      set((state) => ({
        nodes: [...state.nodes, node],
        ...pushHistory(state),
      }))
    },

    updateNodeData: (id, data) => {
      set((state) => ({
        nodes: state.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        ...pushHistory(state),
      }))
    },

    renameNode: (id, label) => {
      get().updateNodeData(id, { label })
    },

    autoArrange: () => {
      const { nodes, edges } = get()
      const aiNodes = nodes.map((n) => ({
        id: n.id,
        type: n.data.category,
        label: n.data.label,
        position: n.position,
        metadata: n.data.metadata,
      }))
      const aiConnections = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === 'string' ? e.label : undefined,
      }))
      const { nodes: laidOut } = autoLayoutNodes(aiNodes, aiConnections)
      set({
        nodes: aiNodesToReactFlow(laidOut),
        edges: aiConnectionsToReactFlow(aiConnections),
        ...pushHistory(get()),
      })
    },

    alignSelected: (alignment) => {
      const selectedIds = new Set(
        get()
          .nodes.filter((n) => n.selected)
          .map((n) => n.id),
      )
      if (selectedIds.size < 2) return

      const aiNodes = get().nodes.map((n) => ({
        id: n.id,
        type: n.data.category,
        label: n.data.label,
        position: n.position,
      }))

      const aligned = alignNodes(aiNodes, selectedIds, alignment)
      set((state) => ({
        nodes: state.nodes.map((n) => {
          const match = aligned.find((a) => a.id === n.id)
          return match?.position ? { ...n, position: match.position } : n
        }),
        ...pushHistory(state),
      }))
    },

    getSelectedNodes: () => get().nodes.filter((n) => n.selected),
    getSelectedCount: () => get().nodes.filter((n) => n.selected).length,
  })),
)

export type { Node, Edge }

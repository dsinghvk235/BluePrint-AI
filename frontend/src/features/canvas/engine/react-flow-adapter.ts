import type { Edge, Node } from '@xyflow/react'

import { getNodeConfig } from '@/features/canvas/engine/node-config'
import type {
  AiDiagramConnection,
  AiDiagramNode,
  BlueprintEdge,
  BlueprintNode,
  BlueprintNodeData,
  CanvasSnapshot,
  NodeStatus,
} from '@/features/canvas/types/diagram'

export function toBlueprintNodeData(node: AiDiagramNode): BlueprintNodeData {
  const category = node.type as BlueprintNodeData['category']
  const config = getNodeConfig(category)
  const metadata = node.metadata ?? {}

  return {
    label: node.label,
    subtitle: (metadata.subtitle as string) ?? config.defaultSubtitle,
    category,
    status: (metadata.status as NodeStatus) ?? 'active',
    technology: metadata.technology as string | undefined,
    description: metadata.description as string | undefined,
    metadata,
  }
}

export function aiNodesToReactFlow(nodes: AiDiagramNode[]): BlueprintNode[] {
  return nodes.map((node) => ({
    id: node.id,
    type: 'blueprint',
    position: node.position ?? { x: 0, y: 0 },
    data: toBlueprintNodeData(node),
  }))
}

export function aiConnectionsToReactFlow(connections: AiDiagramConnection[]): BlueprintEdge[] {
  return connections.map((conn) => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    type: 'blueprint',
    label: conn.label,
    animated: conn.type !== 'sync',
    data: { label: conn.label },
  }))
}

export function reactFlowToCanvasSnapshot(
  nodes: BlueprintNode[],
  edges: BlueprintEdge[],
  viewport = { x: 0, y: 0, zoom: 1 },
): CanvasSnapshot {
  return { nodes, edges, viewport }
}

export function canvasSnapshotToAiJson(snapshot: CanvasSnapshot): {
  nodes: AiDiagramNode[]
  connections: AiDiagramConnection[]
} {
  return {
    nodes: snapshot.nodes.map((node) => ({
      id: node.id,
      type: node.data.category,
      label: node.data.label,
      position: node.position,
      metadata: {
        ...node.data.metadata,
        subtitle: node.data.subtitle,
        status: node.data.status,
        technology: node.data.technology,
        description: node.data.description,
      },
    })),
    connections: snapshot.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: typeof edge.label === 'string' ? edge.label : edge.data?.label,
      type: edge.animated ? 'async' : 'sync',
    })),
  }
}

export function parseCanvasSnapshot(data: unknown): CanvasSnapshot {
  const raw = (data ?? {}) as Partial<CanvasSnapshot>
  return {
    nodes: Array.isArray(raw.nodes) ? (raw.nodes as BlueprintNode[]) : [],
    edges: Array.isArray(raw.edges) ? (raw.edges as BlueprintEdge[]) : [],
    viewport: raw.viewport ?? { x: 0, y: 0, zoom: 1 },
  }
}

export function createNodeFromCategory(
  category: BlueprintNodeData['category'],
  position: { x: number; y: number },
): BlueprintNode {
  const id = `${category}-${crypto.randomUUID().slice(0, 8)}`
  const config = getNodeConfig(category)
  return {
    id,
    type: 'blueprint',
    position,
    data: {
      label: `New ${config.label}`,
      subtitle: config.defaultSubtitle,
      category,
      status: 'draft',
    },
  }
}

export type { Node, Edge }

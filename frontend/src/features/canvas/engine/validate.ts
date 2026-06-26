import type {
  AiDiagramConnection,
  AiDiagramJson,
  AiDiagramNode,
} from '@/features/canvas/types/diagram'
import { normalizeNodeType } from '@/features/canvas/engine/node-config'

export interface ValidationResult {
  nodes: AiDiagramNode[]
  connections: AiDiagramConnection[]
  warnings: string[]
}

function isValidNode(node: unknown): node is AiDiagramNode {
  if (!node || typeof node !== 'object') return false
  const n = node as Record<string, unknown>
  return typeof n.id === 'string' && typeof n.label === 'string'
}

function isValidConnection(conn: unknown): conn is AiDiagramConnection {
  if (!conn || typeof conn !== 'object') return false
  const c = conn as Record<string, unknown>
  return typeof c.source === 'string' && typeof c.target === 'string'
}

export function validateDiagramJson(input: unknown): ValidationResult {
  const warnings: string[] = []
  const raw = (input ?? {}) as Partial<AiDiagramJson>

  const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : []
  const rawConnections = Array.isArray(raw.connections) ? raw.connections : []

  if (!Array.isArray(raw.nodes)) warnings.push('Missing nodes array — using empty diagram')
  if (!Array.isArray(raw.connections))
    warnings.push('Missing connections array — using empty edges')

  const seenIds = new Set<string>()
  const nodes: AiDiagramNode[] = []

  for (const item of rawNodes) {
    if (!isValidNode(item)) {
      warnings.push('Skipped invalid node entry')
      continue
    }
    const id = item.id.trim()
    if (!id) {
      warnings.push('Skipped node with empty id')
      continue
    }
    if (seenIds.has(id)) {
      warnings.push(`Duplicate node id "${id}" — keeping first occurrence`)
      continue
    }
    seenIds.add(id)

    nodes.push({
      id,
      type: normalizeNodeType(item.type ?? 'custom'),
      label: item.label.trim() || 'Unnamed',
      position: item.position,
      metadata: normalizeMetadata(item.metadata),
    })
  }

  const nodeIds = new Set(nodes.map((n) => n.id))
  const connections: AiDiagramConnection[] = []
  const seenEdgeIds = new Set<string>()

  for (const item of rawConnections) {
    if (!isValidConnection(item)) {
      warnings.push('Skipped invalid connection entry')
      continue
    }

    const source = item.source.trim()
    const target = item.target.trim()

    if (!nodeIds.has(source) || !nodeIds.has(target)) {
      warnings.push(`Removed connection ${source} → ${target}: missing endpoint`)
      continue
    }
    if (source === target) {
      warnings.push(`Removed self-loop on ${source}`)
      continue
    }

    const id = item.id?.trim() || `edge-${source}-${target}`
    if (seenEdgeIds.has(id)) continue
    seenEdgeIds.add(id)

    connections.push({
      id,
      source,
      target,
      label: item.label,
      type: item.type ?? 'default',
      metadata: normalizeMetadata(item.metadata),
    })
  }

  return { nodes, connections, warnings }
}

function normalizeMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {}
  return { ...(metadata as Record<string, unknown>) }
}

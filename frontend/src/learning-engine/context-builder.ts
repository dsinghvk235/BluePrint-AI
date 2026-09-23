import type { ArchitectureContext, DiagramNodeContext } from './types'

/** Builds learning context from plain diagram data — no React Flow dependency. */
export function buildArchitectureContext(
  nodes: Array<{ id: string; data: Record<string, unknown> }>,
  edges: Array<{ source: string; target: string; data?: Record<string, unknown> }>,
): ArchitectureContext {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: String(n.data.label ?? 'Unnamed'),
      category: String(n.data.category ?? 'custom'),
      technology: n.data.technology ? String(n.data.technology) : undefined,
      description: n.data.description ? String(n.data.description) : undefined,
    })),
    edges: edges.map((e) => ({
      source: e.source,
      target: e.target,
      label: e.data?.label ? String(e.data.label) : undefined,
    })),
  }
}

export function findNode(context: ArchitectureContext, nodeId: string): DiagramNodeContext | null {
  return context.nodes.find((n) => n.id === nodeId) ?? null
}

export function buildNodeContextSummary(context: ArchitectureContext, nodeId: string): string {
  const node = findNode(context, nodeId)
  if (!node) return ''

  const inbound = context.edges.filter((e) => e.target === nodeId)
  const outbound = context.edges.filter((e) => e.source === nodeId)

  const upstream = inbound
    .map((e) => findNode(context, e.source)?.label)
    .filter(Boolean)
    .join(', ')
  const downstream = outbound
    .map((e) => findNode(context, e.target)?.label)
    .filter(Boolean)
    .join(', ')

  return [
    `${node.label} (${node.category})`,
    node.technology ? `Technology: ${node.technology}` : null,
    upstream ? `Upstream: ${upstream}` : null,
    downstream ? `Downstream: ${downstream}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function getUpstreamNodeIds(context: ArchitectureContext, nodeId: string): string[] {
  return context.edges.filter((e) => e.target === nodeId).map((e) => e.source)
}

export function getDownstreamNodeIds(context: ArchitectureContext, nodeId: string): string[] {
  return context.edges.filter((e) => e.source === nodeId).map((e) => e.target)
}

export function getRelatedNodeIds(context: ArchitectureContext, nodeId: string): string[] {
  return [
    ...new Set([...getUpstreamNodeIds(context, nodeId), ...getDownstreamNodeIds(context, nodeId)]),
  ]
}

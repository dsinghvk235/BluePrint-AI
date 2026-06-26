import type { AiDiagramConnection, AiDiagramNode } from '@/features/canvas/types/diagram'

const NODE_WIDTH = 220
const NODE_HEIGHT = 88
const H_GAP = 80
const V_GAP = 100
const GRID_SIZE = 20

export function snapToGrid(value: number, grid = GRID_SIZE): number {
  return Math.round(value / grid) * grid
}

/** Layered layout for DAGs; falls back to grid for disconnected components. */
export function autoLayoutNodes(
  nodes: AiDiagramNode[],
  connections: AiDiagramConnection[],
): { nodes: AiDiagramNode[]; autoPositioned: number } {
  if (nodes.length === 0) return { nodes, autoPositioned: 0 }

  const needsLayout = nodes.filter((n) => !n.position || (n.position.x === 0 && n.position.y === 0))
  if (needsLayout.length === 0) return { nodes, autoPositioned: 0 }

  const adjacency = new Map<string, string[]>()
  const inDegree = new Map<string, number>()

  for (const node of nodes) {
    adjacency.set(node.id, [])
    inDegree.set(node.id, 0)
  }

  for (const edge of connections) {
    adjacency.get(edge.source)?.push(edge.target)
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  }

  const layers: string[][] = []
  const assigned = new Set<string>()
  let queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id)

  if (queue.length === 0) {
    queue = [nodes[0]!.id]
  }

  while (queue.length > 0) {
    const layer: string[] = []
    const nextQueue: string[] = []

    for (const id of queue) {
      if (assigned.has(id)) continue
      assigned.add(id)
      layer.push(id)

      for (const child of adjacency.get(id) ?? []) {
        inDegree.set(child, (inDegree.get(child) ?? 1) - 1)
        if ((inDegree.get(child) ?? 0) <= 0) nextQueue.push(child)
      }
    }

    if (layer.length > 0) layers.push(layer)
    queue = nextQueue
  }

  for (const node of nodes) {
    if (!assigned.has(node.id)) {
      layers.push([node.id])
      assigned.add(node.id)
    }
  }

  const positionMap = new Map<string, { x: number; y: number }>()
  let autoPositioned = 0

  layers.forEach((layer, layerIndex) => {
    const layerWidth = layer.length * NODE_WIDTH + (layer.length - 1) * H_GAP
    const startX = -layerWidth / 2

    layer.forEach((id, index) => {
      const node = nodes.find((n) => n.id === id)
      if (!node) return

      const hasCustomPosition = node.position && !(node.position.x === 0 && node.position.y === 0)

      if (!hasCustomPosition) {
        positionMap.set(id, {
          x: snapToGrid(startX + index * (NODE_WIDTH + H_GAP)),
          y: snapToGrid(layerIndex * (NODE_HEIGHT + V_GAP) + 80),
        })
        autoPositioned++
      } else if (node.position) {
        positionMap.set(id, {
          x: snapToGrid(node.position.x),
          y: snapToGrid(node.position.y),
        })
      }
    })
  })

  const laidOut = nodes.map((node) => ({
    ...node,
    position: positionMap.get(node.id) ?? node.position ?? { x: 0, y: 0 },
  }))

  return { nodes: laidOut, autoPositioned }
}

export function alignNodes(
  nodes: AiDiagramNode[],
  selectedIds: Set<string>,
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
): AiDiagramNode[] {
  const selected = nodes.filter((n) => selectedIds.has(n.id) && n.position)
  if (selected.length < 2) return nodes

  const positions = selected.map((n) => n.position!)
  let target = 0

  switch (alignment) {
    case 'left':
      target = Math.min(...positions.map((p) => p.x))
      break
    case 'right':
      target = Math.max(...positions.map((p) => p.x))
      break
    case 'center':
      target = positions.reduce((s, p) => s + p.x, 0) / positions.length
      break
    case 'top':
      target = Math.min(...positions.map((p) => p.y))
      break
    case 'bottom':
      target = Math.max(...positions.map((p) => p.y))
      break
    case 'middle':
      target = positions.reduce((s, p) => s + p.y, 0) / positions.length
      break
  }

  return nodes.map((node) => {
    if (!selectedIds.has(node.id) || !node.position) return node
    const pos = { ...node.position }
    if (alignment === 'left' || alignment === 'center' || alignment === 'right') {
      pos.x = snapToGrid(target)
    } else {
      pos.y = snapToGrid(target)
    }
    return { ...node, position: pos }
  })
}

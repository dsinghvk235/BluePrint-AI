import type { AiDiagramConnection } from '@/features/canvas/types/diagram'

export function detectCycles(
  nodeIds: string[],
  connections: AiDiagramConnection[],
): { hasCycles: boolean; cycleCount: number } {
  const adjacency = new Map<string, string[]>()
  for (const id of nodeIds) adjacency.set(id, [])
  for (const edge of connections) {
    adjacency.get(edge.source)?.push(edge.target)
  }

  const visited = new Set<string>()
  const stack = new Set<string>()
  let cycleCount = 0

  function dfs(node: string): boolean {
    if (stack.has(node)) {
      cycleCount++
      return true
    }
    if (visited.has(node)) return false

    visited.add(node)
    stack.add(node)

    for (const child of adjacency.get(node) ?? []) {
      dfs(child)
    }

    stack.delete(node)
    return false
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) dfs(id)
  }

  return { hasCycles: cycleCount > 0, cycleCount }
}

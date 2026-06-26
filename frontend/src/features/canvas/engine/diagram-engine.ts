import { detectCycles } from '@/features/canvas/engine/cycle-detector'
import { autoLayoutNodes } from '@/features/canvas/engine/layout'
import {
  aiConnectionsToReactFlow,
  aiNodesToReactFlow,
} from '@/features/canvas/engine/react-flow-adapter'
import { validateDiagramJson } from '@/features/canvas/engine/validate'
import type { DiagramEngineResult } from '@/features/canvas/types/diagram'

/**
 * Diagram Engine — sole entry point for transforming AI JSON into canvas-ready state.
 * Never pass raw AI output directly to React Flow components.
 */
export function processDiagramJson(input: unknown): DiagramEngineResult {
  const inputNodeCount = Array.isArray((input as { nodes?: unknown[] })?.nodes)
    ? (input as { nodes: unknown[] }).nodes.length
    : 0

  const {
    nodes: validatedNodes,
    connections: validatedConnections,
    warnings,
  } = validateDiagramJson(input)

  const { hasCycles, cycleCount } = detectCycles(
    validatedNodes.map((n) => n.id),
    validatedConnections,
  )

  if (hasCycles) {
    warnings.push(
      `Detected ${cycleCount} cycle(s) in diagram — layout may overlap for cyclic paths`,
    )
  }

  const { nodes: laidOutNodes, autoPositioned } = autoLayoutNodes(
    validatedNodes,
    validatedConnections,
  )

  const nodes = aiNodesToReactFlow(laidOutNodes)
  const edges = aiConnectionsToReactFlow(validatedConnections)

  const removedConnections =
    inputNodeCount > 0
      ? Math.max(
          0,
          (Array.isArray((input as { connections?: unknown[] })?.connections)
            ? (input as { connections: unknown[] }).connections.length
            : 0) - validatedConnections.length,
        )
      : 0

  return {
    nodes,
    edges,
    warnings,
    stats: {
      inputNodes: inputNodeCount,
      outputNodes: nodes.length,
      removedConnections,
      autoPositioned,
      cyclesDetected: cycleCount,
    },
  }
}

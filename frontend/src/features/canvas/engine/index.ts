export { processDiagramJson } from '@/features/canvas/engine/diagram-engine'
export { validateDiagramJson } from '@/features/canvas/engine/validate'
export { autoLayoutNodes, alignNodes, snapToGrid } from '@/features/canvas/engine/layout'
export { detectCycles } from '@/features/canvas/engine/cycle-detector'
export {
  aiNodesToReactFlow,
  aiConnectionsToReactFlow,
  canvasSnapshotToAiJson,
  createNodeFromCategory,
  parseCanvasSnapshot,
  reactFlowToCanvasSnapshot,
} from '@/features/canvas/engine/react-flow-adapter'
export {
  NODE_CATEGORIES,
  getNodeConfig,
  normalizeNodeType,
} from '@/features/canvas/engine/node-config'

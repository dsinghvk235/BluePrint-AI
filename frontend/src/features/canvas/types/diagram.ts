import type { Edge, Node, Viewport } from '@xyflow/react'

/** AI-generated diagram JSON contract (diagram-json:1.0.0). */
export type AiNodeType =
  | 'service'
  | 'database'
  | 'cache'
  | 'queue'
  | 'client'
  | 'api-gateway'
  | 'microservice'
  | 'cdn'
  | 'storage'
  | 'load-balancer'
  | 'external-api'
  | 'authentication'
  | 'worker'
  | 'monitoring'
  | 'custom'

export type NodeStatus = 'active' | 'loading' | 'error' | 'draft' | 'deprecated'

export interface AiDiagramNode {
  id: string
  type: string
  label: string
  position?: { x: number; y: number }
  metadata?: Record<string, unknown>
}

export interface AiDiagramConnection {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  metadata?: Record<string, unknown>
}

export interface AiDiagramJson {
  nodes: AiDiagramNode[]
  connections: AiDiagramConnection[]
}

export interface BlueprintNodeData {
  label: string
  subtitle?: string
  category: AiNodeType
  status: NodeStatus
  technology?: string
  description?: string
  metadata?: Record<string, unknown>
  loading?: boolean
  error?: string
  [key: string]: unknown
}

export type BlueprintNode = Node<BlueprintNodeData>
export type BlueprintEdge = Edge<{ label?: string; animated?: boolean }>

export interface CanvasSnapshot {
  nodes: BlueprintNode[]
  edges: BlueprintEdge[]
  viewport: Viewport
}

export interface DiagramVersionMetadata {
  source: 'empty' | 'default' | 'ai' | 'user' | 'recovery'
  lastSavedAt?: string
  lastSavedBy?: string
  generationId?: string
}

export interface DiagramRecord {
  id: string | null
  projectId: string
  name: string
  version: number
  canvasData: CanvasSnapshot
  versionMetadata: DiagramVersionMetadata
  createdAt?: string
  updatedAt?: string
}

export interface DiagramEngineResult {
  nodes: BlueprintNode[]
  edges: BlueprintEdge[]
  warnings: string[]
  stats: {
    inputNodes: number
    outputNodes: number
    removedConnections: number
    autoPositioned: number
    cyclesDetected: number
  }
}

export interface GenerationStatus {
  generationId: string
  projectId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  currentStep: string
  progressPercent: number
  architecture?: {
    diagram?: AiDiagramJson
    metadata?: {
      systemDescription?: string
      systemType?: string
    }
  }
  errorMessage?: string
  startedAt?: string
  completedAt?: string
}

export interface GenerateArchitectureInput {
  projectId: string
  systemDescription: string
  systemType?: string
  useCache?: boolean
}

/** Framework-agnostic Learning Engine — no React or AI provider dependencies. */

export type LearningModeId =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'SDE_1'
  | 'SENIOR_ENGINEER'
  | 'STAFF_ENGINEER'

export type LearningLayerId =
  | 'overview'
  | 'purpose'
  | 'reasoning'
  | 'principle'
  | 'tradeoffs'
  | 'alternatives'
  | 'best-practices'
  | 'interview'
  | 'advanced'

export interface DiagramNodeContext {
  id: string
  label: string
  category: string
  technology?: string
  description?: string
}

export interface DiagramEdgeContext {
  source: string
  target: string
  label?: string
}

export interface ArchitectureContext {
  nodes: DiagramNodeContext[]
  edges: DiagramEdgeContext[]
}

export interface LayerContent {
  layer: LearningLayerId
  title: string
  summary: string
  content: string
  bullets: string[]
  principles: string[]
  relatedConceptIds: string[]
}

export interface DecisionLogEntry {
  id: string
  nodeId: string
  component: string
  decision: string
  reason: string
  engineeringPrinciple: string
  assumptions: string[]
  alternativesConsidered: Array<{ name: string; reasonRejected: string }>
  tradeoffs: string[]
  potentialRisks: string[]
  futureImprovements: string[]
}

export interface DependencyNode {
  nodeId: string
  label: string
  category: string
  relationship: string
}

export interface DependencyGraph {
  upstream: DependencyNode[]
  downstream: DependencyNode[]
}

export interface ComponentKnowledge {
  nodeId: string
  label: string
  category: string
  technology?: string
  conceptId: string
  mode: LearningModeId
  layers: LayerContent[]
  decisionLog: DecisionLogEntry
  dependencies: DependencyGraph
  source: string
  cached: boolean
}

export interface MentorMessage {
  id: string
  role: 'user' | 'mentor'
  content: string
  timestamp: number
}

export const LEARNING_LAYER_ORDER: LearningLayerId[] = [
  'overview',
  'purpose',
  'reasoning',
  'principle',
  'tradeoffs',
  'alternatives',
  'best-practices',
  'interview',
  'advanced',
]

export const LEARNING_LAYER_META: Record<
  LearningLayerId,
  { label: string; description: string; order: number }
> = {
  overview: { label: 'Overview', description: 'What is this?', order: 1 },
  purpose: { label: 'Purpose', description: 'Why is it used?', order: 2 },
  reasoning: { label: 'Reasoning', description: 'Why selected here?', order: 3 },
  principle: { label: 'Engineering Principle', description: 'Patterns applied', order: 4 },
  tradeoffs: { label: 'Trade-offs', description: 'Costs and benefits', order: 5 },
  alternatives: { label: 'Alternatives', description: 'Other options', order: 6 },
  'best-practices': { label: 'Best Practices', description: 'Production lessons', order: 7 },
  interview: { label: 'Interview Questions', description: 'Practice questions', order: 8 },
  advanced: { label: 'Advanced Discussion', description: 'Deep analysis', order: 9 },
}

export const LEARNING_MODE_META: Record<LearningModeId, { label: string; tone: string }> = {
  BEGINNER: { label: 'Beginner', tone: 'Simple language, analogies, minimal jargon' },
  INTERMEDIATE: { label: 'Intermediate', tone: 'Basic CS knowledge assumed' },
  SDE_1: { label: 'SDE-1', tone: 'Interview-ready implementation depth' },
  SENIOR_ENGINEER: { label: 'Senior Engineer', tone: 'Scale, failure modes, operations' },
  STAFF_ENGINEER: { label: 'Staff Engineer', tone: 'Strategic and cross-system framing' },
}

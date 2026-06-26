import type {
  ComponentKnowledge,
  DecisionLogEntry,
  DependencyGraph,
  LearningModeId,
} from '@/learning-engine'
import { api } from '@/shared/api/client'

export interface MentorChatInput {
  nodeId?: string
  mode: LearningModeId
  message: string
  history?: Array<{ role: string; content: string }>
  useCache?: boolean
}

export interface MentorChatResponse {
  messageId: string
  response: string
  contextSummary: string
  cached: boolean
}

export const learningApi = {
  getComponentKnowledge: (
    projectId: string,
    nodeId: string,
    mode: LearningModeId,
    layer?: string,
    useCache = true,
  ) =>
    api.get<ComponentKnowledge>(`/projects/${projectId}/learning/nodes/${nodeId}`, {
      params: { mode, layer, useCache },
    }),

  getDecisionLogs: (projectId: string, nodeId?: string) =>
    api.get<DecisionLogEntry[]>(`/projects/${projectId}/learning/decisions`, {
      params: nodeId ? { nodeId } : undefined,
    }),

  getDependencies: (projectId: string, nodeId: string) =>
    api.get<DependencyGraph>(`/projects/${projectId}/learning/dependencies/${nodeId}`),

  mentorChat: (projectId: string, input: MentorChatInput) =>
    api.post<MentorChatResponse>(`/projects/${projectId}/learning/mentor`, {
      nodeId: input.nodeId,
      mode: input.mode,
      message: input.message,
      history: input.history ?? [],
      useCache: input.useCache ?? false,
    }),
}

import { api } from '@/shared/api/client'

export type FeedbackTargetType =
  | 'ARCHITECTURE'
  | 'COMPONENT'
  | 'AI_EXPLANATION'
  | 'LEARNING_CONTENT'
  | 'DIAGRAM_QUALITY'
  | 'EXPERIENCE'

export interface SubmitFeedbackInput {
  targetType: FeedbackTargetType
  targetId: string
  projectId?: string
  rating?: number
  helpful?: boolean
  comment?: string
  suggestion?: string
  aiMetadata?: {
    aiProvider?: string
    aiModel?: string
    promptVersion?: string
    generatorName?: string
    generationTimeMs?: number
    responseLatencyMs?: number
    tokenUsage?: Record<string, unknown>
  }
}

export interface FeedbackSummary {
  averageRating: number
  totalReviews: number
  helpfulCount: number
  notHelpfulCount: number
}

export const reviewApi = {
  submit: (input: SubmitFeedbackInput) => api.post('/feedback', input),

  summary: (params: { projectId?: string; targetType?: string; targetId?: string }) =>
    api.get<FeedbackSummary>('/feedback/summary', { params }),
}

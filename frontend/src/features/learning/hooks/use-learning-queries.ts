import { useQuery } from '@tanstack/react-query'

import { learningApi } from '@/features/learning/api/learning-api'
import type { LearningModeId } from '@/learning-engine'
import { queryKeys } from '@/shared/api/query-keys'
import { QUERY_STALE_TIME } from '@/shared/constants'

export function useComponentKnowledge(
  projectId: string | undefined,
  nodeId: string | null,
  mode: LearningModeId,
) {
  return useQuery({
    queryKey: queryKeys.learning.component(projectId ?? '', nodeId ?? '', mode),
    queryFn: () => learningApi.getComponentKnowledge(projectId!, nodeId!, mode),
    enabled: !!projectId && !!nodeId,
    staleTime: QUERY_STALE_TIME.MEDIUM,
  })
}

export function useDecisionLogs(projectId: string | undefined, nodeId: string | null) {
  return useQuery({
    queryKey: queryKeys.learning.decisions(projectId ?? '', nodeId ?? undefined),
    queryFn: () => learningApi.getDecisionLogs(projectId!, nodeId ?? undefined),
    enabled: !!projectId && !!nodeId,
    staleTime: QUERY_STALE_TIME.MEDIUM,
  })
}

export function useDependencies(projectId: string | undefined, nodeId: string | null) {
  return useQuery({
    queryKey: queryKeys.learning.dependencies(projectId ?? '', nodeId ?? ''),
    queryFn: () => learningApi.getDependencies(projectId!, nodeId!),
    enabled: !!projectId && !!nodeId,
    staleTime: QUERY_STALE_TIME.SHORT,
  })
}

import { useMutation, useQuery } from '@tanstack/react-query'

import { diagramsApi } from '@/features/canvas/api/diagrams-api'
import { parseCanvasSnapshot } from '@/features/canvas/engine/react-flow-adapter'
import type { CanvasSnapshot, DiagramRecord } from '@/features/canvas/types/diagram'
import { queryKeys } from '@/shared/api/query-keys'
import { QUERY_STALE_TIME } from '@/shared/constants'
import { ApiClientError } from '@/shared/api/client'
import { toast } from '@/shared/stores/toast-store'

export function useDiagram(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.diagrams.detail(projectId ?? 'none'),
    queryFn: () => diagramsApi.get(projectId!),
    enabled: !!projectId,
    staleTime: QUERY_STALE_TIME.SHORT,
    select: (data): DiagramRecord => ({
      ...data,
      canvasData: parseCanvasSnapshot(data.canvasData),
    }),
  })
}

export function useSaveDiagram(projectId: string | undefined) {
  return useMutation({
    mutationFn: (payload: {
      canvasData: CanvasSnapshot
      version: number
      versionMetadata?: Record<string, unknown>
    }) =>
      diagramsApi.save(projectId!, {
        canvasData: payload.canvasData,
        expectedVersion: payload.version > 0 ? payload.version : undefined,
        versionMetadata: {
          ...payload.versionMetadata,
          lastSavedAt: new Date().toISOString(),
          source: 'user',
        },
      }),
    onError: (error: Error) => {
      toast({
        title: 'Failed to save diagram',
        description: error instanceof ApiClientError ? error.message : undefined,
        variant: 'error',
      })
    },
  })
}

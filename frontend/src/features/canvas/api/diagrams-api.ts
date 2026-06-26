import { api } from '@/shared/api/client'
import type { DiagramRecord } from '@/features/canvas/types/diagram'

export const diagramsApi = {
  get: (projectId: string) => api.get<DiagramRecord>(`/projects/${projectId}/diagram`),

  save: (
    projectId: string,
    payload: { canvasData: unknown; versionMetadata?: unknown; expectedVersion?: number },
  ) => api.put<DiagramRecord>(`/projects/${projectId}/diagram`, payload),
}

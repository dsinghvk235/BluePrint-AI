import { api } from '@/shared/api/client'
import type { GenerateArchitectureInput, GenerationStatus } from '@/features/canvas/types/diagram'

export const architectureApi = {
  generate: (input: GenerateArchitectureInput) =>
    api.post<GenerationStatus>('/ai/architecture/generate', input),

  getGenerationStatus: (generationId: string) =>
    api.get<GenerationStatus>(`/ai/architecture/generations/${generationId}`),
}

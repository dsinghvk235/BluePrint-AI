import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

import { architectureApi } from '@/features/canvas/api/architecture-api'
import {
  startGenerationPolling,
  stopGenerationPolling,
} from '@/features/canvas/hooks/generation-polling'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import type { GenerateArchitectureInput } from '@/features/canvas/types/diagram'
import { formatGenerationError } from '@/features/canvas/utils/format-generation-error'
import { ApiClientError } from '@/shared/api/client'
import { toast } from '@/shared/stores/toast-store'

export function useArchitectureGeneration() {
  const loadFromEngine = useCanvasStore((s) => s.loadFromEngine)
  const setGenerating = useCanvasUiStore((s) => s.setGenerating)
  const setGenerationError = useCanvasUiStore((s) => s.setGenerationError)

  const cancelGeneration = useCallback(() => {
    stopGenerationPolling()
    setGenerationError(null)
  }, [setGenerationError])

  useEffect(() => {
    return () => stopGenerationPolling()
  }, [])

  const mutation = useMutation({
    mutationFn: (input: GenerateArchitectureInput) => architectureApi.generate(input),
    onMutate: () => {
      setGenerationError(null)
      setGenerating(true, 0, 'starting')
    },
    onSuccess: (status) => {
      startGenerationPolling(status.generationId, {
        setGenerating,
        setGenerationError,
        onCompleted: (completed) => {
          const rawDiagram = completed.architecture?.diagram
          if (rawDiagram) {
            loadFromEngine(rawDiagram)
          } else {
            setGenerationError('Generation completed but no diagram was returned')
            toast({ title: 'Generation completed without diagram data', variant: 'error' })
          }
        },
      })
    },
    onError: (error: Error) => {
      stopGenerationPolling()
      const raw = error instanceof ApiClientError ? error.message : 'Could not reach server'
      const message = formatGenerationError(raw)
      setGenerationError(message)
      toast({
        title: 'Failed to start generation',
        description: message,
        variant: 'error',
      })
    },
  })

  return { ...mutation, stopPolling: cancelGeneration, cancelGeneration }
}

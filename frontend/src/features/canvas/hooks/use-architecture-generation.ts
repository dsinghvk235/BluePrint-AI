import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

import { architectureApi } from '@/features/canvas/api/architecture-api'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import type { GenerateArchitectureInput } from '@/features/canvas/types/diagram'
import { ApiClientError } from '@/shared/api/client'
import { toast } from '@/shared/stores/toast-store'

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 120

export function useArchitectureGeneration() {
  const loadFromEngine = useCanvasStore((s) => s.loadFromEngine)
  const setGenerating = useCanvasUiStore((s) => s.setGenerating)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollGenerationRef = useRef<(generationId: string, attempt?: number) => Promise<void>>(
    async () => undefined,
  )

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    pollGenerationRef.current = async (generationId: string, attempt = 0) => {
      if (attempt >= MAX_POLLS) {
        setGenerating(false)
        toast({ title: 'Generation timed out', variant: 'error' })
        return
      }

      try {
        const status = await architectureApi.getGenerationStatus(generationId)

        setGenerating(
          status.status === 'IN_PROGRESS' || status.status === 'PENDING',
          status.progressPercent,
          status.currentStep,
        )

        if (status.status === 'COMPLETED') {
          const rawDiagram = status.architecture?.diagram
          if (rawDiagram) {
            loadFromEngine(rawDiagram)
            toast({ title: 'Architecture generated', variant: 'success' })
          } else {
            toast({ title: 'Generation completed without diagram data', variant: 'error' })
          }
          setGenerating(false)
          return
        }

        if (status.status === 'FAILED') {
          setGenerating(false)
          toast({
            title: 'Generation failed',
            description: status.errorMessage,
            variant: 'error',
          })
          return
        }

        pollRef.current = setTimeout(
          () => void pollGenerationRef.current(generationId, attempt + 1),
          POLL_INTERVAL_MS,
        )
      } catch (error) {
        setGenerating(false)
        toast({
          title: 'Failed to check generation status',
          description: error instanceof ApiClientError ? error.message : undefined,
          variant: 'error',
        })
      }
    }
  }, [loadFromEngine, setGenerating])

  const pollGeneration = useCallback(
    (generationId: string, attempt = 0) => pollGenerationRef.current(generationId, attempt),
    [],
  )

  const mutation = useMutation({
    mutationFn: (input: GenerateArchitectureInput) => architectureApi.generate(input),
    onSuccess: (status) => {
      setGenerating(true, status.progressPercent, status.currentStep)
      void pollGeneration(status.generationId)
    },
    onError: (error: Error) => {
      setGenerating(false)
      toast({
        title: 'Failed to start generation',
        description: error instanceof ApiClientError ? error.message : undefined,
        variant: 'error',
      })
    },
  })

  return { ...mutation, stopPolling }
}

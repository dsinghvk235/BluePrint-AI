import { architectureApi } from '@/features/canvas/api/architecture-api'
import type { GenerationStatus } from '@/features/canvas/types/diagram'
import { formatGenerationError } from '@/features/canvas/utils/format-generation-error'
import { ApiClientError } from '@/shared/api/client'
import { toast } from '@/shared/stores/toast-store'

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 300
const STUCK_PENDING_POLLS = 45

type PollCallbacks = {
  setGenerating: (generating: boolean, progress?: number, step?: string) => void
  setGenerationError: (error: string | null) => void
  onCompleted: (status: GenerationStatus) => void
}

let pollTimer: ReturnType<typeof setTimeout> | null = null
let activeGenerationId: string | null = null
let callbacks: PollCallbacks | null = null

function failGeneration(title: string, description?: string) {
  stopGenerationPolling()
  const message = description ? formatGenerationError(description) : title
  callbacks?.setGenerationError(message)
  toast({ title, description: message, variant: 'error' })
}

export function stopGenerationPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  activeGenerationId = null
  callbacks?.setGenerating(false)
}

export function startGenerationPolling(generationId: string, pollCallbacks: PollCallbacks) {
  if (!generationId) {
    pollCallbacks.setGenerationError('No generation ID returned from server')
    toast({ title: 'Generation failed to start', variant: 'error' })
    return
  }

  stopGenerationPolling()
  activeGenerationId = generationId
  callbacks = pollCallbacks
  callbacks.setGenerationError(null)
  callbacks.setGenerating(true, 0, 'initializing')
  void pollGeneration(generationId, 0)
}

async function pollGeneration(generationId: string, attempt: number) {
  if (activeGenerationId !== generationId || !callbacks) {
    return
  }

  if (attempt >= MAX_POLLS) {
    failGeneration('Generation timed out', 'The AI took too long. Try again with a simpler prompt.')
    return
  }

  try {
    const status = await architectureApi.getGenerationStatus(generationId)

    if (activeGenerationId !== generationId || !callbacks) {
      return
    }

    callbacks.setGenerating(
      status.status === 'IN_PROGRESS' || status.status === 'PENDING',
      status.progressPercent,
      status.currentStep,
    )

    if (
      status.status === 'PENDING' &&
      (status.currentStep === 'initializing' || status.currentStep === 'queued') &&
      attempt >= STUCK_PENDING_POLLS
    ) {
      failGeneration(
        'Generation did not start',
        'Ensure the backend and Ollama are running (`brew services start ollama`). Local generation can take several minutes per step.',
      )
      return
    }

    if (status.status === 'COMPLETED') {
      callbacks.onCompleted(status)
      stopGenerationPolling()
      toast({ title: 'Architecture generated', variant: 'success' })
      return
    }

    if (status.status === 'FAILED') {
      failGeneration(
        'Generation failed',
        status.errorMessage ?? 'Check your AI provider configuration in .env',
      )
      return
    }

    pollTimer = setTimeout(() => void pollGeneration(generationId, attempt + 1), POLL_INTERVAL_MS)
  } catch (error) {
    const message = error instanceof ApiClientError ? error.message : 'Network error'
    failGeneration('Failed to check generation status', message)
  }
}

import { AlertCircle, Layers, Loader2, MousePointerClick, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { useArchitectureGeneration } from '@/features/canvas/hooks/use-architecture-generation'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import { EXAMPLE_PROMPTS } from '@/shared/constants'
import { Button, Textarea } from '@/shared/ui'

interface EmptyCanvasGuideProps {
  projectId: string
  defaultPrompt?: string
}

export function EmptyCanvasGuide({ projectId, defaultPrompt = '' }: EmptyCanvasGuideProps) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [systemType, setSystemType] = useState('microservices')
  const { mutate: generate, isPending } = useArchitectureGeneration()

  const isGenerating = useCanvasUiStore((s) => s.isGenerating)
  const generationStep = useCanvasUiStore((s) => s.generationStep)
  const generationProgress = useCanvasUiStore((s) => s.generationProgress)
  const generationError = useCanvasUiStore((s) => s.generationError)
  const setGenerationError = useCanvasUiStore((s) => s.setGenerationError)

  const busy = isPending || isGenerating
  const showProgress = busy && !generationError

  function handleGenerate() {
    const text = prompt.trim()
    if (!text || busy) return
    setGenerationError(null)
    generate({
      projectId,
      systemDescription: text,
      systemType,
      useCache: false,
    })
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-card pointer-events-auto w-full max-w-md rounded-2xl border p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Layers className="text-primary h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold">Start your architecture</h3>
            <p className="text-muted-foreground text-xs">
              Describe your system — AI builds a diagram you can learn from.
            </p>
          </div>
        </div>

        {generationError && (
          <div
            className="border-destructive/40 bg-destructive/10 mt-4 flex gap-2 rounded-lg border p-3"
            role="alert"
          >
            <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-destructive text-xs leading-relaxed">{generationError}</p>
          </div>
        )}

        {showProgress && (
          <div className="bg-muted/60 mt-4 space-y-2 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
              <p className="text-sm font-medium">Generating architecture…</p>
            </div>
            <p className="text-muted-foreground text-xs capitalize">
              {generationStep || 'Starting'}
            </p>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(generationProgress, 8)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Design a scalable video streaming platform like Netflix…"
            rows={3}
            className="resize-none text-sm"
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleGenerate()
              }
            }}
          />
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.slice(0, 4).map((example) => (
              <button
                key={example}
                type="button"
                disabled={busy}
                onClick={() => setPrompt(example)}
                className="bg-muted hover:bg-accent rounded-full px-2.5 py-1 text-[11px] transition-colors disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
          <select
            value={systemType}
            onChange={(e) => setSystemType(e.target.value)}
            disabled={busy}
            className="bg-background border-input w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="microservices">Microservices</option>
            <option value="monolith">Monolith</option>
            <option value="serverless">Serverless</option>
            <option value="event-driven">Event-Driven</option>
          </select>
          <Button
            type="button"
            className="w-full gap-2"
            disabled={!prompt.trim() || busy}
            onClick={handleGenerate}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? 'Generating…' : 'Generate with AI'}
          </Button>
          <p className="text-muted-foreground flex items-center justify-center gap-1 text-[11px]">
            <MousePointerClick className="h-3 w-3" />
            Or drag components from the left panel
          </p>
        </div>
      </div>
    </div>
  )
}

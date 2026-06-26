import { useState } from 'react'

import { useArchitectureGeneration } from '@/features/canvas/hooks/use-architecture-generation'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import { EXAMPLE_PROMPTS } from '@/shared/constants'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@/shared/ui'

interface GenerateDialogProps {
  projectId: string
  defaultPrompt?: string
}

export function GenerateDialog({ projectId, defaultPrompt = '' }: GenerateDialogProps) {
  const open = useCanvasUiStore((s) => s.generateDialogOpen)
  const setOpen = useCanvasUiStore((s) => s.setGenerateDialogOpen)
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [systemType, setSystemType] = useState('microservices')
  const { mutate: generate, isPending } = useArchitectureGeneration()

  function handleGenerate() {
    if (!prompt.trim()) return
    generate(
      { projectId, systemDescription: prompt.trim(), systemType },
      { onSuccess: () => setOpen(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Architecture</DialogTitle>
          <DialogDescription>
            Describe the system you want to design. AI will produce a validated, layout-ready
            diagram.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Design a scalable video streaming platform like Netflix…"
            rows={4}
            className="resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="bg-muted hover:bg-accent rounded-full px-2.5 py-1 text-xs transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
          <select
            value={systemType}
            onChange={(e) => setSystemType(e.target.value)}
            className="bg-background border-input w-full rounded-md border px-3 py-2 text-sm"
          >
            <option value="microservices">Microservices</option>
            <option value="monolith">Monolith</option>
            <option value="serverless">Serverless</option>
            <option value="event-driven">Event-Driven</option>
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!prompt.trim() || isPending}>
            {isPending ? 'Starting…' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

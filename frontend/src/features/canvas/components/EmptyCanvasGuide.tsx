import { Layers, MousePointerClick, Sparkles } from 'lucide-react'

import { Button } from '@/shared/ui'

interface EmptyCanvasGuideProps {
  onGenerate: () => void
}

export function EmptyCanvasGuide({ onGenerate }: EmptyCanvasGuideProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="bg-card/90 pointer-events-auto max-w-sm rounded-2xl border p-6 text-center shadow-lg backdrop-blur-sm">
        <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
          <Layers className="text-primary h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold">Start your architecture</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Generate from a prompt, drag components from the library, or double-click nodes to rename.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={onGenerate} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </Button>
          <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
            <MousePointerClick className="h-3 w-3" />
            Drag components from the left panel
          </p>
        </div>
      </div>
    </div>
  )
}

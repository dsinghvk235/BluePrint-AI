import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Sparkles, X } from 'lucide-react'

import { formatGenerationError } from '@/features/canvas/utils/format-generation-error'
import { formatGenerationStep } from '@/features/canvas/utils/format-generation-step'
import { stopGenerationPolling } from '@/features/canvas/hooks/generation-polling'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import { Button } from '@/shared/ui'

export function GenerationProgress() {
  const isGenerating = useCanvasUiStore((s) => s.isGenerating)
  const progress = useCanvasUiStore((s) => s.generationProgress)
  const step = useCanvasUiStore((s) => s.generationStep)
  const error = useCanvasUiStore((s) => s.generationError)
  const setGenerationError = useCanvasUiStore((s) => s.setGenerationError)

  const visible = isGenerating || !!error

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-card absolute top-14 left-1/2 z-[60] w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 rounded-xl border p-4 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {error ? (
                <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
              ) : (
                <Sparkles className="text-primary h-4 w-4 shrink-0 animate-pulse" />
              )}
              <p className="text-sm font-medium">
                {error ? 'Generation failed' : 'Generating architecture…'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                stopGenerationPolling()
                setGenerationError(null)
              }}
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {error ? (
            <p className="text-destructive mt-2 text-xs leading-relaxed">
              {formatGenerationError(error)}
            </p>
          ) : (
            <>
              <p className="text-muted-foreground mt-1 truncate text-xs">
                {formatGenerationStep(step)}
              </p>
              <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(progress, 5)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

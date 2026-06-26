import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'

export function GenerationProgress() {
  const isGenerating = useCanvasUiStore((s) => s.isGenerating)
  const progress = useCanvasUiStore((s) => s.generationProgress)
  const step = useCanvasUiStore((s) => s.generationStep)

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-card absolute top-14 left-1/2 z-50 w-80 -translate-x-1/2 rounded-xl border p-4 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4 animate-pulse" />
            <p className="text-sm font-medium">Generating architecture…</p>
          </div>
          <p className="text-muted-foreground mt-1 truncate text-xs">{step || 'Initializing'}</p>
          <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 5)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

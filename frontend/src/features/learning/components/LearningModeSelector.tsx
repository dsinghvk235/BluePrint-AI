import { LEARNING_MODE_META, type LearningModeId } from '@/learning-engine'
import { useLearningStore } from '@/features/learning/stores/learning-store'
import { LEARNING_MODES } from '@/shared/constants'
import { cn } from '@/shared/utils'

export function LearningModeSelector({ className }: { className?: string }) {
  const mode = useLearningStore((s) => s.mode)
  const setMode = useLearningStore((s) => s.setMode)

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
        Learning mode
      </p>
      <div className="flex flex-wrap gap-1">
        {LEARNING_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id as LearningModeId)}
            className={cn(
              'rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
              mode === m.id
                ? 'btn-brand shadow-none'
                : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
            title={LEARNING_MODE_META[m.id as LearningModeId]?.tone}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

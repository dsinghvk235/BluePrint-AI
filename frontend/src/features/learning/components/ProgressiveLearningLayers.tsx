import { motion } from 'framer-motion'
import { ChevronDown, Lock } from 'lucide-react'

import { useComponentKnowledge } from '@/features/learning/hooks/use-learning-queries'
import { useLearningStore } from '@/features/learning/stores/learning-store'
import {
  getNextLayer,
  isLayerUnlocked,
  LEARNING_LAYER_META,
  LEARNING_LAYER_ORDER,
  type LearningLayerId,
} from '@/learning-engine'
import { Badge, Skeleton } from '@/shared/ui'
import { cn } from '@/shared/utils'

interface ProgressiveLearningLayersProps {
  projectId: string
  nodeId: string
}

export function ProgressiveLearningLayers({ projectId, nodeId }: ProgressiveLearningLayersProps) {
  const mode = useLearningStore((s) => s.mode)
  const expandedLayer = useLearningStore((s) => s.expandedLayer)
  const setExpandedLayer = useLearningStore((s) => s.setExpandedLayer)

  const { data, isLoading, isError } = useComponentKnowledge(projectId, nodeId, mode)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-muted-foreground text-xs">
        Could not load learning content. Try again or check your connection.
      </p>
    )
  }

  const layerMap = new Map(data.layers.map((l) => [l.layer, l]))
  const nextLayer = expandedLayer ? getNextLayer(expandedLayer) : 'overview'

  return (
    <div className="space-y-1">
      {data.cached && (
        <Badge variant="secondary" className="mb-2 text-[10px]">
          Cached
        </Badge>
      )}

      {LEARNING_LAYER_ORDER.map((layerId, index) => {
        const meta = LEARNING_LAYER_META[layerId]
        const content = layerMap.get(layerId)
        const isExpanded = expandedLayer === layerId
        const unlocked = isLayerUnlocked(layerId, expandedLayer)

        return (
          <motion.div key={layerId} initial={false}>
            <button
              type="button"
              disabled={!unlocked && layerId !== 'overview'}
              onClick={() => {
                if (unlocked || layerId === 'overview') {
                  setExpandedLayer(isExpanded ? null : layerId)
                }
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
                unlocked ? 'hover:bg-accent' : 'cursor-not-allowed opacity-50',
                isExpanded && 'bg-accent',
              )}
              aria-expanded={isExpanded}
            >
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  isExpanded ? 'btn-brand shadow-none' : 'bg-muted text-muted-foreground',
                )}
              >
                {!unlocked && layerId !== 'overview' ? (
                  <Lock className="h-2.5 w-2.5" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{meta.label}</p>
                {!isExpanded && (
                  <p className="text-muted-foreground truncate text-xs">{meta.description}</p>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
                  isExpanded && 'rotate-180',
                )}
              />
            </button>

            {isExpanded && content && (
              <div className="px-3 pb-3 pl-10">
                <p className="text-sm font-medium">{content.title}</p>
                <p className="text-primary mt-1 text-xs font-medium">{content.summary}</p>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed whitespace-pre-wrap">
                  {content.content}
                </p>
                {content.bullets.length > 0 && (
                  <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-4 text-xs">
                    {content.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {content.principles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {content.principles.map((p) => (
                      <Badge key={p} variant="outline" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  </div>
                )}
                {nextLayer && isExpanded && layerId === expandedLayer && (
                  <button
                    type="button"
                    className="text-primary mt-3 text-xs font-medium hover:underline"
                    onClick={() => setExpandedLayer(nextLayer as LearningLayerId)}
                  >
                    Continue to {LEARNING_LAYER_META[nextLayer].label} →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

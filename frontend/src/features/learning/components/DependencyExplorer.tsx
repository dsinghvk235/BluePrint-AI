import { ArrowDown, ArrowUp, GitBranch } from 'lucide-react'

import { useDependencies } from '@/features/learning/hooks/use-learning-queries'
import { useLearningStore } from '@/features/learning/stores/learning-store'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { Skeleton } from '@/shared/ui'
import { cn } from '@/shared/utils'

interface DependencyExplorerProps {
  projectId: string
  nodeId: string
}

export function DependencyExplorer({ projectId, nodeId }: DependencyExplorerProps) {
  const { data, isLoading } = useDependencies(projectId, nodeId)
  const setHighlightedNodeIds = useLearningStore((s) => s.setHighlightedNodeIds)
  const highlightedNodeIds = useLearningStore((s) => s.highlightedNodeIds)
  const selectNode = useCanvasStore((s) => s.selectNode)

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />
  }

  if (!data) return null

  const highlight = (ids: string[]) => {
    setHighlightedNodeIds([nodeId, ...ids])
  }

  const focusNode = (id: string) => {
    selectNode(id)
    setHighlightedNodeIds([nodeId, id])
  }

  return (
    <div className="bg-muted/40 space-y-2 rounded-lg p-3">
      <div className="flex items-center gap-1.5">
        <GitBranch className="text-primary h-3.5 w-3.5" />
        <p className="text-xs font-medium">Dependencies</p>
      </div>

      <DependencyList
        icon={<ArrowDown className="h-3 w-3" />}
        label="Upstream"
        nodes={data.upstream}
        highlightedNodeIds={highlightedNodeIds}
        onHighlight={() => highlight(data.upstream.map((n) => n.nodeId))}
        onSelect={focusNode}
      />

      <DependencyList
        icon={<ArrowUp className="h-3 w-3" />}
        label="Downstream"
        nodes={data.downstream}
        highlightedNodeIds={highlightedNodeIds}
        onHighlight={() => highlight(data.downstream.map((n) => n.nodeId))}
        onSelect={focusNode}
      />
    </div>
  )
}

function DependencyList({
  icon,
  label,
  nodes,
  highlightedNodeIds,
  onHighlight,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  nodes: Array<{ nodeId: string; label: string; category: string; relationship: string }>
  highlightedNodeIds: string[]
  onHighlight: () => void
  onSelect: (id: string) => void
}) {
  if (nodes.length === 0) {
    return (
      <p className="text-muted-foreground text-[10px]">
        {icon} {label}: none
      </p>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={onHighlight}
        className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-[10px]"
      >
        {icon} {label} ({nodes.length})
      </button>
      <div className="flex flex-wrap gap-1">
        {nodes.map((n) => (
          <button
            key={n.nodeId}
            type="button"
            onClick={() => onSelect(n.nodeId)}
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] transition-colors',
              highlightedNodeIds.includes(n.nodeId)
                ? 'bg-primary/20 text-primary'
                : 'bg-background hover:bg-accent',
            )}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  )
}

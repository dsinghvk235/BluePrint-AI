import { memo, useCallback, useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Loader2 } from 'lucide-react'

import { getNodeConfig } from '@/features/canvas/engine/node-config'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import type { BlueprintNodeData } from '@/features/canvas/types/diagram'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/utils'

const STATUS_STYLES = {
  active: 'bg-success/15 text-success border-success/30',
  loading: 'bg-warning/15 text-warning border-warning/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  draft: 'bg-muted text-muted-foreground border-border',
  deprecated: 'bg-muted text-muted-foreground border-border opacity-60',
} as const

function BlueprintNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as BlueprintNodeData
  const config = getNodeConfig(nodeData.category)
  const Icon = config.icon
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(nodeData.label)
  const renameNode = useCanvasStore((s) => s.renameNode)

  const commitRename = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== nodeData.label) {
      renameNode(id, trimmed)
    }
    setEditing(false)
  }, [editValue, id, nodeData.label, renameNode])

  const isLoading = nodeData.loading || nodeData.status === 'loading'
  const isError = nodeData.status === 'error' || !!nodeData.error

  return (
    <div
      className={cn(
        'group relative w-[220px] rounded-xl border-2 px-3 py-2.5 shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        selected && 'ring-primary ring-offset-background ring-2 ring-offset-2',
        isError && 'border-destructive',
      )}
      style={{
        background: config.colorVar,
        borderColor: selected ? 'var(--color-primary)' : config.borderVar,
      }}
      onDoubleClick={() => {
        setEditValue(nodeData.label)
        setEditing(true)
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary !h-2 !w-2 !border-0" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !h-2 !w-2 !border-0"
      />

      <div className="flex items-start gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'var(--color-background)', border: `1px solid ${config.borderVar}` }}
        >
          {isLoading ? (
            <Loader2 className="text-primary h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" style={{ color: config.borderVar }} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              className="bg-background w-full rounded border px-1.5 py-0.5 text-sm font-semibold outline-none"
            />
          ) : (
            <p className="truncate text-sm font-semibold">{nodeData.label}</p>
          )}
          {nodeData.subtitle && (
            <p className="text-muted-foreground truncate text-[11px]">{nodeData.subtitle}</p>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <Badge
          variant="secondary"
          className={cn('px-1.5 py-0 text-[9px]', STATUS_STYLES[nodeData.status])}
        >
          {nodeData.status}
        </Badge>
        {nodeData.technology && (
          <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
            {nodeData.technology}
          </Badge>
        )}
      </div>

      {isError && nodeData.error && (
        <p className="text-destructive mt-1 text-[10px]">{nodeData.error}</p>
      )}
    </div>
  )
}

export const BlueprintNode = memo(BlueprintNodeComponent)

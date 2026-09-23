import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

function BlueprintEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
  animated,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={selected ? '!stroke-primary' : undefined}
        style={{
          stroke: selected ? 'var(--color-primary)' : 'var(--color-border)',
          strokeWidth: selected ? 2.5 : 1.5,
        }}
        markerEnd="url(#blueprint-arrow)"
      />
      {animated && (
        <circle r="3" fill="var(--color-primary)">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-card text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] font-medium shadow-sm"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const BlueprintEdge = memo(BlueprintEdgeComponent)

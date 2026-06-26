import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  SelectionMode,
  useReactFlow,
  type OnConnect,
  type OnMove,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { SNAP_GRID } from '@/features/canvas/constants'
import { edgeTypes } from '@/features/canvas/components/edges'
import { nodeTypes } from '@/features/canvas/components/nodes'
import { EmptyCanvasGuide } from '@/features/canvas/components/EmptyCanvasGuide'
import { GenerationProgress } from '@/features/canvas/components/GenerationProgress'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import type { BlueprintEdge, BlueprintNode } from '@/features/canvas/types/diagram'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui'

interface CanvasFlowProps {
  onGenerate: () => void
}

export function CanvasFlow({ onGenerate }: CanvasFlowProps) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const onNodesChange = useCanvasStore((s) => s.onNodesChange)
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange)
  const onConnectStore = useCanvasStore((s) => s.onConnect)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected)
  const copySelected = useCanvasStore((s) => s.copySelected)
  const paste = useCanvasStore((s) => s.paste)
  const autoArrange = useCanvasStore((s) => s.autoArrange)
  const addNode = useCanvasStore((s) => s.addNode)

  const setCursorFlowPos = useCanvasUiStore((s) => s.setCursorFlowPos)
  const setZoom = useCanvasUiStore((s) => s.setZoom)

  const { screenToFlowPosition, fitView } = useReactFlow()
  const didFitRef = useRef(false)

  useEffect(() => {
    didFitRef.current = false
  }, [nodes.length])

  useEffect(() => {
    if (nodes.length > 0 && !didFitRef.current) {
      requestAnimationFrame(() => {
        fitView({ padding: 0.2 })
        didFitRef.current = true
      })
    }
  }, [nodes.length, fitView])

  const onConnect: OnConnect = useCallback(
    (connection) => onConnectStore(connection),
    [onConnectStore],
  )

  const onMove: OnMove = useCallback(
    (_event, viewport) => {
      setZoom(viewport.zoom)
    },
    [setZoom],
  )

  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      setCursorFlowPos(pos)
    },
    [screenToFlowPosition, setCursorFlowPos],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const category = event.dataTransfer.getData('application/blueprintai-node')
      if (!category) return
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      addNode(category as BlueprintNode['data']['category'], position)
    },
    [addNode, screenToFlowPosition],
  )

  const defaultEdgeOptions = useMemo(() => ({ type: 'blueprint', animated: true }), [])

  const isEmpty = nodes.length === 0

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow<BlueprintNode, BlueprintEdge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onMove={onMove}
            onPaneMouseMove={onPaneMouseMove}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionMode={ConnectionMode.Loose}
            selectionMode={SelectionMode.Partial}
            snapToGrid
            snapGrid={SNAP_GRID}
            panOnScroll
            zoomOnScroll
            zoomOnPinch
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode="Shift"
            className="canvas-grid"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--color-canvas-grid)"
            />
            <MiniMap
              className="!bg-card !border-border !shadow-[var(--shadow-elevation-2)]"
              nodeColor={(n) => {
                const category = (n.data as BlueprintNode['data'])?.category
                return category === 'database'
                  ? 'var(--node-database-border)'
                  : 'var(--color-primary)'
              }}
              pannable
              zoomable
            />
            <svg className="pointer-events-none absolute h-0 w-0">
              <defs>
                <marker
                  id="blueprint-arrow"
                  markerWidth="12"
                  markerHeight="12"
                  refX="10"
                  refY="6"
                  orient="auto"
                >
                  <path d="M0,0 L12,6 L0,12 Z" fill="var(--color-border)" />
                </marker>
              </defs>
            </svg>
          </ReactFlow>

          <GenerationProgress />
          {isEmpty && <EmptyCanvasGuide onGenerate={onGenerate} />}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={copySelected}>Copy</ContextMenuItem>
        <ContextMenuItem onClick={paste}>Paste</ContextMenuItem>
        <ContextMenuItem onClick={duplicateSelected}>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={autoArrange}>Auto arrange</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={deleteSelected}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

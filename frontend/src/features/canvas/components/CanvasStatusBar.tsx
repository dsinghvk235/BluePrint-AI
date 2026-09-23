import { Minus, Plus, Wifi, WifiOff } from 'lucide-react'

import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import { APP_NAME } from '@/shared/constants'
import { useTheme } from '@/shared/hooks'

interface CanvasStatusBarProps {
  connected?: boolean
  onZoomIn?: () => void
  onZoomOut?: () => void
}

export function CanvasStatusBar({ connected = true, onZoomIn, onZoomOut }: CanvasStatusBarProps) {
  const cursorPos = useCanvasUiStore((s) => s.cursorFlowPos)
  const zoom = useCanvasUiStore((s) => s.zoom)
  const selectedCount = useCanvasStore((s) =>
    s.nodes.reduce((count, n) => count + (n.selected ? 1 : 0), 0),
  )
  const nodeCount = useCanvasStore((s) => s.nodes.length)
  const edgeCount = useCanvasStore((s) => s.edges.length)
  const { resolvedTheme } = useTheme()

  return (
    <footer className="border-border bg-muted/50 text-muted-foreground flex h-[var(--statusbar-height)] shrink-0 items-center justify-between border-t px-3 text-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
          onClick={onZoomOut}
          aria-label="Zoom out"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="hidden min-w-[3rem] text-center sm:inline">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          <Plus className="h-3 w-3" />
        </button>
        <span className="hidden sm:inline">
          {Math.round(cursorPos.x)}, {Math.round(cursorPos.y)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden md:inline">
          {nodeCount} nodes · {edgeCount} edges
          {selectedCount > 0 && ` · ${selectedCount} selected`}
        </span>
        <span className="hidden capitalize sm:inline">{resolvedTheme} theme</span>
        <span className="flex items-center gap-1">
          {connected ? (
            <>
              <Wifi className="text-success h-3 w-3" aria-hidden />
              <span className="text-success">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="text-error h-3 w-3" aria-hidden />
              <span className="text-error">Offline</span>
            </>
          )}
        </span>
        <span className="text-muted-foreground hidden lg:inline">{APP_NAME}</span>
      </div>
    </footer>
  )
}

import { useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  Download,
  LayoutGrid,
  Redo2,
  Save,
  Search,
  Settings,
  Sparkles,
  Undo2,
  ZoomIn,
} from 'lucide-react'
import type { ComponentType, PointerEvent } from 'react'
import { Link } from 'react-router-dom'

import { useSaveDiagram } from '@/features/canvas/hooks/use-diagram'
import { reactFlowToCanvasSnapshot } from '@/features/canvas/engine/react-flow-adapter'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import { ExportDialog } from '@/features/export'
import { FeedbackWidget } from '@/features/review'
import { ROUTES } from '@/shared/constants'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui'
import { toast } from '@/shared/stores/toast-store'
import { cn } from '@/shared/utils'

interface CanvasToolbarProps {
  projectId?: string
  projectName?: string
  projectTheme?: string | null
  isDirty?: boolean
  isSaving?: boolean
  onFitView?: () => void
  onOpenSearch?: () => void
}

export function CanvasToolbar({
  projectId,
  projectName = 'Untitled Project',
  projectTheme,
  isDirty,
  isSaving,
  onFitView,
  onOpenSearch,
}: CanvasToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false)
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  const canUndo = useCanvasStore((s) => s.past.length > 0)
  const canRedo = useCanvasStore((s) => s.future.length > 0)
  const autoArrange = useCanvasStore((s) => s.autoArrange)
  const alignSelected = useCanvasStore((s) => s.alignSelected)
  const diagramVersion = useCanvasStore((s) => s.diagramVersion)
  const markClean = useCanvasStore((s) => s.markClean)

  const { mutate: save, isPending: isSavePending } = useSaveDiagram(projectId)

  function handleSave() {
    if (!projectId) return
    const { nodes, edges, viewport } = useCanvasStore.getState()
    const snapshot = reactFlowToCanvasSnapshot(nodes, edges, viewport)
    save(
      { canvasData: snapshot, version: diagramVersion },
      {
        onSuccess: (data) => {
          useCanvasStore.getState().setDiagramVersion(data.version)
          markClean()
          toast({ title: 'Diagram saved', variant: 'success' })
        },
      },
    )
  }

  function handleExport() {
    setExportOpen(true)
  }

  return (
    <TooltipProvider>
      <header className="surface-solid flex h-[var(--toolbar-height)] shrink-0 items-center justify-between border-b px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to={ROUTES.DASHBOARD}
            className="text-muted-foreground hover:text-foreground mr-1 hidden text-xs font-medium sm:inline"
          >
            ← Dashboard
          </Link>
          <span className="truncate text-sm font-medium">{projectName}</span>
          {(isDirty || isSaving || isSavePending) && (
            <span className="text-muted-foreground text-xs">
              {isSaving || isSavePending ? 'Saving…' : 'Unsaved'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            icon={Sparkles}
            label="Generate (AI)"
            primary
            onPointerDown={(e) => {
              e.preventDefault()
              useCanvasUiStore.getState().openGenerateDialog()
            }}
          />
          <ToolbarButton icon={Search} label="Search (⌘K)" onClick={onOpenSearch} />
          <ToolbarButton
            icon={Save}
            label="Save (⌘S)"
            onClick={handleSave}
            disabled={!projectId || isSavePending}
          />
          <ToolbarButton icon={Download} label="Export" onClick={handleExport} />
          {projectId && (
            <FeedbackWidget
              targetType="ARCHITECTURE"
              targetId={projectId}
              projectId={projectId}
              compact
            />
          )}
          <Divider />
          <ToolbarButton icon={Undo2} label="Undo (⌘Z)" onClick={undo} disabled={!canUndo} />
          <ToolbarButton icon={Redo2} label="Redo (⌘⇧Z)" onClick={redo} disabled={!canRedo} />
          <Divider />
          <ToolbarButton icon={LayoutGrid} label="Auto arrange" onClick={autoArrange} />
          <ToolbarButton
            icon={AlignLeft}
            label="Align left"
            onClick={() => alignSelected('left')}
          />
          <ToolbarButton
            icon={AlignCenter}
            label="Align center"
            onClick={() => alignSelected('center')}
          />
          <ToolbarButton icon={ZoomIn} label="Fit view (⌘0)" onClick={onFitView} />
          <Divider />
          <ThemeToggle />
          <ToolbarButton icon={Settings} label="Settings" disabled />
        </div>

        <div className="hidden w-8 sm:block" />
      </header>
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        projectId={projectId}
        projectName={projectName}
        theme={projectTheme}
      />
    </TooltipProvider>
  )
}

function Divider() {
  return <div className="bg-border mx-1 h-5 w-px" />
}

interface ToolbarButtonProps {
  icon: ComponentType<{ className?: string }>
  label: string
  primary?: boolean
  disabled?: boolean
  onClick?: () => void
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void
}

function ToolbarButton({
  icon: Icon,
  label,
  primary,
  disabled,
  onClick,
  onPointerDown,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={primary ? 'default' : 'ghost'}
          size="icon"
          className={cn('h-8 w-8', disabled && 'opacity-40')}
          onClick={onClick}
          onPointerDown={onPointerDown}
          disabled={disabled}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

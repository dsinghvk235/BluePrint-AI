import { ReactFlowProvider, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { BookOpen, Layers } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { CanvasFlow } from '@/features/canvas/components/CanvasFlow'
import { CanvasStatusBar } from '@/features/canvas/components/CanvasStatusBar'
import { CanvasToolbar } from '@/features/canvas/components/CanvasToolbar'
import { GenerateDialog } from '@/features/canvas/components/GenerateDialog'
import { LearningPanel } from '@/features/canvas/components/LearningPanel'
import { WorkspaceLeftPanel } from '@/features/canvas/components/WorkspaceLeftPanel'
import { LEFT_PANEL_TABS } from '@/features/canvas/constants'
import { recoverFromLocalStorage, useAutosave } from '@/features/canvas/hooks/use-autosave'
import { useCommandPaletteStore } from '@/shared/stores/command-palette-store'
import { stopGenerationPolling } from '@/features/canvas/hooks/generation-polling'
import { useCanvasKeyboard } from '@/features/canvas/hooks/use-canvas-keyboard'
import { useDiagram } from '@/features/canvas/hooks/use-diagram'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useCanvasUiStore } from '@/features/canvas/stores/canvas-ui-store'
import { projectsApi } from '@/features/projects/api/projects-api'
import { queryKeys } from '@/shared/api/query-keys'
import { QUERY_STALE_TIME } from '@/shared/constants'
import { Button, Skeleton, TooltipProvider } from '@/shared/ui'
import { cn } from '@/shared/utils'

function WorkspaceCanvasInner() {
  const { projectId } = useParams<{ projectId: string }>()
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const leftOpen = useCanvasUiStore((s) => s.leftOpen)
  const rightOpen = useCanvasUiStore((s) => s.rightOpen)
  const leftTab = useCanvasUiStore((s) => s.leftTab)
  const setLeftTab = useCanvasUiStore((s) => s.setLeftTab)
  const toggleLeft = useCanvasUiStore((s) => s.toggleLeft)
  const toggleRight = useCanvasUiStore((s) => s.toggleRight)
  const setGenerating = useCanvasUiStore((s) => s.setGenerating)
  const setGenerationError = useCanvasUiStore((s) => s.setGenerationError)

  const loadSnapshot = useCanvasStore((s) => s.loadSnapshot)
  const setDiagramVersion = useCanvasStore((s) => s.setDiagramVersion)
  const isDirty = useCanvasStore((s) => s.isDirty)

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => projectsApi.get(projectId!),
    enabled: !!projectId,
    staleTime: QUERY_STALE_TIME.MEDIUM,
  })

  const { data: diagram, isLoading: diagramLoading } = useDiagram(projectId)
  const { isSaving } = useAutosave(projectId)
  const hydratedProjectRef = useRef<string | null>(null)

  useEffect(() => {
    hydratedProjectRef.current = null
    setGenerating(false)
    setGenerationError(null)
    stopGenerationPolling()
  }, [projectId, setGenerating, setGenerationError])

  useEffect(() => {
    if (!projectId || !diagram) return
    if (hydratedProjectRef.current === projectId) return

    const serverNodes = diagram.canvasData.nodes
    const serverEdges = diagram.canvasData.edges

    if (serverNodes.length > 0 || serverEdges.length > 0) {
      loadSnapshot(serverNodes, serverEdges, diagram.canvasData.viewport)
      setDiagramVersion(diagram.version)
      hydratedProjectRef.current = projectId
      return
    }

    const recovery = recoverFromLocalStorage(projectId)
    if (recovery?.snapshot) {
      const snap = recovery.snapshot as {
        nodes: typeof serverNodes
        edges: typeof serverEdges
        viewport?: { x: number; y: number; zoom: number }
      }
      if (snap.nodes?.length) {
        loadSnapshot(snap.nodes, snap.edges ?? [], snap.viewport)
        setDiagramVersion(recovery.version)
      }
    }

    hydratedProjectRef.current = projectId
  }, [diagram, loadSnapshot, projectId, setDiagramVersion])

  useEffect(() => {
    if (projectId) {
      projectsApi.open(projectId).catch(() => undefined)
    }
  }, [projectId])

  const handleFitView = useCallback(() => fitView({ padding: 0.2 }), [fitView])

  useCanvasKeyboard({ onFitView: handleFitView })

  const isLoading = projectLoading || diagramLoading

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <CanvasToolbar
          projectId={projectId}
          projectName={project?.name}
          projectTheme={project?.theme}
          isDirty={isDirty}
          isSaving={isSaving}
          onFitView={handleFitView}
          onOpenSearch={() => useCommandPaletteStore.getState().setOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          {leftOpen && (
            <aside
              className="border-border bg-sidebar flex w-[var(--sidebar-width)] shrink-0 flex-col border-r max-md:absolute max-md:z-20 max-md:h-[calc(100%-var(--toolbar-height)-var(--statusbar-height))] max-md:shadow-lg"
              aria-label="Project panel"
            >
              <div className="border-border flex overflow-x-auto border-b">
                {LEFT_PANEL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLeftTab(tab.id)}
                    className={cn(
                      'text-muted-foreground hover:text-foreground flex min-w-[3.5rem] flex-1 items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                      leftTab === tab.id && 'text-foreground border-primary border-b-2',
                    )}
                    aria-pressed={leftTab === tab.id}
                  >
                    <tab.icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              {isLoading ? (
                <div className="space-y-2 p-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ) : (
                <WorkspaceLeftPanel activeTab={leftTab} />
              )}
            </aside>
          )}

          <div className="relative min-w-0 flex-1">
            <CanvasFlow projectId={projectId!} defaultPrompt={project?.prompt ?? ''} />

            <Button
              variant="outline"
              size="icon"
              className="bg-background absolute top-3 left-3 z-20 h-7 w-7 shadow-sm lg:hidden"
              onClick={toggleLeft}
              aria-label="Toggle left panel"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-background absolute top-3 right-3 z-20 h-7 w-7 shadow-sm xl:hidden"
              onClick={toggleRight}
              aria-label="Toggle inspector panel"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Button>
          </div>

          {rightOpen && (
            <aside
              className="border-border bg-sidebar flex w-[var(--panel-width)] shrink-0 flex-col border-l max-xl:absolute max-xl:right-0 max-xl:z-20 max-xl:h-[calc(100%-var(--toolbar-height)-var(--statusbar-height))] max-xl:shadow-lg"
              aria-label="Inspector panel"
            >
              <LearningPanel projectId={projectId!} />
            </aside>
          )}
        </div>

        <CanvasStatusBar onZoomIn={zoomIn} onZoomOut={zoomOut} />

        {projectId && (
          <GenerateDialog projectId={projectId} defaultPrompt={project?.prompt ?? ''} />
        )}
      </div>
    </TooltipProvider>
  )
}

export function WorkspacePage() {
  return (
    <ReactFlowProvider>
      <WorkspaceCanvasInner />
    </ReactFlowProvider>
  )
}

import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  BookOpen,
  Box,
  Download,
  FolderTree,
  Layers,
  LayoutTemplate,
  Minus,
  Plus,
  Redo2,
  Save,
  Search,
  Settings,
  Sparkles,
  Undo2,
  Wifi,
  WifiOff,
  ZoomIn,
} from 'lucide-react'
import { useCallback, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'

import { LearningPanel } from '@/features/canvas/components/LearningPanel'
import { WorkspaceLeftPanel } from '@/features/canvas/components/WorkspaceLeftPanel'
import { APP_NAME, ROUTES } from '@/shared/constants'
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui'
import { useTheme } from '@/shared/hooks'
import { cn } from '@/shared/utils'

const initialNodes: Node[] = [
  {
    id: 'api-gateway',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { label: 'API Gateway' },
    style: {
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 500,
    },
  },
  {
    id: 'auth-service',
    type: 'default',
    position: { x: 100, y: 250 },
    data: { label: 'Auth Service' },
    style: {
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      fontSize: 'var(--font-size-sm)',
    },
  },
  {
    id: 'user-service',
    type: 'default',
    position: { x: 400, y: 250 },
    data: { label: 'User Service' },
    style: {
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      fontSize: 'var(--font-size-sm)',
    },
  },
  {
    id: 'database',
    type: 'default',
    position: { x: 250, y: 400 },
    data: { label: 'PostgreSQL' },
    style: {
      background: 'var(--color-primary-muted)',
      border: '1px solid var(--color-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      fontSize: 'var(--font-size-sm)',
    },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1', source: 'api-gateway', target: 'auth-service', animated: true },
  { id: 'e2', source: 'api-gateway', target: 'user-service', animated: true },
  { id: 'e3', source: 'auth-service', target: 'database' },
  { id: 'e4', source: 'user-service', target: 'database' },
]

function WorkspaceCanvas() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [leftTab, setLeftTab] = useState<'explorer' | 'components' | 'templates'>('explorer')
  const [rightOpen, setRightOpen] = useState(true)
  const [leftOpen, setLeftOpen] = useState(true)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [connected] = useState(true)
  const { resolvedTheme } = useTheme()
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  )

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Toolbar */}
        <header className="surface-solid flex h-[var(--toolbar-height)] shrink-0 items-center justify-between border-b px-3">
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.DASHBOARD}
              className="text-muted-foreground hover:text-foreground mr-2 hidden text-xs font-medium sm:inline"
            >
              ← Dashboard
            </Link>
            <span className="text-sm font-medium">Netflix Architecture</span>
          </div>

          <div className="flex items-center gap-1">
            <ToolbarButton icon={Sparkles} label="Generate" primary />
            <ToolbarButton icon={Search} label="Search" />
            <ToolbarButton icon={Save} label="Save" />
            <ToolbarButton icon={Download} label="Export" />
            <div className="bg-border mx-1 h-5 w-px" />
            <ToolbarButton icon={Undo2} label="Undo" />
            <ToolbarButton icon={Redo2} label="Redo" />
            <div className="bg-border mx-1 h-5 w-px" />
            <ToolbarButton icon={ZoomIn} label="Fit view" onClick={() => fitView()} />
            <ToolbarButton icon={Settings} label="Settings" />
          </div>

          <div className="w-8" />
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          {leftOpen && (
            <aside
              className="border-border bg-sidebar flex w-[var(--sidebar-width)] shrink-0 flex-col border-r"
              aria-label="Project panel"
            >
              <div className="border-border flex border-b">
                {(
                  [
                    { id: 'explorer' as const, icon: FolderTree, label: 'Explorer' },
                    { id: 'components' as const, icon: Box, label: 'Components' },
                    { id: 'templates' as const, icon: LayoutTemplate, label: 'Templates' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLeftTab(tab.id)}
                    className={cn(
                      'text-muted-foreground hover:text-foreground flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
                      leftTab === tab.id && 'text-foreground border-primary border-b-2',
                    )}
                    aria-pressed={leftTab === tab.id}
                  >
                    <tab.icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              <WorkspaceLeftPanel activeTab={leftTab} />
            </aside>
          )}

          {/* Canvas */}
          <div
            className="relative flex-1"
            onMouseMove={(e) =>
              setCursorPos({ x: Math.round(e.clientX), y: Math.round(e.clientY) })
            }
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              className="canvas-grid"
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={20} size={1} color="var(--color-canvas-grid)" />
              <Controls showInteractive={false} className="!shadow-[var(--shadow-elevation-2)]" />
              <MiniMap
                className="!bg-card !border-border !shadow-[var(--shadow-elevation-2)]"
                nodeColor="var(--color-primary)"
              />
            </ReactFlow>

            <Button
              variant="outline"
              size="icon"
              className="bg-background absolute top-3 left-3 h-7 w-7 shadow-sm lg:hidden"
              onClick={() => setLeftOpen((o) => !o)}
              aria-label="Toggle left panel"
            >
              <Layers className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-background absolute top-3 right-3 h-7 w-7 shadow-sm xl:hidden"
              onClick={() => setRightOpen((o) => !o)}
              aria-label="Toggle learning panel"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Right Sidebar — Learning Panel */}
          {rightOpen && (
            <aside
              className="border-border bg-sidebar flex w-[var(--panel-width)] shrink-0 flex-col border-l"
              aria-label="Learning panel"
            >
              <LearningPanel />
            </aside>
          )}
        </div>

        {/* Bottom Status Bar */}
        <footer className="border-border bg-muted/50 text-muted-foreground flex h-[var(--statusbar-height)] shrink-0 items-center justify-between border-t px-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hover:text-foreground flex items-center gap-1 transition-colors"
              onClick={() => zoomOut()}
              aria-label="Zoom out"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="hover:text-foreground flex items-center gap-1 transition-colors"
              onClick={() => zoomIn()}
              aria-label="Zoom in"
            >
              <Plus className="h-3 w-3" />
            </button>
            <span className="hidden sm:inline">
              {cursorPos.x}, {cursorPos.y}
            </span>
          </div>
          <div className="flex items-center gap-4">
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
            <span className="text-muted-foreground hidden md:inline">{APP_NAME}</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}

interface ToolbarButtonProps {
  icon: ComponentType<{ className?: string }>
  label: string
  primary?: boolean
  onClick?: () => void
}

function ToolbarButton({ icon: Icon, label, primary, onClick }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={primary ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={onClick}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function WorkspacePage() {
  return (
    <ReactFlowProvider>
      <WorkspaceCanvas />
    </ReactFlowProvider>
  )
}

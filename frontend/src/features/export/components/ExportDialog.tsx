import { Download, FileJson, FileText, Image, Loader2 } from 'lucide-react'
import { useState } from 'react'

import { reactFlowToCanvasSnapshot } from '@/features/canvas/engine/react-flow-adapter'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { downloadProjectExport, type ExportFormat } from '@/features/search/api/search-api'
import { exportCanvasToPng } from '@/features/export/utils/client-export'
import { toast } from '@/shared/stores/toast-store'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  projectName?: string
  theme?: string | null
}

const FORMATS: Array<{
  id: ExportFormat
  label: string
  description: string
  icon: typeof FileJson
}> = [
  { id: 'JSON', label: 'JSON', description: 'Full diagram + metadata', icon: FileJson },
  { id: 'MARKDOWN', label: 'Markdown', description: 'Documentation-ready outline', icon: FileText },
  { id: 'SVG', label: 'SVG', description: 'Vector diagram', icon: Image },
  { id: 'PDF', label: 'PDF', description: 'Shareable document', icon: FileText },
  { id: 'PNG', label: 'PNG', description: 'Pixel-perfect canvas image', icon: Image },
]

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  projectName = 'project',
  theme,
}: ExportDialogProps) {
  const [activeFormat, setActiveFormat] = useState<ExportFormat | null>(null)
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const viewport = useCanvasStore((s) => s.viewport)

  async function handleExport(format: ExportFormat) {
    if (!projectId) return
    setActiveFormat(format)
    try {
      if (format === 'PNG') {
        const snapshot = reactFlowToCanvasSnapshot(nodes, edges, viewport)
        await exportCanvasToPng(snapshot, projectName, theme === 'dark' ? 'dark' : 'light')
      } else {
        await downloadProjectExport(projectId, format)
      }
      toast({ title: `Exported as ${format}`, variant: 'success' })
      onOpenChange(false)
    } catch {
      toast({ title: 'Export failed', variant: 'error' })
    } finally {
      setActiveFormat(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export architecture</DialogTitle>
          <DialogDescription>
            Preserve layout, theme, and metadata in your preferred format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {FORMATS.map((format) => {
            const Icon = format.icon
            const loading = activeFormat === format.id
            return (
              <Button
                key={format.id}
                variant="outline"
                className="h-auto justify-start gap-3 px-3 py-3"
                disabled={!projectId || loading}
                onClick={() => handleExport(format.id)}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{format.label}</span>
                  <span className="text-muted-foreground text-xs">{format.description}</span>
                </span>
                <Download className="text-muted-foreground ml-auto h-4 w-4" />
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

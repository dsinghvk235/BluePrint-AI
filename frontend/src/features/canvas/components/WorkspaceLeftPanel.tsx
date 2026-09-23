import { motion } from 'framer-motion'
import { ChevronRight, Layers } from 'lucide-react'

import { COMPONENT_LIBRARY, DIAGRAM_TEMPLATES } from '@/features/canvas/constants'
import { getNodeConfig } from '@/features/canvas/engine/node-config'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import type { LeftPanelTab } from '@/features/canvas/stores/canvas-ui-store'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/utils'

interface WorkspaceLeftPanelProps {
  activeTab: LeftPanelTab
}

export function WorkspaceLeftPanel({ activeTab }: WorkspaceLeftPanelProps) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)

  return (
    <div className="flex-1 overflow-y-auto p-3">
      {activeTab === 'explorer' && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Project Explorer
          </p>
          {nodes.length === 0 ? (
            <p className="text-muted-foreground px-2 text-xs">No components yet</p>
          ) : (
            nodes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  'hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                  item.selected && 'bg-accent',
                )}
              >
                <ChevronRight className="text-muted-foreground h-3 w-3" />
                <span className="flex-1 truncate">{item.data.label}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {item.data.category}
                </Badge>
              </button>
            ))
          )}
        </motion.div>
      )}

      {activeTab === 'layers' && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Layers
          </p>
          {[...nodes].reverse().map((node, index) => (
            <div
              key={node.id}
              className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Layers className="text-muted-foreground h-3 w-3" />
              <span className="flex-1 truncate">{node.data.label}</span>
              <span className="text-muted-foreground text-[10px]">z{nodes.length - index}</span>
            </div>
          ))}
          {edges.length > 0 && (
            <p className="text-muted-foreground mt-3 text-[10px]">{edges.length} connections</p>
          )}
        </motion.div>
      )}

      {activeTab === 'components' && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Component Library
          </p>
          {COMPONENT_LIBRARY.map((item) => {
            const config = getNodeConfig(item.category)
            const Icon = config.icon
            return (
              <button
                key={item.category}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/blueprintai-node', item.category)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className="hover:bg-accent flex w-full cursor-grab items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors active:cursor-grabbing"
              >
                <Icon className="text-primary h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </button>
            )
          })}
        </motion.div>
      )}

      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Templates
          </p>
          {DIAGRAM_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className="hover:bg-accent border-border w-full rounded-lg border p-3 text-left transition-colors"
            >
              <p className="text-sm font-medium">{template.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{template.nodes} components</p>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

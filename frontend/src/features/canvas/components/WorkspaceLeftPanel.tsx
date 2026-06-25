import { motion } from 'framer-motion'
import { ChevronRight, Database, Globe, Server, Shield } from 'lucide-react'

import { Badge } from '@/shared/ui'

interface WorkspaceLeftPanelProps {
  activeTab: 'explorer' | 'components' | 'templates'
}

const explorerItems = [
  { name: 'API Gateway', type: 'service' },
  { name: 'Auth Service', type: 'service' },
  { name: 'User Service', type: 'service' },
  { name: 'PostgreSQL', type: 'database' },
]

const componentLibrary = [
  { name: 'Load Balancer', icon: Globe },
  { name: 'Microservice', icon: Server },
  { name: 'Database', icon: Database },
  { name: 'Auth Layer', icon: Shield },
]

const templates = [
  { name: 'E-commerce Platform', nodes: 12 },
  { name: 'Social Media App', nodes: 15 },
  { name: 'IoT Pipeline', nodes: 8 },
  { name: 'ML Inference Stack', nodes: 10 },
]

export function WorkspaceLeftPanel({ activeTab }: WorkspaceLeftPanelProps) {
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
          {explorerItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className="hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors"
            >
              <ChevronRight className="text-muted-foreground h-3 w-3" />
              <span className="flex-1 truncate">{item.name}</span>
              <Badge variant="secondary" className="text-[10px]">
                {item.type}
              </Badge>
            </button>
          ))}
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
          {componentLibrary.map((item) => (
            <button
              key={item.name}
              type="button"
              draggable
              className="hover:bg-accent flex w-full cursor-grab items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors active:cursor-grabbing"
            >
              <item.icon className="text-primary h-4 w-4" aria-hidden />
              <span>{item.name}</span>
            </button>
          ))}
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
          {templates.map((template) => (
            <button
              key={template.name}
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

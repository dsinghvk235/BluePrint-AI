import { motion } from 'framer-motion'
import { BookOpen, ChevronDown, Lightbulb, MessageSquare } from 'lucide-react'
import { useState } from 'react'

import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { LEARNING_LAYERS } from '@/shared/constants'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/shared/ui'
import { cn } from '@/shared/utils'

const layerContent: Record<string, { summary: string; details: string }> = {
  architecture: {
    summary: 'System overview — components and how they connect.',
    details:
      'Select a node on the canvas to see component-level explanations. The learning panel reveals architecture progressively so you are never overwhelmed.',
  },
  component: {
    summary: 'Component-level detail for the selected node.',
    details:
      'Inspect responsibilities, protocols, and connections for each service in your diagram.',
  },
  why: {
    summary: 'Design rationale behind each choice.',
    details:
      'Understand why each component exists and what problem it solves in the overall system.',
  },
  principle: {
    summary: 'Engineering principles applied.',
    details: 'Patterns like separation of concerns, single responsibility, and loose coupling.',
  },
  tradeoffs: {
    summary: 'Costs and benefits of this approach.',
    details:
      'Every architecture involves trade-offs. Review latency, complexity, and operational costs.',
  },
  alternatives: {
    summary: 'Other viable design options.',
    details: 'Compare service mesh, monolith, and serverless alternatives for your use case.',
  },
  interview: {
    summary: 'Practice system design questions.',
    details: 'Prepare for interviews with questions tailored to your architecture.',
  },
}

export function LearningPanel() {
  const [expandedLayer, setExpandedLayer] = useState<string | null>('architecture')
  const selected = useCanvasStore((s) => s.nodes.find((n) => n.selected) ?? null)
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const edges = useCanvasStore((s) => s.edges)
  const outbound = selected ? edges.filter((e) => e.source === selected.id).length : 0
  const inbound = selected ? edges.filter((e) => e.target === selected.id).length : 0

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-4 w-4" aria-hidden />
          <h2 className="text-sm font-semibold">Inspector</h2>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Properties, AI explanations, and guided learning.
        </p>
      </div>

      <Tabs defaultValue="props" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3">
          <TabsTrigger value="learn" className="text-xs">
            Learn
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            AI
          </TabsTrigger>
          <TabsTrigger value="props" className="text-xs">
            Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="mt-2 space-y-1">
            {LEARNING_LAYERS.map((layer, index) => {
              const isExpanded = expandedLayer === layer.id
              const content = layerContent[layer.id]

              return (
                <motion.div key={layer.id} initial={false}>
                  <button
                    type="button"
                    onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                    className={cn(
                      'hover:bg-accent flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
                      isExpanded && 'bg-accent',
                    )}
                    aria-expanded={isExpanded}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                        isExpanded ? 'btn-brand shadow-none' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{layer.label}</p>
                      {!isExpanded && (
                        <p className="text-muted-foreground truncate text-xs">
                          {layer.description}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={cn(
                        'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </button>

                  {isExpanded && content && (
                    <div className="px-3 pb-3 pl-10">
                      <p className="text-sm font-medium">{content.summary}</p>
                      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        {content.details}
                      </p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="ai" className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="bg-muted/50 mt-2 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">AI Explanation</p>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                  {selected
                    ? (selected.data.description ??
                      `${selected.data.label} is a ${selected.data.category} component${
                        selected.data.technology ? ` built with ${selected.data.technology}` : ''
                      }. It connects to ${outbound} downstream and ${inbound} upstream services.`)
                    : 'Select a component on the canvas for contextual AI explanations.'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Lightbulb className="text-warning h-4 w-4" aria-hidden />
            <span className="text-muted-foreground text-xs">
              Explanations update as you edit the diagram.
            </span>
          </div>
        </TabsContent>

        <TabsContent value="props" className="flex-1 overflow-y-auto px-4 pb-4">
          {selected ? (
            <Accordion type="single" collapsible defaultValue="details" className="mt-2">
              <AccordionItem value="details">
                <AccordionTrigger className="text-sm">Component Details</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <label className="text-muted-foreground text-xs">Name</label>
                    <Input
                      value={selected.data.label}
                      onChange={(e) => updateNodeData(selected.id, { label: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Subtitle</label>
                    <Input
                      value={selected.data.subtitle ?? ''}
                      onChange={(e) => updateNodeData(selected.id, { subtitle: e.target.value })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Technology</label>
                    <Input
                      value={selected.data.technology ?? ''}
                      onChange={(e) => updateNodeData(selected.id, { technology: e.target.value })}
                      className="mt-1 h-8 text-sm"
                      placeholder="e.g. PostgreSQL, Redis"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Description</label>
                    <Textarea
                      value={selected.data.description ?? ''}
                      onChange={(e) => updateNodeData(selected.id, { description: e.target.value })}
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>
                        <Badge variant="secondary">{selected.data.category}</Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium capitalize">{selected.data.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Connections</dt>
                      <dd className="font-medium">
                        {inbound} in · {outbound} out
                      </dd>
                    </div>
                  </dl>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <p className="text-muted-foreground mt-4 text-center text-xs">
              Select a node to inspect its properties
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { BookOpen } from 'lucide-react'
import { useEffect } from 'react'

import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { DecisionLogPanel } from '@/features/learning/components/DecisionLogPanel'
import { DependencyExplorer } from '@/features/learning/components/DependencyExplorer'
import { LearningModeSelector } from '@/features/learning/components/LearningModeSelector'
import { MentorChatPanel } from '@/features/learning/components/MentorChatPanel'
import { ProgressiveLearningLayers } from '@/features/learning/components/ProgressiveLearningLayers'
import { useLearningStore } from '@/features/learning/stores/learning-store'
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

interface LearningPanelProps {
  projectId: string
}

export function LearningPanel({ projectId }: LearningPanelProps) {
  const selected = useCanvasStore((s) => s.nodes.find((n) => n.selected) ?? null)
  const updateNodeData = useCanvasStore((s) => s.updateNodeData)
  const edges = useCanvasStore((s) => s.edges)
  const setSelectedNodeId = useLearningStore((s) => s.setSelectedNodeId)

  const outbound = selected ? edges.filter((e) => e.source === selected.id).length : 0
  const inbound = selected ? edges.filter((e) => e.target === selected.id).length : 0

  useEffect(() => {
    setSelectedNodeId(selected?.id ?? null)
  }, [selected?.id, setSelectedNodeId])

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-4 w-4" aria-hidden />
          <h2 className="text-sm font-semibold">Inspector</h2>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Progressive learning, AI mentor, and component properties.
        </p>
        <LearningModeSelector className="mt-3" />
      </div>

      <Tabs defaultValue="learn" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3">
          <TabsTrigger value="learn" className="text-xs">
            Learn
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            Mentor
          </TabsTrigger>
          <TabsTrigger value="props" className="text-xs">
            Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="flex-1 overflow-y-auto px-4 pb-4">
          {selected ? (
            <div className="mt-2">
              <p className="text-muted-foreground mb-2 text-xs">
                Learning about{' '}
                <span className="text-foreground font-medium">{selected.data.label}</span>
              </p>
              <DependencyExplorer projectId={projectId} nodeId={selected.id} />
              <ProgressiveLearningLayers projectId={projectId} nodeId={selected.id} />
              <DecisionLogPanel projectId={projectId} nodeId={selected.id} />
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-center text-xs">
              Select a component on the canvas to begin progressive learning.
            </p>
          )}
        </TabsContent>

        <TabsContent value="ai" className="flex flex-1 flex-col overflow-hidden px-4 pb-4">
          <div className="mt-2 min-h-0 flex-1">
            <MentorChatPanel
              projectId={projectId}
              nodeId={selected?.id ?? null}
              nodeLabel={selected?.data.label}
            />
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

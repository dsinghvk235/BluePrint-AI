import { motion } from 'framer-motion'
import { BookOpen, ChevronDown, Lightbulb, MessageSquare } from 'lucide-react'
import { useState } from 'react'

import { LEARNING_LAYERS } from '@/shared/constants'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'
import { cn } from '@/shared/utils'

const layerContent: Record<string, { summary: string; details: string }> = {
  architecture: {
    summary: 'A microservices architecture with API gateway pattern.',
    details:
      'The system uses an API Gateway as the single entry point, routing requests to specialized services. Auth and User services handle identity and profile management, with a shared PostgreSQL database for persistence.',
  },
  component: {
    summary: 'API Gateway — routes and authenticates incoming requests.',
    details:
      'The API Gateway terminates TLS, validates JWT tokens, applies rate limiting, and routes requests to downstream services. It implements the Backend for Frontend (BFF) pattern for client-specific aggregations.',
  },
  why: {
    summary: 'Decouples clients from internal service topology.',
    details:
      'Without a gateway, clients would need to know every service endpoint. The gateway provides a stable API surface while allowing internal services to evolve independently.',
  },
  principle: {
    summary: 'Single Responsibility & Separation of Concerns',
    details:
      'Each service owns a bounded context. The gateway handles cross-cutting concerns (auth, routing, rate limiting) so domain services stay focused on business logic.',
  },
  tradeoffs: {
    summary: 'Added latency vs. simplified client integration',
    details:
      'Pros: Centralized auth, easier client SDKs, service discovery abstraction. Cons: Single point of failure (mitigated by HA deployment), additional network hop adds ~5-15ms latency.',
  },
  alternatives: {
    summary: 'Service mesh, direct client-to-service, monolith',
    details:
      'A service mesh (Istio/Linkerd) handles routing at the infrastructure layer. Direct calls reduce latency but increase client complexity. A monolith simplifies early development but limits independent scaling.',
  },
  interview: {
    summary: 'Common system design questions for this pattern',
    details:
      '1. How would you handle gateway failure? 2. When would you choose a service mesh over an API gateway? 3. How do you prevent the gateway from becoming a bottleneck? 4. Design rate limiting for 1M RPS.',
  },
}

export function LearningPanel() {
  const [expandedLayer, setExpandedLayer] = useState<string | null>('architecture')

  return (
    <div className="flex h-full flex-col">
      <div className="border-border border-b p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-4 w-4" aria-hidden />
          <h2 className="text-sm font-semibold">Learning Panel</h2>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Explore step by step — never overwhelm, always learn.
        </p>
      </div>

      <Tabs defaultValue="learn" className="flex flex-1 flex-col overflow-hidden">
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
              const isAccessible = index === 0 || expandedLayer !== null

              return (
                <motion.div
                  key={layer.id}
                  initial={false}
                  animate={{ opacity: isAccessible ? 1 : 0.5 }}
                >
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
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-3 pb-3 pl-10"
                    >
                      <p className="text-sm font-medium">{content.summary}</p>
                      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        {content.details}
                      </p>
                      {index < LEARNING_LAYERS.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setExpandedLayer(LEARNING_LAYERS[index + 1]?.id ?? null)}
                          className="text-primary mt-3 text-xs font-medium hover:underline"
                        >
                          Continue to {LEARNING_LAYERS[index + 1]?.label} →
                        </button>
                      )}
                    </motion.div>
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
                  The API Gateway pattern is ideal here because Netflix-scale systems need a single
                  entry point for thousands of microservices. It enables centralized authentication,
                  request routing, and protocol translation while keeping individual services
                  independently deployable.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Lightbulb className="text-warning h-4 w-4" aria-hidden />
            <span className="text-muted-foreground text-xs">
              Select a component on the canvas for contextual explanations.
            </span>
          </div>
        </TabsContent>

        <TabsContent value="props" className="flex-1 overflow-y-auto px-4 pb-4">
          <Accordion type="single" collapsible defaultValue="details" className="mt-2">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm">Component Details</AccordionTrigger>
              <AccordionContent>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium">API Gateway</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd>
                      <Badge variant="secondary">Service</Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Protocol</dt>
                    <dd className="font-medium">HTTP/REST</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Connections</dt>
                    <dd className="font-medium">2 outbound</dd>
                  </div>
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}

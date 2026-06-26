import { Scale } from 'lucide-react'

import { useDecisionLogs } from '@/features/learning/hooks/use-learning-queries'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Skeleton } from '@/shared/ui'

interface DecisionLogPanelProps {
  projectId: string
  nodeId: string
}

export function DecisionLogPanel({ projectId, nodeId }: DecisionLogPanelProps) {
  const { data, isLoading } = useDecisionLogs(projectId, nodeId)

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />
  }

  const log = data?.[0]
  if (!log) return null

  return (
    <Accordion type="single" collapsible className="mt-3">
      <AccordionItem value="decision-log">
        <AccordionTrigger className="text-xs">
          <span className="flex items-center gap-1.5">
            <Scale className="text-primary h-3.5 w-3.5" />
            Decision Log
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 text-xs">
          <div>
            <p className="text-muted-foreground">Decision</p>
            <p className="font-medium">{log.decision}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reason</p>
            <p>{log.reason}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Engineering Principle</p>
            <p>{log.engineeringPrinciple}</p>
          </div>
          {log.alternativesConsidered.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Alternatives Considered</p>
              <ul className="space-y-1">
                {log.alternativesConsidered.map((alt) => (
                  <li key={alt.name} className="bg-muted/50 rounded px-2 py-1">
                    <span className="font-medium">{alt.name}</span>
                    <span className="text-muted-foreground"> — {alt.reasonRejected}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {log.potentialRisks.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Potential Risks</p>
              <ul className="text-muted-foreground list-disc pl-4">
                {log.potentialRisks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

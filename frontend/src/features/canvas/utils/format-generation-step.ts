const STEP_LABELS: Record<string, string> = {
  queued: 'Queued',
  'architecture-foundation-generator': 'Designing foundation (requirements & high-level design)',
  'architecture-technical-generator': 'Adding technical depth (APIs, data, security, scaling)',
  'diagram-layout-builder': 'Building diagram from design',
  completed: 'Complete',
}

export function formatGenerationStep(step: string): string {
  if (!step) return 'Initializing'
  return STEP_LABELS[step] ?? step.replace(/-/g, ' ')
}

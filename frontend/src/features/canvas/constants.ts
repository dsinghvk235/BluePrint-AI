import { Box, FolderTree, Layers, LayoutTemplate } from 'lucide-react'

export const CANVAS_SHORTCUTS = {
  undo: { key: 'z', meta: true, label: 'Undo' },
  redo: { key: 'z', meta: true, shift: true, label: 'Redo' },
  redoAlt: { key: 'y', meta: true, label: 'Redo' },
  copy: { key: 'c', meta: true, label: 'Copy' },
  paste: { key: 'v', meta: true, label: 'Paste' },
  duplicate: { key: 'd', meta: true, label: 'Duplicate' },
  delete: { key: 'Backspace', label: 'Delete' },
  deleteAlt: { key: 'Delete', label: 'Delete' },
  selectAll: { key: 'a', meta: true, label: 'Select all' },
  fitView: { key: '0', meta: true, label: 'Fit view' },
  save: { key: 's', meta: true, label: 'Save' },
} as const

export const SNAP_GRID: [number, number] = [20, 20]

export const COMPONENT_LIBRARY = [
  { category: 'api-gateway' as const, label: 'API Gateway' },
  { category: 'microservice' as const, label: 'Microservice' },
  { category: 'database' as const, label: 'Database' },
  { category: 'cache' as const, label: 'Cache' },
  { category: 'queue' as const, label: 'Queue' },
  { category: 'cdn' as const, label: 'CDN' },
  { category: 'storage' as const, label: 'Storage' },
  { category: 'load-balancer' as const, label: 'Load Balancer' },
  { category: 'external-api' as const, label: 'External API' },
  { category: 'authentication' as const, label: 'Authentication' },
  { category: 'worker' as const, label: 'Worker' },
  { category: 'monitoring' as const, label: 'Monitoring' },
  { category: 'custom' as const, label: 'Custom' },
] as const

export const DIAGRAM_TEMPLATES = [
  { id: 'ecommerce', name: 'E-commerce Platform', nodes: 12 },
  { id: 'social', name: 'Social Media App', nodes: 15 },
  { id: 'iot', name: 'IoT Pipeline', nodes: 8 },
  { id: 'ml', name: 'ML Inference Stack', nodes: 10 },
] as const

export const LOCAL_RECOVERY_KEY = (projectId: string) => `blueprintai:canvas:${projectId}`

export const LEFT_PANEL_TABS = [
  { id: 'explorer' as const, icon: FolderTree, label: 'Explorer' },
  { id: 'components' as const, icon: Box, label: 'Components' },
  { id: 'templates' as const, icon: LayoutTemplate, label: 'Templates' },
  { id: 'layers' as const, icon: Layers, label: 'Layers' },
] as const

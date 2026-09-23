import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Box,
  Cloud,
  Database,
  Globe,
  HardDrive,
  Layers,
  MessageSquare,
  Server,
  Shield,
  Zap,
} from 'lucide-react'

import type { AiNodeType } from '@/features/canvas/types/diagram'

export interface NodeCategoryConfig {
  category: AiNodeType
  label: string
  icon: LucideIcon
  colorVar: string
  borderVar: string
  defaultSubtitle?: string
}

export const NODE_CATEGORIES: Record<AiNodeType, NodeCategoryConfig> = {
  'api-gateway': {
    category: 'api-gateway',
    label: 'API Gateway',
    icon: Layers,
    colorVar: 'var(--node-api-gateway-bg)',
    borderVar: 'var(--node-api-gateway-border)',
    defaultSubtitle: 'Entry point',
  },
  microservice: {
    category: 'microservice',
    label: 'Microservice',
    icon: Server,
    colorVar: 'var(--node-service-bg)',
    borderVar: 'var(--node-service-border)',
    defaultSubtitle: 'Domain service',
  },
  service: {
    category: 'service',
    label: 'Service',
    icon: Server,
    colorVar: 'var(--node-service-bg)',
    borderVar: 'var(--node-service-border)',
    defaultSubtitle: 'Application service',
  },
  database: {
    category: 'database',
    label: 'Database',
    icon: Database,
    colorVar: 'var(--node-database-bg)',
    borderVar: 'var(--node-database-border)',
    defaultSubtitle: 'Persistent store',
  },
  cache: {
    category: 'cache',
    label: 'Cache',
    icon: Zap,
    colorVar: 'var(--node-cache-bg)',
    borderVar: 'var(--node-cache-border)',
    defaultSubtitle: 'In-memory cache',
  },
  queue: {
    category: 'queue',
    label: 'Queue',
    icon: MessageSquare,
    colorVar: 'var(--node-queue-bg)',
    borderVar: 'var(--node-queue-border)',
    defaultSubtitle: 'Message broker',
  },
  cdn: {
    category: 'cdn',
    label: 'CDN',
    icon: Cloud,
    colorVar: 'var(--node-cdn-bg)',
    borderVar: 'var(--node-cdn-border)',
    defaultSubtitle: 'Content delivery',
  },
  storage: {
    category: 'storage',
    label: 'Storage',
    icon: HardDrive,
    colorVar: 'var(--node-storage-bg)',
    borderVar: 'var(--node-storage-border)',
    defaultSubtitle: 'Object storage',
  },
  'load-balancer': {
    category: 'load-balancer',
    label: 'Load Balancer',
    icon: Globe,
    colorVar: 'var(--node-lb-bg)',
    borderVar: 'var(--node-lb-border)',
    defaultSubtitle: 'Traffic distribution',
  },
  'external-api': {
    category: 'external-api',
    label: 'External API',
    icon: Globe,
    colorVar: 'var(--node-external-bg)',
    borderVar: 'var(--node-external-border)',
    defaultSubtitle: 'Third-party',
  },
  authentication: {
    category: 'authentication',
    label: 'Authentication',
    icon: Shield,
    colorVar: 'var(--node-auth-bg)',
    borderVar: 'var(--node-auth-border)',
    defaultSubtitle: 'Identity & access',
  },
  worker: {
    category: 'worker',
    label: 'Worker',
    icon: Activity,
    colorVar: 'var(--node-worker-bg)',
    borderVar: 'var(--node-worker-border)',
    defaultSubtitle: 'Background processor',
  },
  monitoring: {
    category: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    colorVar: 'var(--node-monitoring-bg)',
    borderVar: 'var(--node-monitoring-border)',
    defaultSubtitle: 'Observability',
  },
  client: {
    category: 'client',
    label: 'Client',
    icon: Globe,
    colorVar: 'var(--node-client-bg)',
    borderVar: 'var(--node-client-border)',
    defaultSubtitle: 'User-facing app',
  },
  custom: {
    category: 'custom',
    label: 'Custom',
    icon: Box,
    colorVar: 'var(--node-custom-bg)',
    borderVar: 'var(--node-custom-border)',
    defaultSubtitle: 'Custom component',
  },
}

const TYPE_ALIASES: Record<string, AiNodeType> = {
  service: 'service',
  microservice: 'microservice',
  database: 'database',
  db: 'database',
  cache: 'cache',
  redis: 'cache',
  queue: 'queue',
  broker: 'queue',
  client: 'client',
  frontend: 'client',
  'api-gateway': 'api-gateway',
  gateway: 'api-gateway',
  cdn: 'cdn',
  storage: 'storage',
  s3: 'storage',
  'load-balancer': 'load-balancer',
  lb: 'load-balancer',
  'external-api': 'external-api',
  external: 'external-api',
  auth: 'authentication',
  authentication: 'authentication',
  worker: 'worker',
  monitoring: 'monitoring',
  observability: 'monitoring',
}

export function normalizeNodeType(type: string): AiNodeType {
  const normalized = type.toLowerCase().trim()
  return TYPE_ALIASES[normalized] ?? 'custom'
}

export function getNodeConfig(category: AiNodeType): NodeCategoryConfig {
  return NODE_CATEGORIES[category] ?? NODE_CATEGORIES.custom
}

import type { ComponentKnowledge, LayerContent, LearningModeId } from './types'

const TTL_MS = 24 * 60 * 60 * 1000

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<ComponentKnowledge>>()

export function componentCacheKey(projectId: string, nodeId: string, mode: LearningModeId): string {
  return `component:${projectId}:${nodeId}:${mode}`
}

export function getCachedComponent(key: string): ComponentKnowledge | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.value
}

export function setCachedComponent(key: string, value: ComponentKnowledge): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + TTL_MS })
}

export function invalidateComponentCache(projectId: string, nodeId?: string): void {
  const prefix = nodeId ? `component:${projectId}:${nodeId}:` : `component:${projectId}:`
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }
}

export function getLayerFromKnowledge(
  knowledge: ComponentKnowledge,
  layerId: string,
): LayerContent | null {
  return knowledge.layers.find((l) => l.layer === layerId) ?? null
}

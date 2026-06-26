import { LEARNING_LAYER_ORDER, type LearningLayerId } from './types'

/** Progressive learning — layers unlock sequentially to avoid overwhelming users. */
export function getUnlockedLayers(expandedLayer: LearningLayerId | null): LearningLayerId[] {
  if (!expandedLayer) {
    return ['overview']
  }
  const index = LEARNING_LAYER_ORDER.indexOf(expandedLayer)
  if (index < 0) return ['overview']
  return LEARNING_LAYER_ORDER.slice(0, index + 1)
}

export function getNextLayer(current: LearningLayerId): LearningLayerId | null {
  const index = LEARNING_LAYER_ORDER.indexOf(current)
  if (index < 0 || index >= LEARNING_LAYER_ORDER.length - 1) return null
  return LEARNING_LAYER_ORDER[index + 1] ?? null
}

export function isLayerUnlocked(
  layer: LearningLayerId,
  expandedLayer: LearningLayerId | null,
): boolean {
  return getUnlockedLayers(expandedLayer).includes(layer)
}

export function suggestExpandTarget(expandedLayer: LearningLayerId | null): LearningLayerId {
  if (!expandedLayer) return 'overview'
  return getNextLayer(expandedLayer) ?? expandedLayer
}

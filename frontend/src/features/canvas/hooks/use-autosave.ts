import { useEffect, useRef } from 'react'

import { LOCAL_RECOVERY_KEY } from '@/features/canvas/constants'
import { reactFlowToCanvasSnapshot } from '@/features/canvas/engine/react-flow-adapter'
import { useSaveDiagram } from '@/features/canvas/hooks/use-diagram'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'
import { useDebounce } from '@/shared/hooks/use-debounce'

const AUTOSAVE_DELAY_MS = 2000

export function useAutosave(projectId: string | undefined) {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const isDirty = useCanvasStore((s) => s.isDirty)
  const diagramVersion = useCanvasStore((s) => s.diagramVersion)
  const markClean = useCanvasStore((s) => s.markClean)

  const { mutate: save, isPending } = useSaveDiagram(projectId)
  const debouncedDirty = useDebounce(isDirty, AUTOSAVE_DELAY_MS)
  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    if (!projectId || !debouncedDirty || !isDirty) return

    const { viewport } = useCanvasStore.getState()
    const snapshot = reactFlowToCanvasSnapshot(nodes, edges, viewport)
    const serialized = JSON.stringify(snapshot)
    if (serialized === lastSavedRef.current) return

    save(
      { canvasData: snapshot, version: diagramVersion },
      {
        onSuccess: (data) => {
          lastSavedRef.current = serialized
          useCanvasStore.getState().setDiagramVersion(data.version)
          markClean()
          localStorage.setItem(
            LOCAL_RECOVERY_KEY(projectId),
            JSON.stringify({ snapshot, version: data.version, savedAt: Date.now() }),
          )
        },
      },
    )
  }, [debouncedDirty, diagramVersion, edges, isDirty, markClean, nodes, projectId, save])

  return { isSaving: isPending, isDirty }
}

export function recoverFromLocalStorage(projectId: string) {
  try {
    const raw = localStorage.getItem(LOCAL_RECOVERY_KEY(projectId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { snapshot: unknown; version: number; savedAt: number }
    return parsed
  } catch {
    return null
  }
}

import { useEffect } from 'react'

import { CANVAS_SHORTCUTS } from '@/features/canvas/constants'
import { useCanvasStore } from '@/features/canvas/stores/canvas-store'

interface UseCanvasKeyboardOptions {
  onSave?: () => void
  onFitView?: () => void
}

export function useCanvasKeyboard({ onSave, onFitView }: UseCanvasKeyboardOptions = {}) {
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)
  const copySelected = useCanvasStore((s) => s.copySelected)
  const paste = useCanvasStore((s) => s.paste)
  const duplicateSelected = useCanvasStore((s) => s.duplicateSelected)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === CANVAS_SHORTCUTS.undo.key && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if (
        meta &&
        ((e.key === CANVAS_SHORTCUTS.redo.key && e.shiftKey) ||
          e.key === CANVAS_SHORTCUTS.redoAlt.key)
      ) {
        e.preventDefault()
        redo()
        return
      }
      if (meta && e.key === CANVAS_SHORTCUTS.copy.key) {
        e.preventDefault()
        copySelected()
        return
      }
      if (meta && e.key === CANVAS_SHORTCUTS.paste.key) {
        e.preventDefault()
        paste()
        return
      }
      if (meta && e.key === CANVAS_SHORTCUTS.duplicate.key) {
        e.preventDefault()
        duplicateSelected()
        return
      }
      if (meta && e.key === CANVAS_SHORTCUTS.save.key) {
        e.preventDefault()
        onSave?.()
        return
      }
      if (meta && e.key === CANVAS_SHORTCUTS.fitView.key) {
        e.preventDefault()
        onFitView?.()
        return
      }
      if (e.key === CANVAS_SHORTCUTS.delete.key || e.key === CANVAS_SHORTCUTS.deleteAlt.key) {
        deleteSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [copySelected, deleteSelected, duplicateSelected, onFitView, onSave, paste, redo, undo])
}

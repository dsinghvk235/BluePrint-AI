import { create } from 'zustand'

export type LeftPanelTab = 'explorer' | 'components' | 'templates' | 'layers'
export type RightPanelTab = 'learn' | 'ai' | 'props' | 'inspector'

interface CanvasUiState {
  leftOpen: boolean
  rightOpen: boolean
  leftTab: LeftPanelTab
  rightTab: RightPanelTab
  generateDialogOpen: boolean
  generateDialogSuppressCloseUntil: number
  isGenerating: boolean
  generationProgress: number
  generationStep: string
  generationError: string | null
  cursorFlowPos: { x: number; y: number }
  zoom: number

  setLeftOpen: (open: boolean) => void
  setRightOpen: (open: boolean) => void
  toggleLeft: () => void
  toggleRight: () => void
  setLeftTab: (tab: LeftPanelTab) => void
  setRightTab: (tab: RightPanelTab) => void
  setGenerateDialogOpen: (open: boolean) => void
  openGenerateDialog: () => void
  setGenerating: (generating: boolean, progress?: number, step?: string) => void
  setGenerationError: (error: string | null) => void
  setCursorFlowPos: (pos: { x: number; y: number }) => void
  setZoom: (zoom: number) => void
}

export const useCanvasUiStore = create<CanvasUiState>((set) => ({
  leftOpen: true,
  rightOpen: true,
  leftTab: 'explorer',
  rightTab: 'props',
  generateDialogOpen: false,
  generateDialogSuppressCloseUntil: 0,
  isGenerating: false,
  generationProgress: 0,
  generationStep: '',
  generationError: null,
  cursorFlowPos: { x: 0, y: 0 },
  zoom: 1,

  setLeftOpen: (open) => set({ leftOpen: open }),
  setRightOpen: (open) => set({ rightOpen: open }),
  toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setLeftTab: (tab) => set({ leftTab: tab }),
  setRightTab: (tab) => set({ rightTab: tab }),
  setGenerateDialogOpen: (open) =>
    set((state) => {
      if (!open && Date.now() < state.generateDialogSuppressCloseUntil) {
        return state
      }
      return { generateDialogOpen: open }
    }),
  openGenerateDialog: () => {
    // Ignore Radix dismiss-on-same-click for a short window after opening.
    set({
      generateDialogOpen: true,
      generateDialogSuppressCloseUntil: Date.now() + 400,
    })
  },
  setGenerating: (generating, progress = 0, step = '') =>
    set((state) => ({
      isGenerating: generating,
      generationProgress: progress,
      generationStep: step,
      generationError: generating ? null : state.generationError,
    })),
  setGenerationError: (error) => set({ generationError: error, isGenerating: false }),
  setCursorFlowPos: (pos) => set({ cursorFlowPos: pos }),
  setZoom: (zoom) => set({ zoom }),
}))

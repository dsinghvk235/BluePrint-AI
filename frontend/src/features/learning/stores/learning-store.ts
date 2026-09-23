import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LearningLayerId, LearningModeId, MentorMessage } from '@/learning-engine'

/** Learning state — intentionally separate from canvas state. */
interface LearningState {
  mode: LearningModeId
  expandedLayer: LearningLayerId | null
  selectedNodeId: string | null
  highlightedNodeIds: string[]
  mentorMessages: MentorMessage[]
  mentorLoading: boolean

  setMode: (mode: LearningModeId) => void
  setExpandedLayer: (layer: LearningLayerId | null) => void
  setSelectedNodeId: (nodeId: string | null) => void
  setHighlightedNodeIds: (ids: string[]) => void
  clearHighlights: () => void
  addMentorMessage: (message: MentorMessage) => void
  setMentorLoading: (loading: boolean) => void
  clearMentorChat: () => void
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      mode: 'INTERMEDIATE',
      expandedLayer: 'overview',
      selectedNodeId: null,
      highlightedNodeIds: [],
      mentorMessages: [],
      mentorLoading: false,

      setMode: (mode) => set({ mode }),
      setExpandedLayer: (layer) => set({ expandedLayer: layer }),
      setSelectedNodeId: (nodeId) =>
        set({ selectedNodeId: nodeId, expandedLayer: nodeId ? 'overview' : null }),
      setHighlightedNodeIds: (ids) => set({ highlightedNodeIds: ids }),
      clearHighlights: () => set({ highlightedNodeIds: [] }),
      addMentorMessage: (message) =>
        set((s) => ({ mentorMessages: [...s.mentorMessages, message] })),
      setMentorLoading: (loading) => set({ mentorLoading: loading }),
      clearMentorChat: () => set({ mentorMessages: [] }),
    }),
    {
      name: 'blueprintai-learning',
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
)

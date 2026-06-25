import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { THEME_STORAGE_KEY } from '@/shared/theme'

interface ThemeState {
  theme: 'light'
  setTheme: (theme: 'light') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: () => set({ theme: 'light' }),
    }),
    { name: THEME_STORAGE_KEY },
  ),
)

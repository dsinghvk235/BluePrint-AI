import type { ReactNode } from 'react'

import { useTheme } from '@/shared/hooks/use-theme'

interface ThemeProviderProps {
  children: ReactNode
}

/** Applies theme class to document root on mount. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  useTheme()
  return children
}

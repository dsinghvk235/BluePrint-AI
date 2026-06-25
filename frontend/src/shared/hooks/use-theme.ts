import { useCallback, useEffect, useMemo } from 'react'

import { useThemeStore } from '@/shared/stores/theme-store'
import type { Theme } from '@/shared/types'

function getSystemTheme(): Exclude<Theme, 'system'> {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved: Exclude<Theme, 'system'>) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  const resolvedTheme = useMemo<Exclude<Theme, 'system'>>(() => {
    if (theme === 'system') {
      return getSystemTheme()
    }
    return theme
  }, [theme])

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return { theme, resolvedTheme, setTheme, toggleTheme }
}

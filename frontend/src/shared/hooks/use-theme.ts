import { useEffect } from 'react'

/** Light theme only — Rescale reference design. */
export function useTheme() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
  }, [])

  return {
    theme: 'light' as const,
    resolvedTheme: 'light' as const,
    setTheme: () => undefined,
    toggleTheme: () => undefined,
  }
}

import type { ReactNode } from 'react'

import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'
import { Toaster, TooltipProvider } from '@/shared/ui'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

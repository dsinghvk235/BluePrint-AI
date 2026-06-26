import type { ReactNode } from 'react'

import { AuthInitializer } from './AuthInitializer'
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
          <AuthInitializer>
            {children}
            <Toaster />
          </AuthInitializer>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

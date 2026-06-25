import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

import { AppFooter } from '@/app/components/AppFooter'
import { PageTransition } from '@/shared/ui'

/** Landing layout — hero pages include their own floating nav. */
export function LandingLayout() {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <AppFooter />
    </div>
  )
}

export function AuthLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-background flex min-h-[100dvh] items-center justify-center p-4">
      <PageTransition className="w-full max-w-md">{children ?? <Outlet />}</PageTransition>
    </div>
  )
}

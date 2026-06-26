import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { AppFooter } from '@/app/components/AppFooter'
import { AuthDialog } from '@/features/auth/components/AuthDialog'
import { PageTransition } from '@/shared/ui'
import { useAuthDialogStore } from '@/shared/stores/auth-dialog-store'

/** Landing layout — hero pages include their own floating nav. */
export function LandingLayout() {
  const location = useLocation()
  const openLogin = useAuthDialogStore((s) => s.openLogin)
  const openRegister = useAuthDialogStore((s) => s.openRegister)

  useEffect(() => {
    const state = location.state as { authDialog?: 'login' | 'register' } | null
    if (state?.authDialog === 'login') openLogin()
    if (state?.authDialog === 'register') openRegister()
  }, [location.state, openLogin, openRegister])

  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <AuthDialog />
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

import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useSession } from '@/features/auth/hooks/use-auth'
import { ROUTES } from '@/shared/constants'
import { useAuthStore } from '@/shared/stores/auth-store'
import { Spinner } from '@/shared/ui'

export function ProtectedRoute() {
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const { isLoading, isError } = useSession()

  if (!accessToken) {
    return (
      <Navigate to={ROUTES.HOME} replace state={{ from: location.pathname, authDialog: 'login' }} />
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (isError) {
    return <Navigate to={ROUTES.HOME} replace state={{ authDialog: 'login' }} />
  }

  return <Outlet />
}

export function GuestRoute() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.DASHBOARD

  if (accessToken) {
    return <Navigate to={from} replace />
  }

  return <Outlet />
}

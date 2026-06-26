import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

import { ROUTES } from '@/shared/constants'
import { openAuthLoginDialog, openAuthRegisterDialog } from '@/shared/stores/auth-dialog-store'

/** Redirects legacy auth routes to homepage and opens the auth dialog. */
export function AuthDialogRedirect({ view }: { view: 'login' | 'register' }) {
  useEffect(() => {
    if (view === 'login') openAuthLoginDialog()
    else openAuthRegisterDialog()
  }, [view])

  return <Navigate to={ROUTES.HOME} replace />
}

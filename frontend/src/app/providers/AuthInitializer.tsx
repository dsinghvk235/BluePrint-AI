import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { authApi } from '@/features/auth/api/auth-api'
import { queryKeys } from '@/shared/api/query-keys'
import { setAccessToken, useAuthStore } from '@/shared/stores/auth-store'

/** Restores session on page load via refresh token cookie. */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const queryClient = useQueryClient()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || accessToken) return
    initialized.current = true

    authApi
      .refresh()
      .then(async (tokens) => {
        setAccessToken(tokens.accessToken)
        const user = await authApi.me()
        setSession(tokens.accessToken, user)
        queryClient.setQueryData(queryKeys.auth.session, user)
      })
      .catch(() => {
        clearSession()
      })
  }, [accessToken, setSession, clearSession, queryClient])

  return children
}

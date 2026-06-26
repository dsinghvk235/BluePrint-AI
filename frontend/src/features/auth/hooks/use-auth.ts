import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { authApi, type LoginInput, type RegisterInput } from '@/features/auth/api/auth-api'
import { queryKeys } from '@/shared/api/query-keys'
import { ROUTES } from '@/shared/constants'
import { QUERY_STALE_TIME } from '@/shared/constants'
import { useAuthStore } from '@/shared/stores/auth-store'
import { closeAuthDialog } from '@/shared/stores/auth-dialog-store'
import { toast } from '@/shared/stores/toast-store'
import { ApiClientError } from '@/shared/api/client'

export function useSession() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const storedUser = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: authApi.me,
    enabled: Boolean(accessToken),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    retry: false,
    initialData: storedUser ?? undefined,
  })
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      queryClient.setQueryData(queryKeys.auth.session, data.user)
      closeAuthDialog()
      toast({
        title: 'Welcome back',
        description: `Signed in as ${data.user.fullName}`,
        variant: 'success',
      })
      navigate(ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiClientError ? error.message : 'Unable to sign in. Please try again.'
      toast({ title: 'Sign in failed', description: message, variant: 'error' })
    },
  })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      queryClient.setQueryData(queryKeys.auth.session, data.user)
      closeAuthDialog()
      toast({
        title: 'Account created',
        description: 'Welcome to BlueprintAI!',
        variant: 'success',
      })
      navigate(ROUTES.DASHBOARD)
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiClientError
          ? error.message
          : error.name === 'AbortError'
            ? 'Request timed out. Please try again.'
            : error.message || 'Unable to create account. Please try again.'
      toast({ title: 'Registration failed', description: message, variant: 'error' })
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession()
      queryClient.removeQueries({ queryKey: queryKeys.auth.session })
      queryClient.removeQueries({ queryKey: queryKeys.projects.all })
      navigate(ROUTES.HOME)
    },
  })
}

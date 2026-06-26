import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '@/shared/types'

interface AuthState {
  accessToken: string | null
  user: User | null
  setSession: (accessToken: string, user: User) => void
  setAccessToken: (accessToken: string) => void
  clearSession: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null, user: null }),
      isAuthenticated: () => Boolean(get().accessToken && get().user),
    }),
    {
      name: 'blueprintai-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

/** Read access token outside React — used by API client. */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken
}

export function setAccessToken(token: string): void {
  useAuthStore.getState().setAccessToken(token)
}

export function clearAuthSession(): void {
  useAuthStore.getState().clearSession()
}

import { api } from '@/shared/api/client'
import type { AuthTokens, TokenRefresh, User } from '@/shared/types'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  fullName: string
  email: string
  password: string
}

export const authApi = {
  login: (input: LoginInput) => api.post<AuthTokens>('/auth/login', input, { skipAuth: true }),

  register: (input: RegisterInput) =>
    api.post<AuthTokens>('/auth/register', input, { skipAuth: true }),

  refresh: () => api.post<TokenRefresh>('/auth/refresh', undefined, { skipAuth: true }),

  logout: () => api.post<void>('/auth/logout'),

  me: () => api.get<User>('/auth/me'),
}

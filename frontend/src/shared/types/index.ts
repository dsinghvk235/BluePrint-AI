/** Shared TypeScript types used across features. */

export type ApiStatus = 'success' | 'error'

export interface ApiResponse<T> {
  status: ApiStatus
  data: T
  message?: string
  timestamp: string
}

export interface ApiErrorResponse {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type Theme = 'light' | 'dark' | 'system'

export interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

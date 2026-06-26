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

export type UserRole = 'USER' | 'ADMIN'
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'

export interface User {
  id: string
  email: string
  fullName: string
  profileImageUrl?: string | null
  role: UserRole
  accountStatus: AccountStatus
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string | null
}

export interface AuthTokens {
  accessToken: string
  tokenType: string
  expiresInMs: number
  user: User
}

export interface TokenRefresh {
  accessToken: string
  tokenType: string
  expiresInMs: number
}

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export interface Project {
  id: string
  ownerId: string
  name: string
  description?: string | null
  systemType?: string | null
  prompt?: string | null
  currentVersion: number
  status: ProjectStatus
  theme?: string | null
  createdAt: string
  updatedAt: string
  lastOpened?: string | null
  tags: string[]
  favorite: boolean
  archived: boolean
}

export interface CreateProjectInput {
  name: string
  description?: string
  systemType?: string
  prompt?: string
  theme?: string
  tags?: string[]
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  systemType?: string
  prompt?: string
  status?: ProjectStatus
  theme?: string
  tags?: string[]
  favorite?: boolean
}

export interface ProjectListParams {
  search?: string
  status?: ProjectStatus
  favorite?: boolean
  archived?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastOpened'
  sortDirection?: 'asc' | 'desc'
  page?: number
  size?: number
}

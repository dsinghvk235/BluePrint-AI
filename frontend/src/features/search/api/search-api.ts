import { api } from '@/shared/api/client'
import { API_BASE_URL } from '@/shared/constants'
import { getAccessToken } from '@/shared/stores/auth-store'

export type SearchCategory =
  | 'PROJECT'
  | 'RECENT_PROJECT'
  | 'COMPONENT'
  | 'KNOWLEDGE'
  | 'TEMPLATE'
  | 'ACTION'

export interface SearchResultItem {
  id: string
  category: SearchCategory
  title: string
  subtitle?: string | null
  description?: string | null
  route: string
  score: number
  highlights: string[]
  metadata?: Record<string, string>
}

export interface UnifiedSearchResponse {
  query: string
  results: SearchResultItem[]
  totalCount: number
  page: number
  size: number
  tookMs: number
}

export interface SearchHistoryItem {
  id: string
  query: string
  resultCount: number
  searchedAt: string
}

export const searchApi = {
  search: (q: string, page = 0, size = 20) =>
    api.get<UnifiedSearchResponse>('/search', { params: { q, page, size } }),

  history: (limit = 10) => api.get<SearchHistoryItem[]>('/search/history', { params: { limit } }),

  clearHistory: () => api.delete<void>('/search/history'),
}

function resolveExportUrl(projectId: string, format: string): string {
  const path = `/projects/${projectId}/export?format=${format}`
  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  }
  const base = API_BASE_URL.startsWith('/') ? API_BASE_URL : `/${API_BASE_URL}`
  return `${window.location.origin}${base.replace(/\/$/, '')}${path}`
}

export type ExportFormat = 'JSON' | 'MARKDOWN' | 'SVG' | 'PDF' | 'PNG'

export async function downloadProjectExport(
  projectId: string,
  format: ExportFormat,
): Promise<void> {
  const token = getAccessToken()
  const response = await fetch(resolveExportUrl(projectId, format), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`)
  }
  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition')
  const fileName =
    disposition?.match(/filename="(.+)"/)?.[1] ?? `export-${projectId}.${format.toLowerCase()}`
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

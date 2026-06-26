import { API_BASE_URL, API_TIMEOUT_MS, HTTP_STATUS } from '@/shared/constants'
import { clearAuthSession, getAccessToken, setAccessToken } from '@/shared/stores/auth-store'
import type { ApiErrorResponse, ApiResponse } from '@/shared/types'

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorResponse,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
}

let refreshPromise: Promise<string | null> | null = null

function resolveApiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${normalizedPath}`
  }

  const base = API_BASE_URL.startsWith('/') ? API_BASE_URL : `/${API_BASE_URL}`
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${base.replace(/\/$/, '')}${normalizedPath}`
  }

  return `${base.replace(/\/$/, '')}${normalizedPath}`
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(resolveApiUrl(path))

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  if (!response.ok) {
    const errorBody = isJson ? ((await response.json()) as ApiErrorResponse) : undefined
    throw new ApiClientError(
      errorBody?.message ?? response.statusText ?? 'Request failed',
      response.status,
      errorBody,
    )
  }

  if (response.status === 204 || !isJson) {
    return undefined as T
  }

  const payload = (await response.json()) as ApiResponse<T> | T
  return 'data' in (payload as ApiResponse<T>) ? (payload as ApiResponse<T>).data : (payload as T)
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(resolveApiUrl('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          clearAuthSession()
          return null
        }

        const payload = (await response.json()) as ApiResponse<{
          accessToken: string
        }>
        const token = payload.data.accessToken
        setAccessToken(token)
        return token
      } catch {
        clearAuthSession()
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

/**
 * Central HTTP client for all API communication.
 * Injects JWT access tokens and automatically refreshes on 401.
 */
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, skipAuth = false, ...rest } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  const makeRequest = async (token: string | null) => {
    const authHeaders: Record<string, string> = {}
    if (!skipAuth && token) {
      authHeaders.Authorization = `Bearer ${token}`
    }

    return fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: 'include',
    })
  }

  try {
    const token = skipAuth ? null : getAccessToken()
    let response = await makeRequest(token)

    if (response.status === HTTP_STATUS.UNAUTHORIZED && !skipAuth) {
      const newToken = await refreshAccessToken()
      if (newToken) {
        response = await makeRequest(newToken)
      }
    }

    return parseResponse<T>(response)
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(path, { ...options, method: 'DELETE' }),
}

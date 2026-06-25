/** Application-wide constants — no magic strings in features. */

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'BlueprintAI'
export const APP_TAGLINE = 'The AI workspace for understanding how systems work.'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
export const API_TIMEOUT_MS = 30_000

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  CANVAS: '/canvas',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  NOT_FOUND: '*',
} as const

export const QUERY_STALE_TIME = {
  SHORT: 30_000,
  MEDIUM: 5 * 60_000,
  LONG: 30 * 60_000,
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
} as const

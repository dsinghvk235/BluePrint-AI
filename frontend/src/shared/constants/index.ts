/** Application-wide constants — no magic strings in features. */

export const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'BlueprintAI'
export const APP_TAGLINE = 'The AI workspace for understanding how systems work.'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
export const API_TIMEOUT_MS = 30_000

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace',
  WORKSPACE_PROJECT: '/workspace/:projectId',
  PROJECTS: '/projects',
  CANVAS: '/canvas',
  SEARCH: '/search',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  NOT_FOUND: '*',
} as const

export const EXAMPLE_PROMPTS = [
  'Design Netflix',
  'Design Uber',
  'Design Instagram',
  'Design Smart Hospital',
  'Design Mars Colony',
] as const

export const LEARNING_LAYERS = [
  { id: 'architecture', label: 'Architecture', description: 'System overview and boundaries' },
  { id: 'component', label: 'Component', description: 'Individual service or module' },
  { id: 'why', label: 'Why', description: 'Rationale behind the design choice' },
  { id: 'principle', label: 'Engineering Principle', description: 'Underlying patterns and laws' },
  { id: 'tradeoffs', label: 'Trade-offs', description: 'Costs and benefits of this approach' },
  { id: 'alternatives', label: 'Alternatives', description: 'Other viable design options' },
  { id: 'interview', label: 'Interview Questions', description: 'Practice questions for mastery' },
] as const

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

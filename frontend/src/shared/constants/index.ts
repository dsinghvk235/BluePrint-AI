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
  { id: 'overview', label: 'Overview', description: 'What is this component?' },
  { id: 'purpose', label: 'Purpose', description: 'Why is it used in the system?' },
  { id: 'reasoning', label: 'Reasoning', description: 'Why was it selected here?' },
  { id: 'principle', label: 'Engineering Principle', description: 'Patterns and laws applied' },
  { id: 'tradeoffs', label: 'Trade-offs', description: 'Costs and benefits' },
  { id: 'alternatives', label: 'Alternatives', description: 'Other viable options' },
  { id: 'best-practices', label: 'Best Practices', description: 'Production lessons and pitfalls' },
  { id: 'interview', label: 'Interview Questions', description: 'Practice for mastery' },
  { id: 'advanced', label: 'Advanced Discussion', description: 'Deep engineering analysis' },
] as const

export const LEARNING_MODES = [
  { id: 'BEGINNER', label: 'Beginner' },
  { id: 'INTERMEDIATE', label: 'Intermediate' },
  { id: 'SDE_1', label: 'SDE-1' },
  { id: 'SENIOR_ENGINEER', label: 'Senior Engineer' },
  { id: 'STAFF_ENGINEER', label: 'Staff Engineer' },
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

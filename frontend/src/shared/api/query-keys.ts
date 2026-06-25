/** Centralized TanStack Query keys for cache invalidation. */

export const queryKeys = {
  health: ['health'] as const,
  auth: {
    session: ['auth', 'session'] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  diagrams: {
    all: ['diagrams'] as const,
    detail: (id: string) => ['diagrams', id] as const,
  },
  search: (query: string) => ['search', query] as const,
} as const

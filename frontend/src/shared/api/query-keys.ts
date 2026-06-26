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
  learning: {
    component: (projectId: string, nodeId: string, mode: string) =>
      ['learning', 'component', projectId, nodeId, mode] as const,
    decisions: (projectId: string, nodeId?: string) =>
      ['learning', 'decisions', projectId, nodeId ?? 'all'] as const,
    dependencies: (projectId: string, nodeId: string) =>
      ['learning', 'dependencies', projectId, nodeId] as const,
  },
  search: (query: string) => ['search', query] as const,
} as const

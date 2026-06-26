import { api } from '@/shared/api/client'
import type {
  CreateProjectInput,
  PaginatedResponse,
  Project,
  ProjectListParams,
  UpdateProjectInput,
} from '@/shared/types'

export const projectsApi = {
  list: (params: ProjectListParams = {}) =>
    api.get<PaginatedResponse<Project>>('/projects', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  recent: (limit = 5) => api.get<Project[]>('/projects/recent', { params: { limit } }),

  get: (id: string) => api.get<Project>(`/projects/${id}`),

  create: (input: CreateProjectInput) => api.post<Project>('/projects', input),

  update: (id: string, input: UpdateProjectInput) => api.put<Project>(`/projects/${id}`, input),

  rename: (id: string, name: string) => api.patch<Project>(`/projects/${id}/rename`, { name }),

  archive: (id: string) => api.patch<Project>(`/projects/${id}/archive`),

  duplicate: (id: string) => api.post<Project>(`/projects/${id}/duplicate`),

  delete: (id: string) => api.delete<void>(`/projects/${id}`),

  open: (id: string) => api.post<Project>(`/projects/${id}/open`),
}

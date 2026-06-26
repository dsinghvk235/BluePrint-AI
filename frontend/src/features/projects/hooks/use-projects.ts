import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { projectsApi } from '@/features/projects/api/projects-api'
import { queryKeys } from '@/shared/api/query-keys'
import { QUERY_STALE_TIME } from '@/shared/constants'
import type { CreateProjectInput, ProjectListParams, UpdateProjectInput } from '@/shared/types'
import { toast } from '@/shared/stores/toast-store'
import { ApiClientError } from '@/shared/api/client'

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: [...queryKeys.projects.all, params],
    queryFn: () => projectsApi.list(params),
    staleTime: QUERY_STALE_TIME.SHORT,
    placeholderData: (prev) => prev,
  })
}

export function useRecentProjects(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.projects.all, 'recent', limit],
    queryFn: () => projectsApi.recent(limit),
    staleTime: QUERY_STALE_TIME.SHORT,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Project created', variant: 'success' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create project',
        description: error instanceof ApiClientError ? error.message : undefined,
        variant: 'error',
      })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsApi.update(id, input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
    },
  })
}

export function useRenameProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => projectsApi.rename(id, name),
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all })
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.projects.all })
      queryClient.setQueriesData<{ items: { id: string; name: string }[] }>(
        { queryKey: queryKeys.projects.all },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((p) => (p.id === id ? { ...p, name } : p)),
              }
            : old,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast({ title: 'Failed to rename project', variant: 'error' })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    onSuccess: () => toast({ title: 'Project renamed', variant: 'success' }),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all })
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.projects.all })
      queryClient.setQueriesData<{ items: { id: string }[] }>(
        { queryKey: queryKeys.projects.all },
        (old) => (old ? { ...old, items: old.items.filter((p) => p.id !== id) } : old),
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast({ title: 'Failed to delete project', variant: 'error' })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    onSuccess: () => toast({ title: 'Project deleted', variant: 'success' }),
  })
}

export function useDuplicateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Project duplicated', variant: 'success' })
    },
  })
}

export function useArchiveProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast({ title: 'Project archived', variant: 'success' })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      projectsApi.update(id, { favorite }),
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all })
      const previous = queryClient.getQueriesData({ queryKey: queryKeys.projects.all })
      queryClient.setQueriesData<{ items: { id: string; favorite: boolean }[] }>(
        { queryKey: queryKeys.projects.all },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((p) => (p.id === id ? { ...p, favorite } : p)),
              }
            : old,
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  })
}

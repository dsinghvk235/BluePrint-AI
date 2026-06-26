import { motion } from 'framer-motion'
import { LayoutTemplate, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { CreateProjectDialog } from '@/features/projects/components/CreateProjectDialog'
import { DeleteProjectDialog } from '@/features/projects/components/DeleteProjectDialog'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { RenameProjectDialog } from '@/features/projects/components/RenameProjectDialog'
import { useDeleteProject, useProjects } from '@/features/projects/hooks/use-projects'
import { useDebounce } from '@/shared/hooks'
import type { Project, ProjectStatus } from '@/shared/types'
import { Button, EmptyState, ErrorState, Input, Skeleton } from '@/shared/ui'

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'lastOpened', label: 'Last opened' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created' },
] as const

export function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]['value']>('updatedAt')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>()
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const deleteProject = useDeleteProject()

  const { data, isLoading, isError, refetch } = useProjects({
    search: debouncedSearch || undefined,
    status: statusFilter,
    favorite: favoritesOnly || undefined,
    archived: false,
    sortBy,
    sortDirection: 'desc',
    page,
    size: 12,
  })

  const projects = data?.items ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your architecture designs and templates.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search projects…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              aria-label="Search projects"
            />
          </div>
          <select
            className="border-border bg-background h-10 rounded-[var(--radius-pill)] border px-3 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort projects"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="border-border bg-background h-10 rounded-[var(--radius-pill)] border px-3 text-sm"
            value={statusFilter ?? ''}
            onChange={(e) =>
              setStatusFilter((e.target.value || undefined) as ProjectStatus | undefined)
            }
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button
            variant={favoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            Favorites
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            className="mt-12"
            title="Failed to load projects"
            description="Something went wrong. Please try again."
            onRetry={() => refetch()}
          />
        ) : projects.length > 0 ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProjectCard
                    project={project}
                    onRename={setRenameTarget}
                    onDelete={setDeleteTarget}
                  />
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            className="mt-12"
            icon={LayoutTemplate}
            title={debouncedSearch ? 'No matching projects' : 'No projects yet'}
            description={
              debouncedSearch
                ? 'Try a different search term or clear filters.'
                : 'Create your first architecture to get started.'
            }
            action={<Button onClick={() => setCreateOpen(true)}>Create project</Button>}
          />
        )}
      </motion.div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RenameProjectDialog
        projectId={renameTarget?.id ?? null}
        currentName={renameTarget?.name ?? ''}
        open={Boolean(renameTarget)}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      />
      <DeleteProjectDialog
        projectName={deleteTarget?.name ?? ''}
        open={Boolean(deleteTarget)}
        isDeleting={deleteProject.isPending}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteProject.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }}
      />
    </div>
  )
}

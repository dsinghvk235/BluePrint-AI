import { Archive, Copy, MoreHorizontal, Pencil, Sparkles, Star, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import {
  useArchiveProject,
  useDuplicateProject,
  useToggleFavorite,
} from '@/features/projects/hooks/use-projects'
import { ROUTES } from '@/shared/constants'
import type { Project } from '@/shared/types'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui'
import { formatRelativeTime } from '@/shared/utils/format-relative-time'

interface ProjectCardProps {
  project: Project
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}

function formatRelative(date: string | null | undefined): string {
  return formatRelativeTime(date)
}

export function ProjectCard({ project, onRename, onDelete }: ProjectCardProps) {
  const toggleFavorite = useToggleFavorite()
  const duplicateProject = useDuplicateProject()
  const archiveProject = useArchiveProject()

  const workspacePath = ROUTES.WORKSPACE_PROJECT.replace(':projectId', project.id)

  return (
    <Card className="group relative h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevation-2)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Link to={workspacePath} className="flex min-w-0 flex-1 items-start gap-3">
            <div className="bg-primary-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
              <Sparkles className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{project.name}</CardTitle>
              <CardDescription className="text-xs">
                Updated {formatRelative(project.updatedAt)}
              </CardDescription>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={project.favorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => toggleFavorite.mutate({ id: project.id, favorite: !project.favorite })}
            >
              <Star
                className={`h-4 w-4 ${project.favorite ? 'fill-[var(--color-brand)] text-[var(--color-brand)]' : ''}`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Project actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRename(project)}>
                  <Pencil className="h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateProject.mutate(project.id)}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => archiveProject.mutate(project.id)}>
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {project.systemType && (
            <Badge variant="secondary" className="text-[10px]">
              {project.systemType}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            {project.status}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateProject } from '@/features/projects/hooks/use-projects'
import { EXAMPLE_PROMPTS } from '@/shared/constants'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
  Textarea,
} from '@/shared/ui'

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(2000).optional(),
  systemType: z.string().max(100).optional(),
  prompt: z.string().max(5000).optional(),
})

type CreateProjectForm = z.infer<typeof schema>

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const createProject = useCreateProject()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', systemType: '', prompt: '' },
  })

  const onSubmit = (data: CreateProjectForm) => {
    createProject.mutate(data, {
      onSuccess: () => {
        reset()
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            Start a new architecture design. You can refine it in the workspace later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" placeholder="Netflix Architecture" {...register('name')} />
            {errors.name && <p className="text-error text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="system-type">System type</Label>
            <Input
              id="system-type"
              placeholder="Streaming, E-commerce, …"
              {...register('systemType')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Design prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the system you want to design…"
              rows={3}
              {...register('prompt')}
            />
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="bg-secondary text-muted-foreground hover:bg-accent rounded-full px-2.5 py-0.5 text-[10px] transition-colors"
                  onClick={() => {
                    setValue('prompt', prompt)
                    setValue('name', prompt)
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? <Spinner className="h-4 w-4" /> : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

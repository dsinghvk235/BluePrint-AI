import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useRenameProject } from '@/features/projects/hooks/use-projects'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
} from '@/shared/ui'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
})

type RenameForm = z.infer<typeof schema>

interface RenameProjectDialogProps {
  projectId: string | null
  currentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RenameProjectDialog({
  projectId,
  currentName,
  open,
  onOpenChange,
}: RenameProjectDialogProps) {
  const renameProject = useRenameProject()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenameForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
  })

  useEffect(() => {
    if (open) reset({ name: currentName })
  }, [open, currentName, reset])

  const onSubmit = (data: RenameForm) => {
    if (!projectId) return
    renameProject.mutate(
      { id: projectId, name: data.name },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename">Project name</Label>
            <Input id="rename" {...register('name')} />
            {errors.name && <p className="text-error text-xs">{errors.name.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={renameProject.isPending}>
              {renameProject.isPending ? <Spinner className="h-4 w-4" /> : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

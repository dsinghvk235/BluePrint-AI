import { MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

import { reviewApi, type FeedbackTargetType } from '@/features/review/api/review-api'
import { toast } from '@/shared/stores/toast-store'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from '@/shared/ui'

interface FeedbackWidgetProps {
  targetType: FeedbackTargetType
  targetId: string
  projectId?: string
  compact?: boolean
}

export function FeedbackWidget({ targetType, targetId, projectId, compact }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(helpful?: boolean) {
    setSubmitting(true)
    try {
      await reviewApi.submit({
        targetType,
        targetId,
        projectId,
        rating: rating || undefined,
        helpful,
        comment: comment || undefined,
      })
      toast({ title: 'Thanks for your feedback', variant: 'success' })
      setOpen(false)
      setComment('')
      setRating(0)
    } catch {
      toast({ title: 'Could not submit feedback', variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size={compact ? 'icon' : 'sm'} className="h-8 gap-1.5 text-xs">
          <MessageSquare className="h-3.5 w-3.5" />
          {!compact && 'Feedback'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>How was this?</DialogTitle>
          <DialogDescription>Your feedback helps improve BlueprintAI.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} stars`}
                className={`text-lg ${star <= rating ? 'text-[var(--color-brand)]' : 'text-muted-foreground'}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={submitting}
              onClick={() => submit(true)}
            >
              <ThumbsUp className="mr-1 h-3.5 w-3.5" />
              Helpful
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={submitting}
              onClick={() => submit(false)}
            >
              <ThumbsDown className="mr-1 h-3.5 w-3.5" />
              Not helpful
            </Button>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment or suggestion…"
            rows={3}
            className="text-xs"
          />
          <Button size="sm" className="w-full" disabled={submitting} onClick={() => submit()}>
            Submit feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { Loader2, Send, Sparkles } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

import { learningApi } from '@/features/learning/api/learning-api'
import { useLearningStore } from '@/features/learning/stores/learning-store'
import type { MentorMessage } from '@/learning-engine'
import { Button, Textarea } from '@/shared/ui'
import { cn } from '@/shared/utils'

const SUGGESTED_PROMPTS = [
  'Why was this chosen?',
  'What are the trade-offs?',
  'Suggest improvements',
  'Explain like a beginner',
  'Find bottlenecks',
] as const

interface MentorChatPanelProps {
  projectId: string
  nodeId: string | null
  nodeLabel?: string
}

export function MentorChatPanel({ projectId, nodeId, nodeLabel }: MentorChatPanelProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const mode = useLearningStore((s) => s.mode)
  const messages = useLearningStore((s) => s.mentorMessages)
  const loading = useLearningStore((s) => s.mentorLoading)
  const addMessage = useLearningStore((s) => s.addMentorMessage)
  const setLoading = useLearningStore((s) => s.setMentorLoading)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return

      const userMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      }
      addMessage(userMsg)
      setInput('')
      setLoading(true)

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }))

        const response = await learningApi.mentorChat(projectId, {
          nodeId: nodeId ?? undefined,
          mode,
          message: text.trim(),
          history,
          useCache: false,
        })

        addMessage({
          id: response.messageId,
          role: 'mentor',
          content: response.response,
          timestamp: Date.now(),
        })
      } catch {
        addMessage({
          id: crypto.randomUUID(),
          role: 'mentor',
          content:
            'I could not reach the mentor service. Explore the learning layers for structured explanations.',
          timestamp: Date.now(),
        })
      } finally {
        setLoading(false)
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }
    },
    [loading, messages, addMessage, setLoading, projectId, nodeId, mode],
  )

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="text-primary h-4 w-4" />
        <p className="text-sm font-medium">AI Engineering Mentor</p>
      </div>
      <p className="text-muted-foreground mb-3 text-xs">
        {nodeLabel
          ? `Ask about ${nodeLabel} in context of your architecture.`
          : 'Select a component for contextual guidance.'}
      </p>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="bg-muted hover:bg-accent rounded-md px-2 py-1 text-[10px] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'rounded-lg px-3 py-2 text-xs leading-relaxed',
              msg.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-muted/60 mr-4',
            )}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder="Why Redis? Compare alternatives..."
          rows={2}
          className="min-h-0 flex-1 resize-none text-xs"
        />
        <Button
          size="sm"
          className="h-auto shrink-0"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

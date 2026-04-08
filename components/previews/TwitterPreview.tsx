'use client'

import { cn } from '@/lib/utils'

interface TwitterPreviewProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
  imageUrl?: string
}

const TWITTER_MAX_CHARS = 280

export function TwitterPreview({ content, onChange, editable, imageUrl }: TwitterPreviewProps) {
  const charCount = content.length
  const percentage = (charCount / TWITTER_MAX_CHARS) * 100
  const isOverLimit = charCount > TWITTER_MAX_CHARS
  const isNearLimit = percentage >= 80 && percentage < 100

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">Twitter Preview</span>
        <span
          className={cn(
            'text-xs',
            isOverLimit && 'text-destructive font-medium',
            isNearLimit && !isOverLimit && 'text-yellow-600 dark:text-yellow-400'
          )}
        >
          {charCount}/{TWITTER_MAX_CHARS}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <p className="font-medium text-sm">John Doe</p>
              <span className="text-xs text-muted-foreground">@johndoe</span>
            </div>
          </div>
        </div>
        {editable ? (
          <textarea
            value={content}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'mt-3 w-full min-h-[80px] rounded-md border bg-surface-raised px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isOverLimit ? 'border-destructive' : 'border-input'
            )}
            maxLength={TWITTER_MAX_CHARS + 50}
            aria-label="Edit Twitter content"
          />
        ) : (
          <p className="mt-3 text-sm whitespace-pre-wrap">{content}</p>
        )}
        {imageUrl && (
          <div className="mt-3">
            <img
              src={imageUrl}
              alt="Post attachment"
              className="w-full max-h-[280px] object-cover rounded-xl"
            />
          </div>
        )}
        {isOverLimit && (
          <p className="mt-2 text-xs text-destructive">
            Content exceeds Twitter's {TWITTER_MAX_CHARS} character limit
          </p>
        )}
      </div>
    </div>
  )
}
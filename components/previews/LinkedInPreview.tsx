'use client'

import { cn } from '@/lib/utils'

interface LinkedInPreviewProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
  imageUrl?: string
}

const LINKEDIN_MAX_CHARS = 3000

export function LinkedInPreview({ content, onChange, editable, imageUrl }: LinkedInPreviewProps) {
  const charCount = content.length
  const percentage = (charCount / LINKEDIN_MAX_CHARS) * 100
  const isOverLimit = charCount > LINKEDIN_MAX_CHARS
  const isNearLimit = percentage >= 80 &&percentage < 100

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/50 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium">LinkedIn Preview</span>
        <span
          className={cn(
            'text-xs',
            isOverLimit && 'text-destructive font-medium',
            isNearLimit && !isOverLimit && 'text-yellow-600 dark:text-yellow-400'
          )}
        >
          {charCount}/{LINKEDIN_MAX_CHARS}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">John Doe</p>
            <p className="text-xs text-muted-foreground">
              Founder at Levercast • 1st
            </p>
          </div>
        </div>
        {editable ? (
          <textarea
            value={content}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'mt-3 w-full min-h-[100px] rounded-md border bg-surface-raised px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isOverLimit ? 'border-destructive' : 'border-input'
            )}
            aria-label="Edit LinkedIn content"
          />
        ) : (
          <p className="mt-3 text-sm whitespace-pre-wrap">{content}</p>
        )}
        {imageUrl && (
          <div className="mt-3">
            <img
              src={imageUrl}
              alt="Post attachment"
              className="w-full max-h-[300px] object-cover rounded-md"
            />
          </div>
        )}
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>🔄 Share</span>
        </div>
        {isOverLimit && (
          <p className="mt-2 text-xs text-destructive">
            Content exceeds LinkedIn's {LINKEDIN_MAX_CHARS} character limit
          </p>
        )}
      </div>
    </div>
  )
}
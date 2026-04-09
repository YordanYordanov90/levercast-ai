'use client'

import { cn, initialsFromDisplayName } from '@/lib/utils'
import Image from 'next/image'

interface TwitterPreviewProps {
  content: string
  onChange?: (content: string) => void
  editable?: boolean
  imageUrl?: string
  authorName: string
  /** Without @ prefix, e.g. "janedoe". */
  authorHandle?: string
  authorAvatarUrl?: string
}

const TWITTER_MAX_CHARS = 280

export function TwitterPreview({
  content,
  onChange,
  editable,
  imageUrl,
  authorName,
  authorHandle,
  authorAvatarUrl,
}: TwitterPreviewProps) {
  const charCount = content.length
  const percentage = (charCount / TWITTER_MAX_CHARS) * 100
  const isOverLimit = charCount > TWITTER_MAX_CHARS
  const isNearLimit = percentage >= 80 && percentage < 100
  const initials = initialsFromDisplayName(authorName)
  const handleHref = authorHandle ? authorHandle.replace(/^@/, '') : ''

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
          {authorAvatarUrl ? (
            <Image
              src={authorAvatarUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="size-10 rounded-full bg-sidebar-primary flex items-center justify-center text-white font-medium shrink-0 text-sm">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <p className="font-medium text-sm">{authorName}</p>
              {handleHref ? (
                <span className="text-xs text-muted-foreground">@{handleHref}</span>
              ) : null}
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
          <div className="mt-3 relative h-[280px] w-full overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt="Post attachment"
              fill
              sizes="(min-width: 768px) 600px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        {isOverLimit && (
          <p className="mt-2 text-xs text-destructive">
            Content exceeds Twitter&apos;s {TWITTER_MAX_CHARS} character limit
          </p>
        )}
      </div>
    </div>
  )
}

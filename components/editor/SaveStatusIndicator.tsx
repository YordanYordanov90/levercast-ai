'use client'

import { Check, Loader2, AlertCircle } from 'lucide-react'

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {status === 'idle' && (
        <span className="text-muted-foreground">Start typing to create your post</span>
      )}
      {status === 'unsaved' && (
        <span className="text-muted-foreground flex items-center gap-1">
          <AlertCircle className="size-3" />
          Unsaved changes
        </span>
      )}
      {status === 'saving' && (
        <span className="text-muted-foreground flex items-center gap-1">
          <Loader2 className="size-3 animate-spin" />
          Saving...
        </span>
      )}
      {status === 'saved' && (
        <span className="text-primary flex items-center gap-1">
          <Check className="size-3" />
          Saved{lastSaved && ` at ${lastSaved.toLocaleTimeString()}`}
        </span>
      )}
      {status === 'error' && (
        <span className="text-destructive flex items-center gap-1">
          <AlertCircle className="size-3" />
          Failed to save
        </span>
      )}
    </div>
  )
}
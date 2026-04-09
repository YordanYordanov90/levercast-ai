'use client'

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  actionLabel?: string
}

export function ErrorDisplay({
  title,
  message,
  onRetry,
  actionLabel = 'Try again',
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-6">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{title ?? 'Something went wrong'}</h2>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
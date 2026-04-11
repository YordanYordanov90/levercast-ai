'use client'

import { useEffect } from 'react'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function TemplatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[TemplatesError]', error)
  }, [error])

  return (
    <ErrorDisplay
      title="Failed to load templates"
      message="Could not load your templates. Please try again."
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
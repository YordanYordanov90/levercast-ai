'use client'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function TemplatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load templates"
      message={error.message || 'Could not load your templates. Please try again.'}
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
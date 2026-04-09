'use client'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load posts"
      message={error.message || 'Could not load your posts. Please try again.'}
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
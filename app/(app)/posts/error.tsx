'use client'

import { useEffect } from 'react'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PostsError]', error)
  }, [error])

  return (
    <ErrorDisplay
      title="Failed to load posts"
      message="Could not load your posts. Please try again."
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
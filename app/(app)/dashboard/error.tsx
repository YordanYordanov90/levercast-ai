'use client'

import { useEffect } from 'react'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[DashboardError]', error)
  }, [error])

  return (
    <ErrorDisplay
      title="Failed to load dashboard"
      message="Could not load your dashboard. Please try again."
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
'use client'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load dashboard"
      message={error.message || 'Could not load your dashboard. Please try again.'}
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
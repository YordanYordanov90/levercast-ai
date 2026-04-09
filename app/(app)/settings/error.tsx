'use client'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Failed to load settings"
      message={error.message || 'Could not load settings. Please try again.'}
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
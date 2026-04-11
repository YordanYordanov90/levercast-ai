'use client'

import { useEffect } from 'react'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[SettingsError]', error)
  }, [error])

  return (
    <ErrorDisplay
      title="Failed to load settings"
      message="Could not load settings. Please try again."
      onRetry={reset}
      actionLabel="Retry"
    />
  )
}
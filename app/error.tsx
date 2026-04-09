'use client'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorDisplay message={error.message || 'An unexpected error occurred.'} onRetry={reset} />
}
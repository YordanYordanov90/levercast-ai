'use client'

import { useEffect } from 'react'
import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[RootError]', error)
  }, [error])

  return <ErrorDisplay message="An unexpected error occurred." onRetry={reset} />
}
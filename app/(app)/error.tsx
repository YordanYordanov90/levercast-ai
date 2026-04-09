'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  const isAuthError =
    error.message?.includes('Unauthorized') ||
    error.message?.includes('Forbidden') ||
    error.message?.includes('clerk') ||
    error.message?.toLowerCase().includes('auth')

  useEffect(() => {
    if (isAuthError) router.push('/sign-in')
  }, [isAuthError, router])

  if (isAuthError) return null

  return (
    <ErrorDisplay
      message={error.message || 'An unexpected error occurred.'}
      onRetry={reset}
    />
  )
}
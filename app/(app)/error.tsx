'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

const AUTH_ERROR_CODES = [
  401,
  403,
]

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[AppError]', error)
  }, [error])

  const statusCode = (error as unknown as { statusCode?: number })?.statusCode
  const isAuthError = AUTH_ERROR_CODES.includes(statusCode ?? 0) || (error as unknown as { status?: number })?.status === 401

  useEffect(() => {
    if (isAuthError) router.push('/sign-in')
  }, [isAuthError, router])

  if (isAuthError) return null

  return (
    <ErrorDisplay
      message="An unexpected error occurred."
      onRetry={reset}
    />
  )
}
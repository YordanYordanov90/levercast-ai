'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function EditPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[EditPostError]', error)
  }, [error])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ErrorDisplay
        title="Failed to load editor"
        message="Could not load the editor. Please try again."
        onRetry={reset}
        actionLabel="Try again"
      />
      <div className="mt-4">
        <Link href="/posts" className="text-sm text-muted-foreground hover:text-foreground underline">
          Back to posts
        </Link>
      </div>
    </div>
  )
}
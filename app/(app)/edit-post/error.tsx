'use client'

import Link from 'next/link'

import { ErrorDisplay } from '@/components/error/ErrorDisplay'

export default function EditPostError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ErrorDisplay
        title="Failed to load editor"
        message={error.message || 'Could not load the editor. Please try again.'}
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
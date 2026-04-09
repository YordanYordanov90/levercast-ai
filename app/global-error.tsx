'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="text-3xl font-black text-destructive">!</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            A critical error occurred. Your data is safe. Try refreshing the page.
          </p>

          <div className="mt-6">
            <Button type="button" variant="outline" onClick={reset}>
              Refresh page
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
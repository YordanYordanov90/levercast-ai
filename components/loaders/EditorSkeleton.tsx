import { Skeleton } from '@/components/ui/skeleton'

export function EditorSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-3 w-48" />
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="h-10 w-full max-w-md rounded-md" />
            <Skeleton className="h-3 w-56 mt-2" />
            <Skeleton className="h-10 w-40 mt-4 rounded-md" />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-16 mb-3" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>

      <div>
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
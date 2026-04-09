import { Skeleton } from '@/components/ui/skeleton'

export function TemplatesSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Skeleton className="h-9 w-64 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-4/5 mb-4" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
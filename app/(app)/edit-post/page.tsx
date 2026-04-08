import { Suspense } from 'react'

import { EditPostClient } from './EditPostClient'

export default function EditPostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground text-sm">Loading editor…</div>}>
      <EditPostClient />
    </Suspense>
  )
}

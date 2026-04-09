'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function TwitterIntegrationPlaceholder() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded bg-black flex items-center justify-center text-white font-bold text-sm">
          X
        </div>
        <div>
          <p className="font-medium">Twitter / X</p>
          <p className="text-sm text-muted-foreground">Not connected</p>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        onClick={() => toast.info('Twitter / X connection is not available yet')}
      >
        Connect
      </Button>
    </div>
  )
}

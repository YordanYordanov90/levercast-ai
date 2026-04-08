'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppTopbarProps {
  onOpenNav: () => void
  title?: string
}

export function AppTopbar({ onOpenNav, title }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenNav}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{title ?? 'Levercast'}</p>
        </div>
      </div>
    </header>
  )
}


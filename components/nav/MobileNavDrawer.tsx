'use client'

import { useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavList } from '@/components/nav/NavItem'
import { ProfileDropdown } from '@/components/nav/ProfileDropdown'

interface MobileNavDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close navigation"
        onClick={() => onOpenChange(false)}
      />

      <div className="absolute inset-y-0 left-0 w-[min(20rem,85vw)] bg-sidebar text-sidebar-foreground shadow-xl">
        <div className="flex h-14 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <p id={titleId} className="text-sm font-semibold">
            Levercast
          </p>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close navigation">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex h-[calc(100dvh-3.5rem)] flex-col gap-4 overflow-auto p-4">
          <NavList collapsed={false} onNavigate={() => onOpenChange(false)} />

          <div className="mt-auto border-t border-sidebar-border pt-3">
            <ProfileDropdown collapsed={false} />
          </div>
        </div>
      </div>
    </div>
  )
}


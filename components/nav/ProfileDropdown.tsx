'use client'

import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/utils'

interface ProfileDropdownProps {
  collapsed?: boolean
}

export function ProfileDropdown({ collapsed = false }: ProfileDropdownProps) {
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <UserButton />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <UserButton />
      <ThemeToggle />
    </div>
  )
}
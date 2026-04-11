'use client'

import { UserButton } from '@clerk/nextjs'
import { CreditCard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface ProfileDropdownProps {
  collapsed?: boolean
}

export function ProfileDropdown({ collapsed = false }: ProfileDropdownProps) {
  if (collapsed) {
    return (
      <div className="flex justify-center">
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Billing"
              href="/billing"
              labelIcon={<CreditCard className="w-4 h-4" />}
            />
          </UserButton.MenuItems>
        </UserButton>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Billing"
            href="/billing"
            labelIcon={<CreditCard className="w-4 h-4" />}
          />
        </UserButton.MenuItems>
      </UserButton>
      <ThemeToggle />
    </div>
  )
}
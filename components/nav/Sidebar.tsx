'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavList } from './NavItem'
import { ProfileDropdown } from './ProfileDropdown'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
          {!collapsed && (
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Levercast
            </h1>
          )}
          {collapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">L</span>
          )}
        </div>

        <NavList collapsed={collapsed} />

        <div className="mt-auto flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className={cn('hidden md:flex w-full', collapsed && 'justify-center')}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>

          <div className={cn('pt-2 border-t border-sidebar-border', collapsed && 'flex justify-center')}>
            <ProfileDropdown collapsed={collapsed} />
          </div>
        </div>
      </div>
    </aside>
  )
}
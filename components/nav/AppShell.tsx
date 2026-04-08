'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/nav/Sidebar'
import { AppTopbar } from '@/components/nav/AppTopbar'
import { MobileNavDrawer } from '@/components/nav/MobileNavDrawer'

interface AppShellProps {
  children: React.ReactNode
}

function titleFromPathname(pathname: string): string {
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/edit-post')) return 'New Post'
  if (pathname.startsWith('/posts')) return 'Recent Posts'
  if (pathname.startsWith('/templates')) return 'Templates'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Levercast'
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex min-h-dvh">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onOpenNav={() => setNavOpen(true)} title={titleFromPathname(pathname)} />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      <MobileNavDrawer open={navOpen} onOpenChange={setNavOpen} />
    </div>
  )
}


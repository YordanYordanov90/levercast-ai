'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Edit, Home, List, Settings, LayoutTemplate, CreditCard } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, accent: 'amber' },
  { href: '/edit-post', label: 'New Post', icon: Edit, accent: 'blue' },
  { href: '/posts', label: 'Recent Posts', icon: List, accent: 'emerald' },
  { href: '/templates', label: 'Templates', icon: LayoutTemplate, accent: 'violet' },
  { href: '/settings', label: 'Settings', icon: Settings, accent: 'zinc' },
  { href: '/billing', label: 'Billing', icon: CreditCard, accent: 'rose' },
]

const iconAccent: Record<
  (typeof navItems)[number]['accent'],
  { icon: string; bg: string; activeIcon: string; activeBg: string }
> = {
  amber: {
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
    activeIcon: 'text-amber-300',
    activeBg: 'bg-amber-500/15',
  },
  blue: {
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
    activeIcon: 'text-blue-300',
    activeBg: 'bg-blue-500/15',
  },
  emerald: {
    icon: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    activeIcon: 'text-emerald-300',
    activeBg: 'bg-emerald-500/15',
  },
  violet: {
    icon: 'text-violet-400',
    bg: 'bg-violet-500/10',
    activeIcon: 'text-violet-300',
    activeBg: 'bg-violet-500/15',
  },
  zinc: {
    icon: 'text-muted-foreground',
    bg: 'bg-muted/60',
    activeIcon: 'text-foreground',
    activeBg: 'bg-muted',
  },
  rose: {
    icon: 'text-rose-400',
    bg: 'bg-rose-500/10',
    activeIcon: 'text-rose-300',
    activeBg: 'bg-rose-500/15',
  },
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  accent?: (typeof navItems)[number]['accent']
  collapsed: boolean
  onNavigate?: () => void
}

export function NavItem({ href, label, icon: Icon, accent = 'zinc', collapsed, onNavigate }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  const a = iconAccent[accent]

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'bg-accent text-accent-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        className={cn(
          'grid size-9 place-items-center rounded-lg border border-border/60 transition-colors',
          isActive ? a.activeBg : a.bg,
        )}
        aria-hidden="true"
      >
        <Icon className={cn('size-5 shrink-0', isActive ? a.activeIcon : a.icon)} />
      </span>
      {!collapsed && <span>{label}</span>}
      {collapsed && <span className="sr-only">{label}</span>}
    </Link>
  )
}

interface NavListProps {
  collapsed: boolean
  onNavigate?: () => void
}

export function NavList({ collapsed, onNavigate }: NavListProps) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          accent={item.accent}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
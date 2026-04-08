'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Template } from '@/types/template'

interface TemplateCardProps {
  template: Template
  onEdit?: (t: Template) => void
  onDeleteRequest?: (t: Template) => void
}

export function TemplateCard({ template, onEdit, onDeleteRequest }: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const canManage = !template.isSystem && onEdit && onDeleteRequest

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowMenu((open) => !open)
  }

  const accentBorder = template.isSystem ? 'border-l-4 border-l-muted' : 'border-l-4 border-l-primary/60'

  return (
    <div
      className={cn(
        'relative group flex flex-col gap-3 rounded-xl border border-border bg-card p-5',
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        accentBorder,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {template.category}
            {template.isSystem ? ' · Built-in' : ''}
          </p>
        </div>
        {canManage && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={toggleMenu}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                showMenu && 'opacity-100 bg-accent',
              )}
              aria-label="More options"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-md border border-border bg-popover shadow-lg z-20 animate-in fade-in-0 zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onEdit(template)
                    setShowMenu(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-t-md',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDeleteRequest(template)
                    setShowMenu(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-b-md border-t border-border',
                    'text-destructive hover:bg-destructive/10',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{template.description}</p>
      <div className="flex gap-1 mb-2 flex-wrap">
        {template.platforms.map((platform) => (
          <span
            key={platform}
            className="rounded bg-muted px-2 py-0.5 text-xs capitalize"
          >
            {platform}
          </span>
        ))}
      </div>
      <p className="text-sm font-mono bg-muted/50 rounded p-2 line-clamp-2">
        {template.content}
      </p>
      <Button asChild className="w-full sm:w-auto mt-auto">
        <Link href={`/edit-post?template=${template.id}`}>Use Template</Link>
      </Button>
    </div>
  )
}

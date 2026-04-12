'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MoreVertical, Trash2 } from 'lucide-react'
import { Post, PostStatus } from '@/types/post'
import { cn } from '@/lib/utils'

const statusLeftBorder: Record<PostStatus, string> = {
  draft: 'border-l-amber-500 hover:bg-amber-500/5',
  pending: 'border-l-blue-500 hover:bg-blue-500/5',
  published: 'border-l-emerald-500 hover:bg-emerald-500/5',
}

const statusStyles: Record<PostStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  published: 'bg-green-500/20 text-green-700 dark:text-green-400'
}

const statusLabels: Record<PostStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  published: 'Published'
}

interface PostCardProps {
  post: Post
  onDelete?: (postId: string) => void | Promise<void>
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(post.id)
    }
    setShowMenu(false)
  }

  return (
    <div className={cn(
      'relative group rounded-xl border border-border bg-card p-5 border-l-4 transition-all duration-200',
      'hover:shadow-lg hover:-translate-y-0.5',
      statusLeftBorder[post.status]
    )}>
      <Link
        href={`/edit-post?id=${post.id}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        aria-label={`Edit post: ${post.title}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium line-clamp-1 flex-1 min-w-0">{post.title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium transition-transform duration-200 ease-out',
              'group-hover:-translate-x-7',
              statusStyles[post.status]
            )}
          >
            {statusLabels[post.status]}
          </span>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className={cn(
                'p-1.5 rounded-md transition-all duration-200',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                'w-0 group-hover:w-auto overflow-hidden group-hover:overflow-visible',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                showMenu && 'opacity-100 bg-accent w-auto overflow-visible'
              )}
              aria-label="More options"
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-md border border-border bg-popover shadow-lg z-20 animate-in fade-in-0 zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'text-destructive hover:bg-destructive/10',
                    'transition-colors rounded-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="relative z-10 text-sm text-muted-foreground line-clamp-2 mb-3">
        {post.excerpt}
      </p>

      <div className="relative z-10 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex gap-1">
          {post.platforms.map((p) => (
            <span
              key={p.name}
              className="rounded bg-muted px-1.5 py-0.5 capitalize"
            >
              {p.name}
            </span>
          ))}
        </div>
        <span className="ml-auto">
          {new Date(post.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
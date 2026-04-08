'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

import { PostCard } from '@/components/posts/PostCard'
import { fetchJson } from '@/lib/api/fetch-json'
import type { Post, PostStatus } from '@/types/post'
import { Button } from '@/components/ui/button'

interface PostsViewProps {
  initialPosts: Post[]
}

export function PostsView({ initialPosts }: PostsViewProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all')
  const [posts, setPosts] = useState(initialPosts)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const filteredPosts =
    statusFilter === 'all'
      ? posts
      : posts.filter((post) => post.status === statusFilter)

  const handleDelete = async (postId: string) => {
    try {
      await fetchJson<{ id: string }>(`/api/posts/${postId}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      router.refresh()
      toast.success('Post deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete post')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recent Posts</h1>
          <p className="text-muted-foreground">Manage your published and draft content</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/edit-post">+ New Post</Link>
        </Button>
      </div>

      <div className="flex gap-2 mb-6" role="group" aria-label="Filter posts by status">
        {(['all', 'draft', 'pending', 'published'] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            aria-pressed={statusFilter === status}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts found</p>
        </div>
      )}
    </div>
  )
}

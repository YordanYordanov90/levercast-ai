import Link from 'next/link'
import { count, desc, eq, and } from 'drizzle-orm'
import { CheckCircle, Clock, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ensureUser } from '@/lib/auth/ensure-user'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { rowToPost } from '@/lib/mappers/post-mapper'
import type { PostStatus } from '@/types/post'

const RECENT_POST_LIMIT = 6

const STATUS_STYLES: Record<
  PostStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  draft: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-l-amber-500 hover:bg-amber-500/5',
    label: 'Draft',
  },
  pending: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-l-blue-500 hover:bg-blue-500/5',
    label: 'Pending',
  },
  published: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-l-emerald-500 hover:bg-emerald-500/5',
    label: 'Published',
  },
}

const STAT_ACCENTS = {
  draft: {
    icon: FileText,
    border: 'border-l-4 border-l-amber-500',
    iconWrap: 'text-amber-500 bg-amber-500/10',
    bar: 'bg-amber-500',
  },
  pending: {
    icon: Clock,
    border: 'border-l-4 border-l-blue-500',
    iconWrap: 'text-blue-500 bg-blue-500/10',
    bar: 'bg-blue-500',
  },
  published: {
    icon: CheckCircle,
    border: 'border-l-4 border-l-emerald-500',
    iconWrap: 'text-emerald-500 bg-emerald-500/10',
    bar: 'bg-emerald-500',
  },
} satisfies Record<
  PostStatus,
  { icon: typeof FileText; border: string; iconWrap: string; bar: string }
>

export default async function DashboardPage() {
  const user = await ensureUser()

  const [draftCount] = await db
    .select({ count: count() })
    .from(posts)
    .where(and(eq(posts.userId, user.id), eq(posts.status, 'draft')))

  const [pendingCount] = await db
    .select({ count: count() })
    .from(posts)
    .where(and(eq(posts.userId, user.id), eq(posts.status, 'pending')))

  const [publishedCount] = await db
    .select({ count: count() })
    .from(posts)
    .where(and(eq(posts.userId, user.id), eq(posts.status, 'published')))

  const totalPosts = draftCount.count + pendingCount.count + publishedCount.count

  const recentRows = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.updatedAt))
    .limit(RECENT_POST_LIMIT)

  const recentPosts = recentRows.map(rowToPost)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your content overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {(
          [
            { key: 'draft' as const, label: 'Drafts', value: draftCount.count },
            { key: 'pending' as const, label: 'Pending Review', value: pendingCount.count },
            { key: 'published' as const, label: 'Published', value: publishedCount.count },
          ]
        ).map((stat) => {
          const accent = STAT_ACCENTS[stat.key]
          const Icon = accent.icon
          const pct = totalPosts > 0 ? (stat.value / totalPosts) * 100 : 0

          return (
            <div
              key={stat.key}
              className={`rounded-xl border border-border bg-card p-6 ${accent.border} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${accent.iconWrap}`}>
                  <Icon className="size-6" />
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${accent.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{pct.toFixed(0)}% of total</p>
            </div>
          )
        })}
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/edit-post">+ New Post</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/posts">View All Posts</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/templates">Templates</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/settings">Settings</Link>
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <Link href="/posts" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet. Create your first post.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => {
              const style = STATUS_STYLES[post.status]
              return (
              <Link
                key={post.id}
                href={`/edit-post?id=${post.id}`}
                className={`rounded-xl border border-border bg-card p-5 border-l-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${style.border}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold line-clamp-1 flex-1">{post.title}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </p>
              </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

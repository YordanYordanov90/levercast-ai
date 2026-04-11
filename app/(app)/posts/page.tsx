import { desc, eq } from 'drizzle-orm'

import { PostsView } from '@/components/posts/PostsView'
import { ensureUser } from '@/lib/auth/ensure-user'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { rowToPost } from '@/lib/mappers/post-mapper'
import { MAX_LIST_LIMIT } from '@/lib/validations/post'

export default async function PostsPage() {
  const user = await ensureUser()
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.updatedAt))
    .limit(MAX_LIST_LIMIT)

  return <PostsView initialPosts={rows.map(rowToPost)} />
}

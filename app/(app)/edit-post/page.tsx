import { Suspense } from 'react'

import { EditorSkeleton } from '@/components/loaders/EditorSkeleton'
import { ensureUser } from '@/lib/auth/ensure-user'
import { getIntegration } from '@/lib/db/integrations'

import { EditPostClient } from './EditPostClient'

/** Per-request: LinkedIn connection state must not be statically cached. */
export const dynamic = 'force-dynamic'

function viewerDisplayNameFromUser(user: {
  firstName: string | null
  lastName: string | null
  email: string | null
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (name.length > 0) return name
  if (user.email?.trim()) return user.email.trim()
  return 'You'
}

function handleHintFromEmail(email: string | null | undefined): string | undefined {
  if (!email) return undefined
  const local = email.split('@')[0]?.trim()
  if (!local) return undefined
  const slug = local.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15)
  return slug.length > 0 ? slug : undefined
}

export default async function EditPostPage() {
  const user = await ensureUser()
  const linkedin = await getIntegration(user.id, 'linkedin')
  const twitter = await getIntegration(user.id, 'twitter')
  const linkedinConnected =
    linkedin?.status === 'connected' &&
    Boolean(linkedin.accessToken) &&
    Boolean(linkedin.platformUserId)
  const twitterConnected =
    twitter?.status === 'connected' && Boolean(twitter.accessToken) && Boolean(twitter.platformUserId)

  const viewerDisplayName = viewerDisplayNameFromUser(user)
  const viewerHandle = handleHintFromEmail(user.email)
  const viewerAvatarUrl = user.imageUrl?.trim() || undefined

  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditPostClient
        linkedinConnected={linkedinConnected}
        linkedinDisplayName={linkedin?.platformDisplayName ?? undefined}
        twitterConnected={twitterConnected}
        twitterDisplayName={twitter?.platformDisplayName ?? undefined}
        viewerDisplayName={viewerDisplayName}
        viewerHandle={viewerHandle}
        viewerAvatarUrl={viewerAvatarUrl}
      />
    </Suspense>
  )
}

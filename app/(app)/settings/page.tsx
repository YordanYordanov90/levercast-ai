import { Suspense } from 'react'

import { ensureUser } from '@/lib/auth/ensure-user'
import { getIntegration } from '@/lib/db/integrations'
import { LinkedInConnect } from '@/components/settings/LinkedInConnect'
import { SettingsAppearanceSection } from '@/components/settings/SettingsAppearanceSection'
import { SettingsAccountSection } from '@/components/settings/SettingsAccountSection'
import { TwitterConnect } from '@/components/settings/TwitterConnect'
import type { IntegrationRow } from '@/lib/db/integrations'
import type { IntegrationUiStatus } from '@/types/integrations'

function integrationPropsFromRow(row: IntegrationRow | null): {
  status: IntegrationUiStatus
  displayName?: string
} {
  if (!row || row.status === 'disconnected') {
    return { status: 'disconnected' }
  }
  if (row.status === 'error') {
    return {
      status: 'error',
      displayName: row.platformDisplayName ?? undefined,
    }
  }
  return {
    status: 'connected',
    displayName: row.platformDisplayName ?? undefined,
  }
}

function LinkedInConnectFallback() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>
      </div>
      <div className="h-9 w-24 rounded-md bg-muted" />
    </div>
  )
}

export default async function SettingsPage() {
  const user = await ensureUser()
  const linkedinRow = await getIntegration(user.id, 'linkedin')
  const twitterRow = await getIntegration(user.id, 'twitter')
  const linkedIn = integrationPropsFromRow(linkedinRow)
  const twitter = integrationPropsFromRow(twitterRow)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <SettingsAppearanceSection />

        <section className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your social media accounts to publish posts directly.
          </p>

          <div className="space-y-3">
            <Suspense fallback={<LinkedInConnectFallback />}>
              <LinkedInConnect status={linkedIn.status} displayName={linkedIn.displayName} />
            </Suspense>
            <Suspense fallback={<LinkedInConnectFallback />}>
              <TwitterConnect status={twitter.status} displayName={twitter.displayName} />
            </Suspense>
          </div>
        </section>

        <SettingsAccountSection />
      </div>
    </div>
  )
}

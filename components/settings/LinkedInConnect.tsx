'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { disconnectIntegration } from '@/actions/integrations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { IntegrationUiStatus } from '@/types/integrations'

const ERROR_MESSAGES: Record<string, string> = {
  linkedin_config:
    'LinkedIn is not configured. Check LINKEDIN_CLIENT_ID, SECRET, and REDIRECT_URI.',
  linkedin_denied: 'LinkedIn authorization was canceled or denied.',
  linkedin_state_mismatch: 'Session expired. Try connecting again.',
  linkedin_token_exchange: 'Could not complete sign-in with LinkedIn.',
  linkedin_userinfo: 'Could not load your LinkedIn profile.',
  linkedin_encrypt: 'Server encryption is misconfigured. Contact support.',
  linkedin_db: 'Could not save your connection. Try again.',
  linkedin_invalid_callback: 'Invalid response from LinkedIn.',
  linkedin_missing_params: 'Missing parameters from LinkedIn.',
  linkedin_unauthorized: 'Please sign in and try again.',
}

export interface LinkedInConnectProps {
  status: IntegrationUiStatus
  displayName?: string
}

export function LinkedInConnect({ status, displayName }: LinkedInConnectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [disconnecting, setDisconnecting] = useState(false)
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (notifiedRef.current) return
    const connected = searchParams.get('connected')
    const err = searchParams.get('error')
    const detail = searchParams.get('detail')

    if (connected === 'linkedin') {
      notifiedRef.current = true
      toast.success('LinkedIn connected successfully.')
      router.replace('/settings', { scroll: false })
      return
    }

    if (err?.startsWith('linkedin_')) {
      notifiedRef.current = true
      const base = ERROR_MESSAGES[err] ?? 'Something went wrong connecting LinkedIn.'
      const message = detail ? `${base} ${decodeURIComponent(detail)}` : base
      toast.error(message)
      router.replace('/settings', { scroll: false })
    }
  }, [searchParams, router])

  async function onDisconnect() {
    setDisconnecting(true)
    const result = await disconnectIntegration('linkedin')
    setDisconnecting(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('LinkedIn disconnected.')
    startTransition(() => {
      router.refresh()
    })
  }

  const subtitle =
    status === 'connected' && displayName
      ? `Connected as ${displayName}`
      : status === 'connected'
        ? 'Connected'
        : status === 'error'
          ? 'Connection error — reconnect or disconnect.'
          : 'Not connected'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 shrink-0 rounded bg-[#0A66C2] flex items-center justify-center text-white font-bold text-sm">
          in
        </div>
        <div className="min-w-0">
          <p className="font-medium">LinkedIn</p>
          <p className={cn('text-sm truncate', status === 'error' && 'text-destructive')}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {status === 'connected' ? (
          <>
            <span className="text-xs font-medium rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5">
              Active
            </span>
            <Button
              type="button"
              variant="outline"
              disabled={disconnecting || pending}
              onClick={() => void onDisconnect()}
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          </>
        ) : status === 'error' ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/api/auth/linkedin">Reconnect</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
              disabled={disconnecting || pending}
              onClick={() => void onDisconnect()}
            >
              Clear
            </Button>
          </>
        ) : (
          <Button variant="outline" asChild>
            <Link prefetch={false} href="/api/auth/linkedin">Connect</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

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
  twitter_config:
    'Twitter / X is not configured. Check TWITTER_CLIENT_ID, SECRET, and REDIRECT_URI.',
  twitter_denied: 'Twitter / X authorization was canceled or denied.',
  twitter_state_mismatch: 'Session expired. Try connecting again.',
  twitter_token_exchange: 'Could not complete sign-in with Twitter / X.',
  twitter_userinfo: 'Could not load your Twitter / X profile.',
  twitter_encrypt: 'Server encryption is misconfigured. Contact support.',
  twitter_db: 'Could not save your connection. Try again.',
  twitter_invalid_callback: 'Invalid response from Twitter / X.',
  twitter_missing_params: 'Missing parameters from Twitter / X.',
  twitter_unauthorized: 'Please sign in and try again.',
  twitter_rate_limit: 'Too many connect attempts. Wait a few minutes and try again.',
}

export interface TwitterConnectProps {
  status: IntegrationUiStatus
  displayName?: string
}

export function TwitterConnect({ status, displayName }: TwitterConnectProps) {
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

    if (connected === 'twitter') {
      notifiedRef.current = true
      toast.success('Twitter / X connected successfully.')
      router.replace('/settings', { scroll: false })
      return
    }

    if (err?.startsWith('twitter_')) {
      notifiedRef.current = true
      const base = ERROR_MESSAGES[err] ?? 'Something went wrong connecting Twitter / X.'
      const message = detail ? `${base} ${decodeURIComponent(detail)}` : base
      toast.error(message)
      router.replace('/settings', { scroll: false })
    }
  }, [searchParams, router])

  async function onDisconnect() {
    setDisconnecting(true)
    const result = await disconnectIntegration('twitter')
    setDisconnecting(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Twitter / X disconnected.')
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
        <div className="size-10 shrink-0 rounded bg-black flex items-center justify-center text-white font-bold text-sm">
          X
        </div>
        <div className="min-w-0">
          <p className="font-medium">Twitter / X</p>
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
              <Link href="/api/auth/twitter">Reconnect</Link>
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
            <Link prefetch={false} href="/api/auth/twitter">
              Connect
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}


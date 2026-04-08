'use client'

import { cn } from '@/lib/utils'

export type PlatformId = 'linkedin' | 'twitter'

interface PlatformToggleProps {
  id: PlatformId
  label: string
  selected: boolean
  onChange: (selected: boolean) => void
  connected?: boolean
  username?: string
}

const platformConfig: Record<PlatformId, { color: string; icon: string }> = {
  linkedin: {
    color: 'bg-[#0077B5]',
    icon: 'in',
  },
  twitter: {
    color: 'bg-black',
    icon: 'X',
  },
}

export function PlatformToggle({
  id,
  label,
  selected,
  onChange,
  connected = true,
  username,
}: PlatformToggleProps) {
  const config = platformConfig[id]

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className={cn('size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm', config.color)}>
          {config.icon}
        </div>
        <div>
          <p className="font-medium text-sm">{label}</p>
          {connected && username ? (
            <p className="text-xs text-muted-foreground">@{username}</p>
          ) : connected ? (
            <p className="text-xs text-primary">Connected</p>
          ) : (
            <p className="text-xs text-muted-foreground">Not connected</p>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={selected}
        aria-label={`Toggle ${label}`}
        onClick={() => onChange(!selected)}
        disabled={!connected}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          selected ? 'bg-primary' : 'bg-muted',
          !connected && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            selected ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
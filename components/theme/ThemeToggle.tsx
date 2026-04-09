'use client'

import { useTheme } from '@/components/theme/ThemeProvider'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSyncExternalStore } from 'react'

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isClient = useIsClient()

  const currentTheme = resolvedTheme || theme

  const handleToggle = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  if (!isClient) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Sun className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {currentTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
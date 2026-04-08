'use client'

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { THEME_STORAGE_KEY, type AppTheme } from '@/lib/theme-constants'

/** Subset of next-themes API used in this app (no inline script tag in the React tree — React 19 compatible). */
interface ThemeContextValue {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  resolvedTheme: AppTheme
  themes: string[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_EVENT = 'levercast-theme-change'

function readTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  return 'dark'
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY || e.key === null) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(THEME_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(THEME_EVENT, onChange)
  }
}

function getSnapshot(): AppTheme {
  return readTheme()
}

function getServerSnapshot(): AppTheme {
  return 'dark'
}

function applyDomTheme(theme: AppTheme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useLayoutEffect(() => {
    applyDomTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: AppTheme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme: theme,
      themes: ['light', 'dark'],
    }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

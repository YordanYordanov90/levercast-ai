'use client'

import { ThemeToggle } from '@/components/theme/ThemeToggle'

export function SettingsAppearanceSection() {
  return (
    <section className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Appearance</h2>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Theme</p>
          <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
        </div>
        <ThemeToggle />
      </div>
    </section>
  )
}

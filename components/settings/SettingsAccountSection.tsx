'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function SettingsAccountSection() {
  return (
    <section className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Account</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Manage your account settings and preferences.
      </p>

      <div className="space-y-3">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href="/user-profile">Manage account</Link>
        </Button>
      </div>
    </section>
  )
}

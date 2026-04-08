'use client'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { toast } from 'sonner'

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
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

        <section className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Integrations</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your social media accounts to publish posts directly.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  in
                </div>
                <div>
                  <p className="font-medium">LinkedIn</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => toast.info('LinkedIn connection would start here')}>
                Connect
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded bg-black flex items-center justify-center text-white font-bold text-sm">
                  X
                </div>
                <div>
                  <p className="font-medium">Twitter / X</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => toast.info('Twitter connection would start here')}>
                Connect
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your account settings and preferences.
          </p>

          <div className="space-y-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast.info('Profile update would open here')}>
              Update Profile
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => toast.info('Password change would open here')}>
              Change Password
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
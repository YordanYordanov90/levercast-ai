'use client'

import { UserProfile } from '@clerk/nextjs'

export default function UserProfilePage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your profile, security, and sessions</p>
      </div>

      <UserProfile path="/user-profile" routing="path" />
    </div>
  )
}


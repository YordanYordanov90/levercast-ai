import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

import { SignInQueryToast } from '@/components/auth/SignInQueryToast'

export default function SignInPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background">
      <Suspense fallback={null}>
        <SignInQueryToast />
      </Suspense>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </div>
  )
}

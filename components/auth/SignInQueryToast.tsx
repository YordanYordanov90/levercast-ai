'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const MESSAGES: Record<string, string> = {
  oauth_rate_limit:
    'Too many connection attempts. Please wait a few minutes before trying again.',
}

export function SignInQueryToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    const err = searchParams.get('error')
    if (!err || !MESSAGES[err]) return
    done.current = true
    toast.error(MESSAGES[err])
    router.replace('/sign-in', { scroll: false })
  }, [searchParams, router])

  return null
}

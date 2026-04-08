import { AppShell } from '@/components/nav/AppShell'
import { ensureUser } from '@/lib/auth/ensure-user'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await ensureUser()
  return (
    <AppShell>{children}</AppShell>
  )
}
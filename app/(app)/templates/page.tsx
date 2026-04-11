import { desc, eq, isNull, or } from 'drizzle-orm'

import { TemplatesView } from '@/components/templates/TemplatesView'
import { ensureUser } from '@/lib/auth/ensure-user'
import { db } from '@/lib/db'
import { templates } from '@/lib/db/schema'
import { rowToTemplate } from '@/lib/mappers/template-mapper'
import { MAX_LIST_LIMIT } from '@/lib/validations/post'

export default async function TemplatesPage() {
  const user = await ensureUser()
  const rows = await db
    .select()
    .from(templates)
    .where(or(isNull(templates.userId), eq(templates.userId, user.id)))
    .orderBy(desc(templates.createdAt))
    .limit(MAX_LIST_LIMIT)

  return <TemplatesView initialTemplates={rows.map(rowToTemplate)} />
}

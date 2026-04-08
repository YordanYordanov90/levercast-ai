'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { fetchJson } from '@/lib/api/fetch-json'
import type { Template, TemplatePlatform } from '@/types/template'
import { Sparkles } from 'lucide-react'

interface TemplatesViewProps {
  initialTemplates: Template[]
}

const emptyForm = {
  name: '',
  description: '',
  category: '',
  content: '',
  platforms: ['linkedin', 'twitter'] as TemplatePlatform[],
}

export function TemplatesView({ initialTemplates }: TemplatesViewProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [templates, setTemplates] = useState(initialTemplates)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Template | null>(null)
  const [saving, setSaving] = useState(false)

  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.category.toLowerCase().includes(search.toLowerCase()),
  )

  const togglePlatform = (p: TemplatePlatform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }))
  }

  const openEdit = (t: Template) => {
    if (t.isSystem) return
    setEditing(t)
    setForm({
      name: t.name,
      description: t.description,
      category: t.category,
      content: t.content,
      platforms:
        t.platforms.length > 0 ? [...t.platforms] : (['linkedin', 'twitter'] as TemplatePlatform[]),
    })
  }

  const closeModal = () => {
    setEditing(null)
    setShowCreate(false)
    setForm(emptyForm)
  }

  const submitCreate = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast.error('Name and template body are required')
      return
    }
    setSaving(true)
    try {
      const created = await fetchJson<Template>('/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          prompt: form.content.trim(),
          metadata: {
            description: form.description.trim() || undefined,
            category: form.category.trim() || undefined,
            platforms: form.platforms.length ? form.platforms : undefined,
          },
        }),
      })
      setTemplates((prev) => [created, ...prev])
      closeModal()
      router.refresh()
      toast.success('Template created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create template')
    } finally {
      setSaving(false)
    }
  }

  const submitEdit = async () => {
    if (!editing) return
    if (!form.name.trim() || !form.content.trim()) {
      toast.error('Name and template body are required')
      return
    }
    setSaving(true)
    try {
      const updated = await fetchJson<Template>(`/api/templates/${editing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          prompt: form.content.trim(),
          metadata: {
            description: form.description.trim() || undefined,
            category: form.category.trim() || undefined,
            platforms: form.platforms.length ? form.platforms : undefined,
          },
        }),
      })
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      closeModal()
      router.refresh()
      toast.success('Template updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  const openAiGenerator = () => {
    setAiDescription('')
    setShowAiGenerator(true)
  }

  const closeAiGenerator = () => {
    setShowAiGenerator(false)
    setAiDescription('')
  }

  const submitAiTemplate = async () => {
    if (!aiDescription.trim()) {
      toast.error('Describe the template you want')
      return
    }
    setAiGenerating(true)
    try {
      const data = await fetchJson<{
        name: string
        description: string
        category: string
        prompt: string
      }>('/api/ai/generate-template', {
        method: 'POST',
        body: JSON.stringify({ description: aiDescription.trim() }),
      })
      setForm({
        name: data.name,
        description: data.description,
        category: data.category,
        content: data.prompt,
        platforms: ['linkedin', 'twitter'],
      })
      setEditing(null)
      closeAiGenerator()
      setShowCreate(true)
      toast.success('Review the draft and click Create to save')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'AI generation failed')
    } finally {
      setAiGenerating(false)
    }
  }

  const closeDeleteDialog = () => {
    if (!deletePending) setDeleteTarget(null)
  }

  const confirmDeleteTemplate = async () => {
    if (!deleteTarget) return
    setDeletePending(true)
    try {
      await fetchJson<{ id: string }>(`/api/templates/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      setTemplates((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      setDeleteTarget(null)
      router.refresh()
      toast.success('Template deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete template')
    } finally {
      setDeletePending(false)
    }
  }

  const modalOpen = showCreate || editing !== null

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Use templates to create posts faster</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="hover:bg-accent-gold hover:text-accent-gold-foreground dark:hover:bg-accent-gold! dark:hover:text-accent-gold-foreground!"
            onClick={openAiGenerator}
          >
            <Sparkles className="size-4 mr-2" />
            Generate Template with AI
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowCreate(true)
              setForm(emptyForm)
            }}
          >
            New template
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search templates"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={openEdit}
            onDeleteRequest={setDeleteTarget}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates found</p>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-template-title"
          aria-describedby="delete-template-desc"
          onClick={closeDeleteDialog}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-template-title" className="text-lg font-semibold mb-2">
              Delete template?
            </h2>
            <p
              id="delete-template-desc"
              className="text-sm text-muted-foreground mb-6"
            >
              This will permanently delete &quot;{deleteTarget.name}&quot;. This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={deletePending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void confirmDeleteTemplate()}
                disabled={deletePending}
              >
                {deletePending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAiGenerator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-template-title"
          onClick={closeAiGenerator}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="ai-template-title" className="text-lg font-semibold mb-2">
              Generate Template with AI
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Describe what you want this template to do. You can edit everything before saving.
              Generated templates are kept as short, structured recipes with placeholders—not long
              generic essays.
            </p>
            <label htmlFor="ai-template-desc" className="text-sm font-medium block mb-1">
              Description
            </label>
            <textarea
              id="ai-template-desc"
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              rows={5}
              placeholder="e.g. A template for sharing a weekly lesson learned with a hook and a takeaway…"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm resize-y min-h-[120px] mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeAiGenerator}
                disabled={aiGenerating}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void submitAiTemplate()}
                disabled={aiGenerating}
              >
                {aiGenerating ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-form-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="template-form-title" className="text-lg font-semibold mb-4">
              {editing ? 'Edit template' : 'New template'}
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="tpl-name" className="text-sm font-medium block mb-1">
                  Name
                </label>
                <input
                  id="tpl-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="tpl-cat" className="text-sm font-medium block mb-1">
                  Category
                </label>
                <input
                  id="tpl-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="tpl-desc" className="text-sm font-medium block mb-1">
                  Description
                </label>
                <input
                  id="tpl-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
              <div>
                <span className="text-sm font-medium block mb-1">Platforms</span>
                <div className="flex gap-3">
                  {(['linkedin', 'twitter'] as const).map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.platforms.includes(p)}
                        onChange={() => togglePlatform(p)}
                      />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="tpl-body" className="text-sm font-medium block mb-1">
                  Template body (prompt)
                </label>
                <textarea
                  id="tpl-body"
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={6}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm resize-y min-h-[120px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={editing ? submitEdit : submitCreate}
                disabled={saving}
              >
                {saving ? 'Saving…' : editing ? 'Save' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LinkedInPreview } from '@/components/previews/LinkedInPreview'
import { TwitterPreview } from '@/components/previews/TwitterPreview'
import { PlatformToggle, PlatformId } from '@/components/platform/PlatformToggle'
import { SaveStatusIndicator, SaveStatus } from '@/components/editor/SaveStatusIndicator'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { fetchJson, ApiError } from '@/lib/api/fetch-json'
import { uploadPostImageViaR2 } from '@/lib/api/upload-post-image'
import type { Post } from '@/types/post'
import type { Template } from '@/types/template'
import { EditorSkeleton } from '@/components/loaders/EditorSkeleton'
import { Loader2, Sparkles, Save, Send } from 'lucide-react'
import { toast } from 'sonner'

interface ImageFile {
  id: string
  file: File
  url: string
  name: string
}

interface SavedBaseline {
  title: string
  content: string
  linkedin: string
  twitter: string
}

function buildPayload(args: {
  title: string
  content: string
  linkedin: string
  twitter: string
  serverImageUrl: string | null
  images: ImageFile[]
  status: 'draft' | 'pending' | 'published'
}) {
  const rawContent =
    args.content.trim() || args.title.trim() || 'Untitled draft'

  const formatted: { linkedin?: string; twitter?: string } = {}
  if (args.linkedin.trim()) formatted.linkedin = args.linkedin
  if (args.twitter.trim()) formatted.twitter = args.twitter

  const localUrl = args.images[0]?.url
  let imageUrl: string | null = args.serverImageUrl
  if (localUrl && !localUrl.startsWith('blob:')) {
    imageUrl = localUrl
  }

  return {
    title: args.title.trim() || null,
    rawContent,
    formattedContent: formatted,
    imageUrl: imageUrl ?? null,
    status: args.status,
  }
}

export interface EditPostClientProps {
  linkedinConnected: boolean
  linkedinDisplayName?: string
  twitterConnected: boolean
  twitterDisplayName?: string
  viewerDisplayName: string
  viewerHandle?: string
  viewerAvatarUrl?: string
}

export function EditPostClient({
  linkedinConnected,
  linkedinDisplayName,
  twitterConnected,
  twitterDisplayName,
  viewerDisplayName,
  viewerHandle,
  viewerAvatarUrl,
}: EditPostClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postIdParam = searchParams.get('id')
  const templateIdParam = searchParams.get('template')

  const [actionInFlight, setActionInFlight] = useState<null | 'save' | 'publish'>(null)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkedinContent, setLinkedinContent] = useState('')
  const [twitterContent, setTwitterContent] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [serverImageUrl, setServerImageUrl] = useState<string | null>(null)
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)

  const [selectedPlatforms, setSelectedPlatforms] = useState({
    linkedin: linkedinConnected,
    twitter: twitterConnected,
  })

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined)
  const [savedBaseline, setSavedBaseline] = useState<SavedBaseline>({
    title: '',
    content: '',
    linkedin: '',
    twitter: '',
  })

  const savingRef = useRef(false)
  const prevLinkedinConnectedRef = useRef(linkedinConnected)
  const prevTwitterConnectedRef = useRef(twitterConnected)

  const [formattingTemplates, setFormattingTemplates] = useState<Template[]>([])
  const [selectedFormattingTemplateId, setSelectedFormattingTemplateId] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url))
    }
  }, [images])

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    setLoading(true)
    setCurrentPostId(postIdParam)
    setImages([])
    setServerImageUrl(null)

    async function load() {
      if (!postIdParam && !templateIdParam) {
        setTitle('')
        setContent('')
        setLinkedinContent('')
        setTwitterContent('')
        setSavedBaseline({ title: '', content: '', linkedin: '', twitter: '' })
        setSaveStatus('idle')
        setLastSaved(undefined)
        if (!cancelled) setLoading(false)
        return
      }

      try {
        if (postIdParam) {
          const data = await fetchJson<Post>(`/api/posts/${postIdParam}`)
          if (cancelled) return
          setTitle(data.title)
          setContent(data.content)
          setLinkedinContent(
            data.platforms.find((p) => p.name === 'linkedin')?.content ?? '',
          )
          setTwitterContent(
            data.platforms.find((p) => p.name === 'twitter')?.content ?? '',
          )
          setServerImageUrl(data.imageUrl ?? null)
          setSavedBaseline({
            title: data.title,
            content: data.content,
            linkedin:
              data.platforms.find((p) => p.name === 'linkedin')?.content ?? '',
            twitter:
              data.platforms.find((p) => p.name === 'twitter')?.content ?? '',
          })
          setSaveStatus('saved')
          setLastSaved(new Date())
        } else if (templateIdParam) {
          const data = await fetchJson<{ content: string }>(
            `/api/templates/${templateIdParam}`,
          )
          if (cancelled) return
          setTitle('')
          setContent(data.content)
          setLinkedinContent('')
          setTwitterContent('')
          setSavedBaseline({
            title: '',
            content: data.content,
            linkedin: '',
            twitter: '',
          })
          setSaveStatus('idle')
          setLastSaved(undefined)
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          toast.error(e instanceof Error ? e.message : 'Failed to load')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [postIdParam, templateIdParam])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const list = await fetchJson<Template[]>(
          '/api/templates?limit=100&offset=0',
        )
        if (cancelled) return
        setFormattingTemplates(list)
      } catch {
        if (!cancelled) setFormattingTemplates([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!templateIdParam || formattingTemplates.length === 0) return
    const exists = formattingTemplates.some((t) => t.id === templateIdParam)
    if (exists) setSelectedFormattingTemplateId(templateIdParam)
  }, [templateIdParam, formattingTemplates])

  useEffect(() => {
    const prev = prevLinkedinConnectedRef.current
    if (!prev && linkedinConnected) {
      setSelectedPlatforms((p) => ({ ...p, linkedin: true }))
    }
    if (prev && !linkedinConnected) {
      setSelectedPlatforms((p) => ({ ...p, linkedin: false }))
    }
    prevLinkedinConnectedRef.current = linkedinConnected
  }, [linkedinConnected])

  useEffect(() => {
    const prev = prevTwitterConnectedRef.current
    if (!prev && twitterConnected) {
      setSelectedPlatforms((p) => ({ ...p, twitter: true }))
    }
    if (prev && !twitterConnected) {
      setSelectedPlatforms((p) => ({ ...p, twitter: false }))
    }
    prevTwitterConnectedRef.current = twitterConnected
  }, [twitterConnected])

  const isDirty = useMemo(
    () =>
      title !== savedBaseline.title ||
      content !== savedBaseline.content ||
      linkedinContent !== savedBaseline.linkedin ||
      twitterContent !== savedBaseline.twitter ||
      images.length > 0,
    [title, content, linkedinContent, twitterContent, images, savedBaseline],
  )

  const indicatorStatus: SaveStatus = useMemo(() => {
    if (saveStatus === 'saving') return 'saving'
    if (!isDirty) {
      return saveStatus === 'saved' ? 'saved' : 'idle'
    }
    return 'unsaved'
  }, [saveStatus, isDirty])

  const persist = useCallback(
    async (status: 'draft' | 'pending' | 'published', quiet: boolean) => {
      if (savingRef.current) return null
      savingRef.current = true
      setSaveStatus('saving')
      try {
        let resolvedImageUrl = serverImageUrl
        const pendingFile = images[0]?.file
        if (pendingFile) {
          resolvedImageUrl = await uploadPostImageViaR2(pendingFile)
        }

        const body = buildPayload({
          title,
          content,
          linkedin: linkedinContent,
          twitter: twitterContent,
          serverImageUrl: resolvedImageUrl,
          images: [],
          status,
        })

        let result: Post
        const id = currentPostId ?? postIdParam
        if (id) {
          result = await fetchJson<Post>(`/api/posts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          })
        } else {
          result = await fetchJson<Post>('/api/posts', {
            method: 'POST',
            body: JSON.stringify(body),
          })
        }

        setCurrentPostId(result.id)
        if (!postIdParam && result.id) {
          router.replace(`/edit-post?id=${result.id}`, { scroll: false })
        }

        setServerImageUrl(result.imageUrl ?? null)
        images.forEach((img) => URL.revokeObjectURL(img.url))
        setImages([])

        setSavedBaseline({
          title: result.title,
          content: result.content,
          linkedin:
            result.platforms.find((p) => p.name === 'linkedin')?.content ?? '',
          twitter:
            result.platforms.find((p) => p.name === 'twitter')?.content ?? '',
        })
        setTitle(result.title)
        setContent(result.content)
        setLinkedinContent(
          result.platforms.find((p) => p.name === 'linkedin')?.content ?? '',
        )
        setTwitterContent(
          result.platforms.find((p) => p.name === 'twitter')?.content ?? '',
        )

        setSaveStatus('saved')
        setLastSaved(new Date())
        if (!quiet) {
          toast.success(status === 'published' ? 'Post published' : 'Draft saved')
        }
        router.refresh()
        return result
      } catch (e) {
        setSaveStatus('unsaved')
        const msg = e instanceof Error ? e.message : 'Save failed'
        toast.error(msg)
        return null
      } finally {
        savingRef.current = false
      }
    },
    [
      title,
      content,
      linkedinContent,
      twitterContent,
      serverImageUrl,
      images,
      currentPostId,
      postIdParam,
      router,
    ],
  )

  const publishToSelectedPlatformsFlow = useCallback(async () => {
    const publishTo: PlatformId[] = []
    if (selectedPlatforms.linkedin) publishTo.push('linkedin')
    if (selectedPlatforms.twitter) publishTo.push('twitter')

    if (publishTo.length === 0) {
      toast.error('Please select at least one platform first')
      return
    }

    if (publishTo.includes('linkedin') && !linkedinConnected) {
      toast.error('Connect LinkedIn in Settings to publish there.')
      return
    }

    if (publishTo.includes('twitter') && !twitterConnected) {
      toast.error('Connect Twitter / X in Settings to publish there.')
      return
    }

    const liText = linkedinContent.trim() || content.trim()
    const twText = twitterContent.trim() || content.trim()
    if (publishTo.includes('linkedin') && !liText) {
      toast.error('Add content for LinkedIn before publishing.')
      return
    }
    if (publishTo.includes('twitter') && !twText) {
      toast.error('Add content for Twitter / X before publishing.')
      return
    }

    if (savingRef.current) return
    savingRef.current = true
    setSaveStatus('saving')
    try {
      let resolvedImageUrl = serverImageUrl
      const pendingFile = images[0]?.file
      if (pendingFile) {
        resolvedImageUrl = await uploadPostImageViaR2(pendingFile)
      }
      if (resolvedImageUrl && publishTo.includes('linkedin')) {
        toast.warning(
          'LinkedIn shares are text-only for now. Your image is saved but not attached on LinkedIn.',
        )
      }
      if (resolvedImageUrl && publishTo.includes('twitter')) {
        toast.warning(
          'Twitter / X is text-only for now. Your image is saved but not attached on Twitter / X.',
        )
      }

      const draftPayload = buildPayload({
        title,
        content,
        linkedin: linkedinContent,
        twitter: twitterContent,
        serverImageUrl: resolvedImageUrl,
        images: [],
        status: 'draft',
      })

      let postId = currentPostId ?? postIdParam
      if (!postId) {
        const created = await fetchJson<Post>('/api/posts', {
          method: 'POST',
          body: JSON.stringify({ ...draftPayload, status: 'draft' }),
        })
        postId = created.id
        setCurrentPostId(created.id)
        router.replace(`/edit-post?id=${created.id}`, { scroll: false })
      } else {
        await fetchJson<Post>(`/api/posts/${postId}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...draftPayload, status: 'draft' }),
        })
      }

      const publishBody = {
        title: draftPayload.title,
        rawContent: draftPayload.rawContent,
        formattedContent: {
          ...draftPayload.formattedContent,
          ...(publishTo.includes('linkedin') ? { linkedin: liText } : {}),
          ...(publishTo.includes('twitter') ? { twitter: twText } : {}),
        },
        imageUrl: draftPayload.imageUrl,
        publishTo,
      }

      const result = await fetchJson<Post>(`/api/posts/${postId}/publish`, {
        method: 'POST',
        body: JSON.stringify(publishBody),
      })

      setServerImageUrl(result.imageUrl ?? null)
      images.forEach((img) => URL.revokeObjectURL(img.url))
      setImages([])

      setSavedBaseline({
        title: result.title,
        content: result.content,
        linkedin:
          result.platforms.find((p) => p.name === 'linkedin')?.content ?? '',
        twitter:
          result.platforms.find((p) => p.name === 'twitter')?.content ?? '',
      })
      setTitle(result.title)
      setContent(result.content)
      setLinkedinContent(
        result.platforms.find((p) => p.name === 'linkedin')?.content ?? '',
      )
      setTwitterContent(
        result.platforms.find((p) => p.name === 'twitter')?.content ?? '',
      )

      setSaveStatus('saved')
      setLastSaved(new Date())
      toast.success(
        publishTo.length === 1
          ? publishTo[0] === 'linkedin'
            ? 'Published to LinkedIn'
            : 'Published to Twitter / X'
          : 'Published to selected platforms',
      )
      router.refresh()
    } catch (e) {
      setSaveStatus('unsaved')
      const msg = e instanceof Error ? e.message : 'Publish failed'
      toast.error(msg)
    } finally {
      savingRef.current = false
    }
  }, [
    title,
    content,
    linkedinContent,
    twitterContent,
    serverImageUrl,
    images,
    currentPostId,
    postIdParam,
    router,
    selectedPlatforms.linkedin,
    selectedPlatforms.twitter,
    linkedinConnected,
    twitterConnected,
  ])

  useEffect(() => {
    if (loading || loadError) return
    if (!isDirty || saveStatus === 'saving') return

    const debounceTimer = setTimeout(() => {
      void persist('draft', true)
    }, 2000)

    return () => clearTimeout(debounceTimer)
  }, [loading, loadError, isDirty, saveStatus, persist, title, content, linkedinContent, twitterContent])

  const handleImageChange = (newImages: ImageFile[]) => {
    setImages(newImages)
  }

  const handlePlatformToggle = (platform: PlatformId, selected: boolean) => {
    setSelectedPlatforms((prev) => ({ ...prev, [platform]: selected }))
  }

  const handleGenerate = async () => {
    const rawContent = content.trim() || title.trim()
    if (!rawContent) {
      toast.error('Add a title or content before generating with AI')
      return
    }
    setAiGenerating(true)
    try {
      const picked = formattingTemplates.find(
        (t) => t.id === selectedFormattingTemplateId,
      )
      const data = await fetchJson<{ linkedin?: string; twitter?: string }>(
        '/api/ai/generate-post',
        {
          method: 'POST',
          body: JSON.stringify({
            rawContent,
            title: title.trim() || undefined,
            platforms: ['linkedin', 'twitter'],
            ...(picked?.content?.trim()
              ? { templatePrompt: picked.content.trim() }
              : {}),
          }),
        },
      )
      if (data.linkedin !== undefined) setLinkedinContent(data.linkedin)
      if (data.twitter !== undefined) setTwitterContent(data.twitter)
      toast.success('Generated platform posts')
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        toast.error('Monthly AI generation limit reached', {
          description: 'Upgrade to Pro for unlimited generations.',
          action: { label: 'Upgrade', onClick: () => router.push('/billing') },
        })
      } else {
        toast.error(e instanceof Error ? e.message : 'Generation failed')
      }
    } finally {
      setAiGenerating(false)
    }
  }

  const handleSaveDraft = () => {
    setActionInFlight('save')
    void persist('draft', false)
  }

  const handlePublish = () => {
    if (!title.trim()) {
      toast.error('Please add a title for your post')
      return
    }
    if (!selectedPlatforms.linkedin && !selectedPlatforms.twitter) {
      toast.error('Please select at least one platform first')
      return
    }
    setActionInFlight('publish')
    void publishToSelectedPlatformsFlow()
  }

  useEffect(() => {
    if (saveStatus !== 'saving') {
      setActionInFlight(null)
    }
  }, [saveStatus])

  const previewImage =
    images.length > 0
      ? images[0].url
      : serverImageUrl ?? undefined

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <EditorSkeleton />
      </div>
    )
  }

  if (loadError && (postIdParam || templateIdParam)) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <p className="text-destructive text-sm mb-4">{loadError}</p>
        <Button type="button" variant="outline" onClick={() => router.push('/posts')}>
          Back to posts
        </Button>
      </div>
    )
  }

  const heading = currentPostId || postIdParam ? 'Edit Post' : 'New Post'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{heading}</h1>
          <p className="text-muted-foreground">Create and publish your content</p>
        </div>
        <SaveStatusIndicator status={indicatorStatus} lastSaved={lastSaved} />
      </div>

      <section className="mb-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your post..."
              className="w-full rounded-md border border-input bg-surface-raised px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

              <div className="mt-4">
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              className="w-full min-h-[220px] rounded-md border border-input bg-surface-raised px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-describedby="content-hint"
            />
            <p id="content-hint" className="text-xs text-muted-foreground mt-1">
              This content will be used as the base for your platform-specific posts.
            </p>
          </div>

              <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Image (optional)</label>
            <ImageUpload images={images} onChange={handleImageChange} maxImages={1} />
          </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <label
                htmlFor="formatting-template"
                className="block text-sm font-medium mb-2"
              >
                Template for AI (optional)
              </label>
              <select
                id="formatting-template"
                value={selectedFormattingTemplateId}
                onChange={(e) => setSelectedFormattingTemplateId(e.target.value)}
                className="w-full max-w-md rounded-md border border-input bg-surface-raised px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Template for AI formatting"
              >
                <option value="">Default formatting</option>
                {formattingTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.isSystem ? ' (built-in)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Leave as default or pick a saved template to steer tone and structure.
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => void handleGenerate()}
                  disabled={aiGenerating}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="size-4 mr-2" />
                  {aiGenerating ? 'Generating…' : 'Generate with AI'}
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold mb-3">Platforms</h2>
              <div className="grid gap-3">
                <PlatformToggle
                  id="linkedin"
                  label="LinkedIn"
                  selected={selectedPlatforms.linkedin}
                  onChange={(selected) => handlePlatformToggle('linkedin', selected)}
                  connected={linkedinConnected}
                  username={linkedinDisplayName}
                  usernamePrefix=""
                />
                <PlatformToggle
                  id="twitter"
                  label="Twitter/X"
                  selected={selectedPlatforms.twitter}
                  onChange={(selected) => handlePlatformToggle('twitter', selected)}
                  connected={twitterConnected}
                  username={twitterDisplayName}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold mb-3">Actions</h2>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="w-full"
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' && actionInFlight === 'save' ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  {saveStatus === 'saving' && actionInFlight === 'save' ? 'Saving…' : 'Save Draft'}
                </Button>
                <Button onClick={handlePublish} className="w-full" disabled={saveStatus === 'saving'}>
                  {saveStatus === 'saving' && actionInFlight === 'publish' ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="size-4 mr-2" />
                  )}
                  {saveStatus === 'saving' && actionInFlight === 'publish' ? 'Publishing…' : 'Publish'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Previews</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <LinkedInPreview
            content={linkedinContent || content}
            onChange={setLinkedinContent}
            editable={selectedPlatforms.linkedin}
            imageUrl={selectedPlatforms.linkedin ? previewImage : undefined}
            authorName={linkedinDisplayName ?? viewerDisplayName}
            authorAvatarUrl={viewerAvatarUrl}
          />
          <TwitterPreview
            content={twitterContent || content}
            onChange={setTwitterContent}
            editable={selectedPlatforms.twitter}
            imageUrl={selectedPlatforms.twitter ? previewImage : undefined}
            authorName={viewerDisplayName}
            authorHandle={viewerHandle}
            authorAvatarUrl={viewerAvatarUrl}
          />
        </div>
      </section>

      <section className="hidden" />
    </div>
  )
}

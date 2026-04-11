'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface ImageFile {
  id: string
  file: File
  url: string
  name: string
}

interface ImageUploadProps {
  images: ImageFile[]
  onChange: (images: ImageFile[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 3 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const validFiles: ImageFile[] = []
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

    if (imageFiles.length < files.length) {
      toast.error('Some files were not images and were skipped')
    }

    for (const file of imageFiles.slice(0, remainingSlots)) {
      const id = generateId()
      validFiles.push({
        id,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      })
    }

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles])
    }
  }

  const handleRemove = (id: string) => {
    const image = images.find(img => img.id === id)
    if (image) {
      URL.revokeObjectURL(image.url)
    }
    onChange(images.filter(img => img.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors',
          'hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragging ? 'border-primary bg-primary/5' : 'border-input',
          images.length >= maxImages && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
          aria-label="Upload images"
        />
        <div className="flex flex-col items-center gap-2 text-center">
          <Upload className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Drag and drop images here</p>
            <p className="text-xs text-muted-foreground">
              or click to browse ({images.length}/{maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group"
            >
              <div className="size-20 rounded-md overflow-hidden border border-border">
                <Image
                  src={image.url}
                  alt={image.name}
                  width={80}
                  height={80}
                  className="size-full object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(image.id)}
                className="absolute -top-2 -right-2 size-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-opacity"
                aria-label={`Remove ${image.name}`}
              >
                <X className="size-3" />
              </button>
              <p className="text-xs text-muted-foreground mt-1 max-w-[80px] truncate">
                {image.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
'use client'

import { ChangeEvent, ClipboardEvent, DragEvent, useEffect, useRef, useState } from 'react'

interface PhotoItem {
  id: string
  url: string
  caption: string | null
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  display_order: number
  created_at: string
}

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function PhotoGalleryForm() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [caption, setCaption] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragCounter = useRef(0)

  useEffect(() => {
    fetchPhotos()
  }, [])

  // Object URLs for the preview thumbnail — revoke when the file changes
  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const fetchPhotos = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/photos')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load photos')
      setPhotos(data.photos || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  /** Validates and accepts a candidate file from any input source (picker, drop, paste). */
  const acceptFile = (file: File | null) => {
    if (!file) return
    if (file.size > MAX_BYTES) {
      setError(`File too large — max ${MAX_BYTES / 1024 / 1024} MB`)
      return
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, WEBP, or GIF are allowed')
      return
    }
    setError('')
    setSuccess('')
    setPendingFile(file)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0] ?? null)
  }

  const clearPending = () => {
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!pendingFile) return
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('file', pendingFile)
      if (caption.trim()) fd.append('caption', caption.trim())
      const res = await fetch('/api/photos', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setPhotos((prev) => [...prev, data.photo])
      setSuccess('Photo uploaded')
      setCaption('')
      clearPending()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      setSuccess('Photo removed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  // ---- Drag-and-drop ----
  // dragCounter handles nested enter/leave events firing when the cursor
  // crosses child elements inside the dropzone.
  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.types.includes('Files')) {
      dragCounter.current += 1
      setIsDragging(true)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) acceptFile(file)
  }

  // ---- Paste ----
  // Catches clipboard images (e.g., a Cmd+Shift+4 screenshot, or an image
  // copied from another app) when the user pastes anywhere inside the form.
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          event.preventDefault()
          acceptFile(file)
          return
        }
      }
    }
  }

  return (
    <div
      className="max-w-2xl mx-auto card p-8"
      onPaste={handlePaste}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 heading-handwritten">Photo Gallery</h2>
        <p className="text-secondary">
          Upload photos or screenshots that show what you&apos;ve been up to
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div
          className="rounded-2xl border-2 border-dashed transition-colors text-center cursor-pointer focus-within:ring-2"
          style={{
            borderColor: isDragging ? 'var(--accent-green)' : 'var(--border-gentle)',
            background: isDragging ? 'var(--sage-100)' : 'var(--background-card)',
            padding: pendingFile ? '1rem' : '2rem',
          }}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Choose, drop, or paste an image"
        >
          {pendingFile && previewUrl ? (
            <div className="flex items-center gap-4 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected preview"
                className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{pendingFile.name}</p>
                <p className="text-xs text-secondary">
                  {(pendingFile.size / 1024).toFixed(0)} KB — {pendingFile.type}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearPending()
                }}
                className="btn-base btn-outline text-sm"
                disabled={uploading}
              >
                Replace
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium mb-1">
                Drop, paste, or click to choose an image
              </p>
              <p className="text-xs text-secondary">
                JPEG, PNG, WEBP, or GIF — up to {MAX_BYTES / 1024 / 1024} MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            id="photo-file"
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="photo-caption">Caption (optional)</label>
          <input
            id="photo-caption"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What is this a screenshot of?"
            maxLength={500}
            className="input-field"
            disabled={uploading}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!pendingFile || uploading}
            className="btn-base btn-primary"
          >
            {uploading ? 'Uploading…' : 'Upload Photo'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
      </div>

      <div className="border-t pt-6" style={{ borderColor: 'var(--border-gentle)' }}>
        <h3 className="text-xl font-medium mb-4 heading-handwritten">Your photos</h3>

        {loading ? (
          <p className="text-secondary text-sm">Loading…</p>
        ) : photos.length === 0 ? (
          <p className="text-secondary text-sm">
            No photos yet. Drop or paste your first one above.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="group relative overflow-hidden rounded-lg border"
                style={{ borderColor: 'var(--border-gentle)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? 'Photo'}
                  loading="lazy"
                  className="block w-full aspect-square object-cover"
                />
                {photo.caption && (
                  <p className="px-2 py-1 text-xs text-secondary truncate" title={photo.caption}>
                    {photo.caption}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1 right-1 rounded-full px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
                  aria-label="Delete photo"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

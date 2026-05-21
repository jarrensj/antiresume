'use client'

import { useEffect, useRef, useState } from 'react'

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

export default function PhotoGalleryForm() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

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

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setPendingFile(null)
      return
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large — max ${MAX_BYTES / 1024 / 1024} MB`)
      setPendingFile(null)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Only JPEG, PNG, WEBP, or GIF are allowed')
      setPendingFile(null)
      return
    }
    setError('')
    setPendingFile(file)
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
      setPendingFile(null)
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
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

  return (
    <div className="max-w-2xl mx-auto card p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 heading-handwritten">Photo Gallery</h2>
        <p className="text-secondary">
          Upload photos or screenshots that show what you&apos;ve been up to
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="form-label" htmlFor="photo-file">Image</label>
          <input
            ref={fileInputRef}
            id="photo-file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            disabled={uploading}
            className="block w-full text-sm"
          />
          <p className="mt-1 text-xs text-secondary">
            JPEG, PNG, WEBP, or GIF — up to {MAX_BYTES / 1024 / 1024} MB
          </p>
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
            No photos yet. Upload your first one above.
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

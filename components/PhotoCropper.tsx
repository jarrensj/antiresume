'use client'

import { useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface PhotoCropperProps {
  /** Source file the user picked / dropped / pasted */
  file: File
  /** Called when the user clicks Apply Crop — receives the cropped File. */
  onApply: (cropped: File) => void
  /** Called when the user clicks Cancel — original file is kept. */
  onCancel: () => void
}

/**
 * Free-form image cropper. Aspect is unlocked by default; users can drag the
 * crop region to move it and drag any corner/edge to resize each axis
 * independently. On apply, the visible crop region is rendered to a canvas at
 * the source image's native resolution and returned as a JPEG/PNG File matching
 * the source mime type. Original file extension and basename are preserved.
 */
export default function PhotoCropper({ file, onApply, onCancel }: PhotoCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [working, setWorking] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Decode the source file to a data URL the <img> can render.
  if (imageSrc === null) {
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    // Start with a centered free-form crop covering 80% of the smaller side.
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 80 }, width / height, width, height),
      width,
      height,
    )
    setCrop(initial)
  }

  const buildCroppedFile = async (): Promise<File | null> => {
    if (!completedCrop || !imgRef.current) return null
    const img = imgRef.current

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height
    const sx = completedCrop.x * scaleX
    const sy = completedCrop.y * scaleY
    const sw = completedCrop.width * scaleX
    const sh = completedCrop.height * scaleY

    if (sw < 1 || sh < 1) return null

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

    // Match the source MIME so the upload validation on the server still passes.
    const outType = ['image/png', 'image/webp', 'image/gif'].includes(file.type)
      ? file.type
      : 'image/jpeg'
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), outType, 0.92),
    )
    if (!blob) return null

    // Preserve the original basename, just suffix it so the user can tell.
    const dot = file.name.lastIndexOf('.')
    const base = dot > 0 ? file.name.slice(0, dot) : file.name
    const ext = outType === 'image/png'
      ? 'png'
      : outType === 'image/webp'
        ? 'webp'
        : outType === 'image/gif'
          ? 'gif'
          : 'jpg'
    return new File([blob], `${base}-cropped.${ext}`, { type: outType })
  }

  const handleApply = async () => {
    setWorking(true)
    try {
      const cropped = await buildCroppedFile()
      if (cropped) onApply(cropped)
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-4">
      {imageSrc && (
        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            keepSelection
            // Free-form: no aspect prop, no `locked`, no min/max — user can
            // drag each handle independently.
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              style={{ maxHeight: '60vh', maxWidth: '100%' }}
            />
          </ReactCrop>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p className="text-xs text-secondary mr-auto">
          Drag the box to move. Drag any corner or edge to resize freely — any aspect ratio.
        </p>
        <button
          type="button"
          onClick={onCancel}
          disabled={working}
          className="btn-base btn-outline"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={working || !completedCrop || completedCrop.width < 1 || completedCrop.height < 1}
          className="btn-base btn-primary"
        >
          {working ? 'Applying…' : 'Apply Crop'}
        </button>
      </div>
    </div>
  )
}

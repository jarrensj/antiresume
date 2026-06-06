'use client'

import { X as CloseIcon } from 'lucide-react'

export const PROJECT_OFFLINE = true

interface OfflineDialogProps {
  open: boolean
  onClose: () => void
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2H21.5l-7.51 8.582L23 22h-6.852l-5.36-7.024L4.6 22H1.34l8.04-9.187L1 2h7.02l4.84 6.4L18.244 2Zm-1.2 18h1.84L7.04 4H5.087l11.957 16Z" />
    </svg>
  )
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function OfflineDialog({ open, onClose }: OfflineDialogProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-charcoal-900/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-dialog-title"
    >
      <div
        className="relative w-full max-w-xs bg-matcha-cream rounded-2xl shadow-xl border-2 border-sage-300 p-5 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-md text-charcoal-500 hover:text-charcoal-800 hover:bg-sage-100 transition-colors"
          aria-label="Close"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <h2 id="offline-dialog-title" className="text-base font-noto font-medium text-charcoal-800 mb-1">
          project is offline
        </h2>
        <p className="text-xs text-charcoal-600 leading-relaxed mb-4">
          follow our socials to know when we&apos;re back
        </p>

        <div className="flex items-center justify-center gap-5">
          <a
            href="https://x.com/antiresume"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow antiresume on X"
            className="text-charcoal-700 hover:text-sage-500 transition-colors duration-200"
          >
            <XLogo className="h-6 w-6" />
          </a>
          <a
            href="https://instagram.com/antiresume"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow antiresume on Instagram"
            className="text-charcoal-700 hover:text-sage-500 transition-colors duration-200"
          >
            <InstagramLogo className="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  )
}

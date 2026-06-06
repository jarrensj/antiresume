'use client'

import { AlertTriangle, ExternalLink, X as CloseIcon } from 'lucide-react'

export const PROJECT_OFFLINE = true

interface OfflineDialogProps {
  open: boolean
  onClose: () => void
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
        className="relative w-full max-w-md bg-matcha-cream rounded-2xl shadow-xl border-2 border-sage-300 p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md text-charcoal-500 hover:text-charcoal-800 hover:bg-sage-100 transition-colors"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h2 id="offline-dialog-title" className="text-xl font-noto font-medium text-charcoal-800 mb-2">
              antiresume is coming back soon
            </h2>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              The project is temporarily offline while the database is down. Follow antiresume on X or Instagram for an alert when it&apos;s live again.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <a
            href="https://x.com/antiresume"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal-700 hover:bg-charcoal-800 text-matcha-cream font-zen px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Follow on X
          </a>
          <a
            href="https://instagram.com/antiresume"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-matcha-cream hover:bg-sage-100 text-charcoal-800 font-zen px-4 py-2.5 rounded-xl border-2 border-sage-300 hover:border-sage-400 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Follow on Instagram
          </a>
        </div>
      </div>
    </div>
  )
}

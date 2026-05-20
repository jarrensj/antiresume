'use client'

import { useState } from 'react'
import type { InstagramPost } from '@/app/lib/utils'

interface InstagramEmbedProps {
  post: InstagramPost
  title?: string
}

export default function InstagramEmbed({ post, title }: InstagramEmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const src = `https://www.instagram.com/${post.mediaType}/${post.shortcode}/embed`

  return (
    <div className="instagram-embed" style={{ position: 'relative', width: '100%', minHeight: 480 }}>
      {!loaded && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--foreground-secondary)',
            fontSize: 14,
          }}
        >
          Loading Instagram post…
        </div>
      )}
      <iframe
        src={src}
        title={title ?? `Instagram ${post.mediaType} ${post.shortcode}`}
        loading="lazy"
        allow="encrypted-media"
        scrolling="no"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          minHeight: 480,
          border: 'none',
          background: 'transparent',
          display: 'block',
        }}
      />
    </div>
  )
}

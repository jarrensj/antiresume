'use client'

import { useEffect } from 'react'
import { Tweet } from 'react-tweet'
import { extractTweetId, extractInstagramId, detectPostType } from '@/app/lib/utils'

interface TweetItem {
  tweet_link: string
  notes?: string
}

interface TweetCardProps {
  tweetItem: TweetItem
  index: number
}

export default function TweetCard({ tweetItem, index }: TweetCardProps) {
  const postType = detectPostType(tweetItem.tweet_link)
  const tweetId = extractTweetId(tweetItem.tweet_link)
  const instagramId = extractInstagramId(tweetItem.tweet_link)
  
  // Load Instagram embed script
  useEffect(() => {
    if (postType === 'instagram') {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      
      // Process embeds
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
      
      return () => {
        document.body.removeChild(script)
      }
    }
  }, [postType, tweetItem.tweet_link])
  
  // Handle invalid post URL
  if (postType === 'unknown' || (postType === 'twitter' && !tweetId) || (postType === 'instagram' && !instagramId)) {
    return (
      <div 
        className="border rounded-2xl p-6"
        style={{
          background: '#fed7d7',
          borderColor: '#feb2b2',
          color: '#c53030'
        }}
      >
        <p className="text-sm font-medium">
          Invalid post URL: {tweetItem.tweet_link}
        </p>
        <p className="text-xs mt-2">
          Supported platforms: Twitter/X and Instagram
        </p>
        {tweetItem.notes && (
          <p className="text-sm mt-3" style={{ color: 'var(--foreground-secondary)' }}>
            <strong>Note:</strong> {tweetItem.notes}
          </p>
        )}
      </div>
    )
  }
  
  return (
    <div className={`tweet-card ${postType === 'instagram' ? 'instagram-post' : ''}`}>
      {/* Post embed */}
      <div className="tweet-embed">
        {postType === 'twitter' && tweetId && (
          <Tweet id={tweetId} />
        )}
        
        {postType === 'instagram' && instagramId && (
          <div className="instagram-embed-container" style={{ maxWidth: '540px', margin: '0 auto' }}>
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={`https://www.instagram.com/p/${instagramId}/`}
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: '0',
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px',
                maxWidth: '540px',
                minWidth: '326px',
                padding: '0',
                width: 'calc(100% - 2px)',
              }}
            >
              <a 
                href={`https://www.instagram.com/p/${instagramId}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  background: '#FFFFFF',
                  lineHeight: '0',
                  padding: '40px 0',
                  textAlign: 'center',
                  textDecoration: 'none',
                  width: '100%',
                  display: 'block'
                }}
              >
                View this post on Instagram
              </a>
            </blockquote>
          </div>
        )}
      </div>
      
      {/* User's note (if exists) */}
      {tweetItem.notes && (
        <div className="tweet-note">
          {tweetItem.notes}
        </div>
      )}
    </div>
  )
}

// Declare Instagram embed type for TypeScript
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

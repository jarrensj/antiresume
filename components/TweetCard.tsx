'use client'

import { Tweet } from 'react-tweet'
import { detectPostPlatform, extractInstagramPost, extractTweetId } from '@/app/lib/utils'
import InstagramEmbed from '@/components/InstagramEmbed'

interface TweetItem {
  tweet_link: string
  notes?: string
}

interface TweetCardProps {
  tweetItem: TweetItem
  index: number
  variant?: 'default' | 'compact'
}

export default function TweetCard({ tweetItem, variant = 'default' }: TweetCardProps) {
  const platform = detectPostPlatform(tweetItem.tweet_link)

  if (platform === 'unknown') {
    if (variant === 'compact') {
      return (
        <div className="alert alert-error text-xs">
          Unsupported post URL
        </div>
      )
    }

    return (
      <div className="alert alert-error">
        <p className="text-sm font-medium">
          Unsupported post URL: {tweetItem.tweet_link}
        </p>
        {tweetItem.notes && (
          <p className="text-sm mt-3 text-secondary">
            <strong>Note:</strong> {tweetItem.notes}
          </p>
        )}
      </div>
    )
  }

  const embed =
    platform === 'twitter'
      ? <Tweet id={extractTweetId(tweetItem.tweet_link)!} />
      : <InstagramEmbed post={extractInstagramPost(tweetItem.tweet_link)!} />

  if (variant === 'compact') {
    return embed
  }

  const sourceLabel = platform === 'twitter' ? 'View on X ↗' : 'View on Instagram ↗'

  return (
    <article className="tweet-card">
      {tweetItem.notes && (
        <div className="tweet-note" aria-label="Note">
          <span className="tweet-note__label">Note</span>
          <p className="tweet-note__content">{tweetItem.notes}</p>
        </div>
      )}

      <div className="tweet-embed">
        {embed}
      </div>

      <div className="tweet-card__footer">
        <a
          className="tweet-card__link"
          href={tweetItem.tweet_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {sourceLabel}
        </a>
      </div>
    </article>
  )
}

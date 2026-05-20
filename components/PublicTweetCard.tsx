'use client'

import { Tweet } from 'react-tweet'
import { detectPostPlatform, extractInstagramPost, extractTweetId } from '@/app/lib/utils'
import InstagramEmbed from '@/components/InstagramEmbed'

interface TweetItem {
  tweet_link: string
  notes?: string
}

interface PublicTweetCardProps {
  tweetItem: TweetItem
}

export default function PublicTweetCard({ tweetItem }: PublicTweetCardProps) {
  const platform = detectPostPlatform(tweetItem.tweet_link)

  if (platform === 'unknown') {
    return (
      <div
        className="public-tweet-card public-tweet-card--error"
        role="alert"
      >
        <p className="public-tweet-card__error-title">Unsupported post URL</p>
        <p className="public-tweet-card__error-body">{tweetItem.tweet_link}</p>
      </div>
    )
  }

  const embed =
    platform === 'twitter'
      ? <Tweet id={extractTweetId(tweetItem.tweet_link)!} />
      : <InstagramEmbed post={extractInstagramPost(tweetItem.tweet_link)!} />

  const sourceLabel = platform === 'twitter' ? 'View on X ↗' : 'View on Instagram ↗'

  return (
    <article className="public-tweet-card">
      {tweetItem.notes && (
        <section className="public-tweet-note" aria-label="Note">
          <span className="public-tweet-note__label">Note</span>
          <p className="public-tweet-note__content">{tweetItem.notes}</p>
        </section>
      )}

      <div className="public-tweet-card__embed">
        {embed}
      </div>

      <footer className="public-tweet-card__footer">
        <a
          className="public-tweet-card__link"
          href={tweetItem.tweet_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {sourceLabel}
        </a>
      </footer>
    </article>
  )
}


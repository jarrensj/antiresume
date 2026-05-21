/**
 * Utility functions for the online resume application
 */

/**
 * Extracts tweet ID from Twitter/X URL
 * @param url - The tweet URL from twitter.com or x.com
 * @returns The tweet ID string or null if invalid URL
 */
export function extractTweetId(url: string): string | null {
  if (!url) return null
  const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

/**
 * Extracts the shortcode + media type from an Instagram URL.
 * Supports posts (/p/), reels (/reel/ and legacy /reels/), and tv (/tv/).
 */
export type InstagramMediaType = 'p' | 'reel' | 'tv'

export interface InstagramPost {
  shortcode: string
  mediaType: InstagramMediaType
}

export function extractInstagramPost(url: string): InstagramPost | null {
  if (!url) return null
  const regex = /(?:instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
  const match = url.match(regex)
  if (!match) return null
  const rawType = match[1].toLowerCase()
  const mediaType: InstagramMediaType = rawType === 'reels' ? 'reel' : (rawType as InstagramMediaType)
  return { shortcode: match[2], mediaType }
}

export type PostPlatform = 'twitter' | 'instagram' | 'unknown'

export function detectPostPlatform(url: string): PostPlatform {
  if (extractTweetId(url)) return 'twitter'
  if (extractInstagramPost(url)) return 'instagram'
  return 'unknown'
}

/**
 * Ensures a URL has an HTTPS protocol prefix
 * @param url - The URL string to normalize
 * @returns The URL with https:// prefix if it didn't have a protocol
 */
export function ensureHttpsProtocol(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  // If the URL doesn't start with a protocol, add https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`
  }
  return trimmed
}

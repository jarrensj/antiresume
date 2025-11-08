/**
 * Utility functions for the online resume application
 */

/**
 * Post type enum
 */
export type PostType = 'twitter' | 'instagram' | 'unknown'

/**
 * Detects the type of social media post from URL
 * @param url - The post URL
 * @returns The post type ('twitter', 'instagram', or 'unknown')
 */
export function detectPostType(url: string): PostType {
  if (!url) return 'unknown'
  
  if (url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/)) {
    return 'twitter'
  }
  
  if (url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel)\/[\w-]+/)) {
    return 'instagram'
  }
  
  return 'unknown'
}

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
 * Extracts Instagram post ID from Instagram URL
 * @param url - The Instagram post URL from instagram.com or instagr.am
 * @returns The post ID string or null if invalid URL
 */
export function extractInstagramId(url: string): string | null {
  if (!url) return null
  const regex = /(?:instagram\.com|instagr\.am)\/(?:p|reel)\/([\w-]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

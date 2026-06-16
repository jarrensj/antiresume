import { ensureHttpsProtocol } from './utils'

export type SocialFieldKey = 'linkedin' | 'twitter_handle' | 'ig_handle' | 'website'

export const SOCIAL_FIELD_KEYS: SocialFieldKey[] = ['linkedin', 'twitter_handle', 'ig_handle', 'website']

export type SanitizedSocialFields = Partial<Record<SocialFieldKey, string | null>>

/**
 * Accepts any of:
 *   - `jarrensj`
 *   - `@jarrensj`
 *   - `https://x.com/jarrensj`
 *   - `x.com/jarrensj`
 *   - `twitter.com/jarrensj/status/...` (extracts the username, drops the rest)
 * and returns just the handle (`jarrensj`). If no recognizable Twitter/X URL
 * pattern is present, falls back to stripping a leading `@`.
 */
export const normalizeTwitterHandle = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const urlMatch = trimmed.match(/(?:^|\/\/)(?:www\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/i)
  if (urlMatch) return urlMatch[1]
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
}

/**
 * Accepts any of:
 *   - `jarrensj`
 *   - `@jarrensj`
 *   - `https://instagram.com/jarrensj`
 *   - `www.instagram.com/jarrensj/`
 *   - `instagr.am/jarrensj`
 * and returns just the handle (`jarrensj`). If no recognizable Instagram URL
 * pattern is present, falls back to stripping a leading `@`.
 */
export const normalizeInstagramHandle = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const urlMatch = trimmed.match(/(?:^|\/\/)(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9_.]+)/i)
  if (urlMatch) return urlMatch[1].replace(/\/+$/, '')
  return trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
}

/**
 * Accepts any of:
 *   - `jarrensanjose`                            → https://linkedin.com/in/jarrensanjose
 *   - `in/jarrensanjose`                         → https://linkedin.com/in/jarrensanjose
 *   - `linkedin.com/in/jarrensanjose`            → https://linkedin.com/in/jarrensanjose
 *   - `https://linkedin.com/in/jarrensanjose`    → unchanged
 *   - `linkedin.com/company/jarrensanjose`       → https://linkedin.com/company/jarrensanjose (other path segments preserved)
 */
export const normalizeLinkedInUrl = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  // Already a full URL or contains linkedin.com → just ensure https
  if (/^https?:\/\//i.test(trimmed) || /linkedin\.com/i.test(trimmed)) {
    return ensureHttpsProtocol(trimmed)
  }
  // Path-only input like `in/jarrensj`
  if (trimmed.startsWith('in/') || trimmed.startsWith('/in/')) {
    return `https://linkedin.com/${trimmed.replace(/^\//, '')}`
  }
  // Bare token (no slash, no dot) → assume LinkedIn profile slug
  if (!trimmed.includes('/') && !trimmed.includes('.')) {
    return `https://linkedin.com/in/${trimmed.replace(/^@/, '')}`
  }
  return ensureHttpsProtocol(trimmed)
}

export const sanitizeSocialFields = (payload: Record<string, unknown>): SanitizedSocialFields => {
  const result: SanitizedSocialFields = {}

  SOCIAL_FIELD_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const value = payload[key]

      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.length > 0) {
          if (key === 'website') {
            result[key] = ensureHttpsProtocol(trimmed)
          } else if (key === 'linkedin') {
            result[key] = normalizeLinkedInUrl(trimmed)
          } else if (key === 'twitter_handle') {
            result[key] = normalizeTwitterHandle(trimmed)
          } else if (key === 'ig_handle') {
            result[key] = normalizeInstagramHandle(trimmed)
          }
        } else {
          result[key] = null
        }
      } else {
        result[key] = null
      }
    }
  })

  return result
}

export interface SocialFields {
  linkedin: string | null
  twitter_handle: string | null
  ig_handle: string | null
  website: string | null
}

export const emptySocialFields = (): SocialFields => ({
  linkedin: null,
  twitter_handle: null,
  ig_handle: null,
  website: null,
})

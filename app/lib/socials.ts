export type SocialFieldKey = 'linkedin' | 'twitter_handle' | 'ig_handle' | 'website'

export const SOCIAL_FIELD_KEYS: SocialFieldKey[] = ['linkedin', 'twitter_handle', 'ig_handle', 'website']

export type SanitizedSocialFields = Partial<Record<SocialFieldKey, string | null>>

export const sanitizeSocialFields = (payload: Record<string, unknown>): SanitizedSocialFields => {
  const result: SanitizedSocialFields = {}

  SOCIAL_FIELD_KEYS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const value = payload[key]

      if (typeof value === 'string') {
        const trimmed = value.trim()
        result[key] = trimmed.length > 0 ? trimmed : null
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

/**
 * Normalizes a URL by prepending https:// if no protocol is present
 */
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  
  // Check if it already has a protocol
  if (trimmed.match(/^https?:\/\//i)) {
    return trimmed
  }
  
  // Prepend https:// if it looks like a URL (has a dot)
  if (trimmed.includes('.')) {
    return `https://${trimmed}`
  }
  
  return trimmed
}


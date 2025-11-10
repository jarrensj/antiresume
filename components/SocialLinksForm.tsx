'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { normalizeUrl } from '@/app/lib/socials'

type SocialFieldKey = 'linkedin' | 'twitter_handle' | 'ig_handle' | 'website'

type SocialLinksState = Record<SocialFieldKey, string>

interface SocialLinksFormProps {
  onSocialsUpdated?: (socials: SocialLinksState) => void
}

const defaultState: SocialLinksState = {
  linkedin: '',
  twitter_handle: '',
  ig_handle: '',
  website: '',
}

export default function SocialLinksForm({ onSocialsUpdated }: SocialLinksFormProps) {
  const [socials, setSocials] = useState<SocialLinksState>({ ...defaultState })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const hasAnyValue = Object.values(socials).some((value) => value.trim().length > 0)

  useEffect(() => {
    const fetchSocials = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/socials')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load social links')
        }

        if (data.socials) {
          setSocials({
            linkedin: data.socials.linkedin ?? '',
            twitter_handle: data.socials.twitter_handle ?? '',
            ig_handle: data.socials.ig_handle ?? '',
            website: data.socials.website ?? '',
          })
        }
      } catch (err) {
        console.error('Error fetching social links:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while loading social links')
      } finally {
        setLoading(false)
      }
    }

    fetchSocials()
  }, [])

  const handleChange = (field: SocialFieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    setSocials((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
    setSuccess('')
    setError('')
  }

  const handleUrlBlur = (field: 'linkedin' | 'website') => () => {
    setSocials((prev) => ({
      ...prev,
      [field]: normalizeUrl(prev[field]),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSubmitting(true)
    setError('')
    setSuccess('')

    const payload = (Object.keys(socials) as SocialFieldKey[]).reduce<Record<string, string>>((acc, key) => {
      const value = socials[key].trim()
      // Normalize URLs for linkedin and website
      acc[key] = (key === 'linkedin' || key === 'website') ? normalizeUrl(value) : value
      return acc
    }, {})

    try {
      const response = await fetch('/api/socials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update social links')
      }

      const updatedSocials: SocialLinksState = {
        linkedin: data.socials.linkedin ?? '',
        twitter_handle: data.socials.twitter_handle ?? '',
        ig_handle: data.socials.ig_handle ?? '',
        website: data.socials.website ?? '',
      }

      setSocials(updatedSocials)
      setSuccess('Social links updated successfully!')
      onSocialsUpdated?.(updatedSocials)
    } catch (err) {
      console.error('Error updating social links:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating social links')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card p-8">
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--foreground)' }}
        >
          Social Links
        </h2>
        <p style={{ color: 'var(--foreground-secondary)' }}>
          Share where people can find you online
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-2 mx-auto loading-spinner"
            style={{ borderTopColor: 'var(--accent-green)', borderColor: 'var(--border-soft)' }}
          ></div>
          <p className="mt-4 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Loading social links...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="linkedin"
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              LinkedIn
            </label>
            <input
              type="text"
              id="linkedin"
              value={socials.linkedin}
              onChange={handleChange('linkedin')}
              placeholder="linkedin.com/in/yourprofile"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                border: '1.5px solid var(--border-gentle)',
                background: 'var(--background-card)',
                color: 'var(--foreground)',
                fontSize: '1rem',
              }}
              disabled={submitting}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-green)'
                e.target.style.boxShadow = '0 0 0 3px rgba(157, 181, 161, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-gentle)'
                e.target.style.boxShadow = 'none'
                handleUrlBlur('linkedin')()
              }}
            />
          </div>

          <div>
            <label
              htmlFor="twitter_handle"
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Twitter Handle
            </label>
            <input
              type="text"
              id="twitter_handle"
              value={socials.twitter_handle}
              onChange={handleChange('twitter_handle')}
              placeholder="@yourhandle"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                border: '1.5px solid var(--border-gentle)',
                background: 'var(--background-card)',
                color: 'var(--foreground)',
                fontSize: '1rem',
              }}
              disabled={submitting}
              maxLength={50}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-green)'
                e.target.style.boxShadow = '0 0 0 3px rgba(157, 181, 161, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-gentle)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="ig_handle"
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Instagram Handle
            </label>
            <input
              type="text"
              id="ig_handle"
              value={socials.ig_handle}
              onChange={handleChange('ig_handle')}
              placeholder="@yourhandle"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                border: '1.5px solid var(--border-gentle)',
                background: 'var(--background-card)',
                color: 'var(--foreground)',
                fontSize: '1rem',
              }}
              disabled={submitting}
              maxLength={50}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-green)'
                e.target.style.boxShadow = '0 0 0 3px rgba(157, 181, 161, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-gentle)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Website
            </label>
            <input
              type="text"
              id="website"
              value={socials.website}
              onChange={handleChange('website')}
              placeholder="yourwebsite.com"
              className="w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                border: '1.5px solid var(--border-gentle)',
                background: 'var(--background-card)',
                color: 'var(--foreground)',
                fontSize: '1rem',
              }}
              disabled={submitting}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-green)'
                e.target.style.boxShadow = '0 0 0 3px rgba(157, 181, 161, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-gentle)'
                e.target.style.boxShadow = 'none'
                handleUrlBlur('website')()
              }}
            />
          </div>

          {error && (
            <div
              className="text-sm p-4 rounded-xl border"
              style={{
                color: '#c53030',
                background: '#fed7d7',
                borderColor: '#feb2b2',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="text-sm p-4 rounded-xl border"
              style={{
                color: 'var(--accent-green)',
                background: '#f0fff4',
                borderColor: 'var(--accent-sage)',
              }}
            >
              {success}
            </div>
          )}

          <div className="flex justify-between items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-6 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: submitting ? 'var(--foreground-light)' : 'var(--accent-green)',
                border: '1.5px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = 'var(--accent-sage)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.background = 'var(--accent-green)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {submitting ? 'Saving...' : 'Save Social Links'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSocials({ ...defaultState })
                setSuccess('')
                setError('')
              }}
              disabled={submitting || !hasAnyValue}
              className="px-6 py-3 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--background-card)',
                border: '1.5px solid var(--border-gentle)',
                color: 'var(--foreground-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.borderColor = 'var(--accent-green)'
                  e.currentTarget.style.color = 'var(--accent-green)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-gentle)'
                e.currentTarget.style.color = 'var(--foreground-secondary)'
              }}
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  )
}


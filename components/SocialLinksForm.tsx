'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { ensureHttpsProtocol } from '@/app/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

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
    setSocials((prev) => ({ ...prev, [field]: event.target.value }))
    setSuccess('')
    setError('')
  }

  const handleBlur = (field: SocialFieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
    if (field === 'website' || field === 'linkedin') {
      const value = event.target.value.trim()
      if (value) {
        setSocials((prev) => ({ ...prev, [field]: ensureHttpsProtocol(value) }))
      }
    }
    if (field === 'twitter_handle' || field === 'ig_handle') {
      const value = event.target.value.trim()
      if (value) {
        setSocials((prev) => ({ ...prev, [field]: value.startsWith('@') ? value.slice(1) : value }))
      }
    }
  }

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString)
      return (
        (url.protocol === 'http:' || url.protocol === 'https:') &&
        url.hostname.includes('.') &&
        url.hostname.length > 3
      )
    } catch {
      return false
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const websiteValue = socials.website.trim()
    const linkedinValue = socials.linkedin.trim()

    if (websiteValue && !isValidUrl(ensureHttpsProtocol(websiteValue))) {
      setError('Please enter a valid website URL (e.g., example.com or https://example.com)')
      setSubmitting(false)
      return
    }
    if (linkedinValue && !isValidUrl(ensureHttpsProtocol(linkedinValue))) {
      setError('Please enter a valid LinkedIn URL (e.g., linkedin.com/in/yourprofile)')
      setSubmitting(false)
      return
    }

    const payload = (Object.keys(socials) as SocialFieldKey[]).reduce<Record<string, string>>(
      (acc, key) => {
        acc[key] = socials[key].trim()
        return acc
      },
      {},
    )

    try {
      const response = await fetch('/api/socials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Social Links</CardTitle>
        <CardDescription>Share where people can find you online</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={socials.linkedin}
                onChange={handleChange('linkedin')}
                onBlur={handleBlur('linkedin')}
                placeholder="https://linkedin.com/in/yourprofile"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_handle">Twitter Handle</Label>
              <Input
                id="twitter_handle"
                value={socials.twitter_handle}
                onChange={handleChange('twitter_handle')}
                onBlur={handleBlur('twitter_handle')}
                placeholder="yourhandle"
                disabled={submitting}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ig_handle">Instagram Handle</Label>
              <Input
                id="ig_handle"
                value={socials.ig_handle}
                onChange={handleChange('ig_handle')}
                onBlur={handleBlur('ig_handle')}
                placeholder="yourhandle"
                disabled={submitting}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={socials.website}
                onChange={handleChange('website')}
                onBlur={handleBlur('website')}
                placeholder="https://antiresume.com"
                disabled={submitting}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Saving…' : 'Save Social Links'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSocials({ ...defaultState })
                  setSuccess('')
                  setError('')
                }}
                disabled={submitting || !hasAnyValue}
              >
                Clear
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

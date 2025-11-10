'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

interface EmailFormProps {
  onEmailUpdated?: (email: string | null) => void
}

export default function EmailForm({ onEmailUpdated }: EmailFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchEmail = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/email')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load email')
        }

        if (data.email) {
          setEmail(data.email)
        }
      } catch (err) {
        console.error('Error fetching email:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while loading email')
      } finally {
        setLoading(false)
      }
    }

    fetchEmail()
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    setSuccess('')
    setError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSubmitting(true)
    setError('')
    setSuccess('')

    const trimmedEmail = email.trim()

    try {
      const response = await fetch('/api/email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update email')
      }

      setEmail(data.email ?? '')
      setSuccess('Email updated successfully!')
      onEmailUpdated?.(data.email)
    } catch (err) {
      console.error('Error updating email:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating email')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 heading-handwritten">
          Email Address
        </h2>
        <p className="text-secondary">
          Set your contact email address
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 mx-auto loading-spinner"></div>
          <p className="mt-4 text-sm loading-text">
            Loading email…
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="input-field"
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="flex justify-between items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-base btn-primary"
            >
              {submitting ? 'Saving…' : 'Save Email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('')
                setSuccess('')
                setError('')
              }}
              disabled={submitting || !email}
              className="btn-base btn-outline"
            >
              Clear
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

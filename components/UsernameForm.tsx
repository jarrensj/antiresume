'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UsernameFormProps {
  onUsernameSet?: (username: string) => void
  mode?: 'create' | 'update'
  currentUsername?: string
}

export default function UsernameForm({
  onUsernameSet,
  mode = 'create',
  currentUsername = '',
}: UsernameFormProps) {
  const [username, setUsername] = useState(currentUsername)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user } = useUser()

  useEffect(() => {
    setUsername(currentUsername)
  }, [currentUsername, mode])

  const handleBlur = () => {
    if (username.trim().startsWith('@')) {
      setUsername(username.trim().slice(1))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setError('Username is required')
      return
    }

    if (mode === 'update' && username.trim() === currentUsername) {
      setError('New username must be different from current username')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const method = mode === 'update' ? 'PUT' : 'POST'
      const response = await fetch('/api/username', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to ${mode === 'update' ? 'update' : 'save'} username`,
        )
      }

      setSuccess(
        mode === 'update' ? 'Username updated successfully!' : 'Username saved successfully!',
      )
      onUsernameSet?.(username.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const submitDisabled =
    loading || !username.trim() || (mode === 'update' && username.trim() === currentUsername)

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">
          {mode === 'update' ? 'Update Username' : `Welcome${user?.firstName ? `, ${user.firstName}` : ''}!`}
        </CardTitle>
        <CardDescription>
          {mode === 'update' ? 'Change your username below' : 'Choose a username to complete your profile'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={handleBlur}
              placeholder="username"
              disabled={loading}
              maxLength={50}
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

          <Button type="submit" disabled={submitDisabled} className="w-full">
            {loading
              ? mode === 'update'
                ? 'Updating…'
                : 'Saving…'
              : mode === 'update'
                ? 'Update Username'
                : 'Save Username'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

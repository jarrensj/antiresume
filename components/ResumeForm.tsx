'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { Tweet, Resume } from '@/app/lib/db'
import TweetCard from '@/components/TweetCard'
import { detectPostPlatform } from '@/app/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface ResumeFormProps {
  onResumeUpdated?: () => void
}

export default function ResumeForm({ onResumeUpdated }: ResumeFormProps) {
  const [resume, setResume] = useState<Resume | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([{ tweet_link: '', notes: '' }])
  const [loading, setLoading] = useState(false)
  const [fetchingResume, setFetchingResume] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Fetch existing resume on component mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch('/api/resume')
        const data = await response.json()
        
        if (response.ok && data.resume) {
          setResume(data.resume)
          const fetchedTweets = data.resume.tweets.length > 0 ? data.resume.tweets : [{ tweet_link: '', notes: '' }]
          setTweets(fetchedTweets)
        } else {
          // No resume exists, start with empty form
          setTweets([{ tweet_link: '', notes: '' }])
        }
      } catch (err) {
        console.error('Error fetching resume:', err)
        setError('Failed to load resume')
      } finally {
        setFetchingResume(false)
      }
    }

    fetchResume()
  }, [])

  const addTweet = () => {
    setTweets([...tweets, { tweet_link: '', notes: '' }])
  }

  const removeTweet = (index: number) => {
    if (tweets.length > 1) {
      setTweets(tweets.filter((_, i) => i !== index))
    }
  }

  const updateTweet = (index: number, field: keyof Tweet, value: string) => {
    const updatedTweets = tweets.map((tweet, i) => 
      i === index ? { ...tweet, [field]: value } : tweet
    )
    setTweets(updatedTweets)
  }

  const moveTweetUp = (index: number) => {
    if (index > 0) {
      const newTweets = [...tweets]
      const temp = newTweets[index]
      newTweets[index] = newTweets[index - 1]
      newTweets[index - 1] = temp
      setTweets(newTweets)
    }
  }

  const moveTweetDown = (index: number) => {
    if (index < tweets.length - 1) {
      const newTweets = [...tweets]
      const temp = newTweets[index]
      newTweets[index] = newTweets[index + 1]
      newTweets[index + 1] = temp
      setTweets(newTweets)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newTweets = [...tweets]
    const draggedTweet = newTweets[draggedIndex]
    
    // Remove the dragged tweet
    newTweets.splice(draggedIndex, 1)
    
    // Insert at the new position
    newTweets.splice(dropIndex, 0, draggedTweet)
    
    setTweets(newTweets)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const validateTweets = () => {
    const validTweets = tweets.filter(tweet => tweet.tweet_link.trim() !== '')
    if (validTweets.length === 0) {
      setError('At least one post link is required')
      return false
    }

    for (const tweet of validTweets) {
      try {
        new URL(tweet.tweet_link)
      } catch {
        setError('Please enter valid URLs for post links')
        return false
      }

      if (detectPostPlatform(tweet.tweet_link) === 'unknown') {
        setError('Only X/Twitter and Instagram post URLs are supported')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateTweets()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Filter out empty tweets
      const validTweets = tweets.filter(tweet => tweet.tweet_link.trim() !== '')
      
      const method = resume ? 'PUT' : 'POST'
      const response = await fetch('/api/resume', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweets: validTweets }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save resume')
      }

      // Success!
      setResume(data.resume)
      setSuccess(resume ? 'Resume updated successfully!' : 'Resume created successfully!')
      onResumeUpdated?.()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!resume || !confirm('Are you sure you want to delete your entire resume? This cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/resume', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete resume')
      }

      // Success!
      setResume(null)
      setTweets([{ tweet_link: '', notes: '' }])
      setSuccess('Resume deleted successfully!')
      onResumeUpdated?.()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingResume) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  const getDragClassName = (index: number) => {
    let className = 'tweet-form-card'
    if (!loading && tweets.length > 1) className += ' drag-item'
    if (draggedIndex === index) className += ' dragging'
    if (dragOverIndex === index) className += ' drag-over'
    return className
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-3xl">
          {resume ? 'Edit Resume' : 'Create Resume'}
        </CardTitle>
        <CardDescription>
          Add X/Twitter or Instagram post links to showcase your thoughts and insights
        </CardDescription>
        {resume && (
          <div className="pt-2">
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete Resume
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {tweets.map((tweet, index) => (
            <div
              key={`tweet-${index}`}
              draggable={!loading && tweets.length > 1}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={getDragClassName(index)}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tweets.length > 1 && !loading && (
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h3 className="text-xl font-medium">Post #{index + 1}</h3>
                </div>
                {tweets.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveTweetUp(index)}
                      disabled={loading || index === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveTweetDown(index)}
                      disabled={loading || index === tweets.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTweet(index)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tweet-link-${index}`}>Post Link *</Label>
                    <Input
                      id={`tweet-link-${index}`}
                      type="url"
                      value={tweet.tweet_link}
                      onChange={(e) => updateTweet(index, 'tweet_link', e.target.value)}
                      placeholder="https://x.com/… or https://instagram.com/p/…"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`tweet-notes-${index}`}>Notes (optional)</Label>
                    <Textarea
                      id={`tweet-notes-${index}`}
                      value={tweet.notes || ''}
                      onChange={(e) => updateTweet(index, 'notes', e.target.value)}
                      placeholder="Add your thoughts about this post…"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-72">
                  <Label>Preview</Label>
                  {tweet.tweet_link.trim() ? (
                    <div className="rounded-lg border border-border bg-secondary p-3">
                      <TweetCard tweetItem={tweet} index={index} variant="compact" />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                      Add a post link to see the preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4">
            <Button type="button" variant="secondary" onClick={addTweet} disabled={loading}>
              Add Another Post
            </Button>

            <Button type="submit" disabled={loading} className="px-8">
              {loading
                ? resume
                  ? 'Updating…'
                  : 'Creating…'
                : resume
                  ? 'Update Resume'
                  : 'Create Resume'}
            </Button>
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
        </form>
      </CardContent>
    </Card>
  )
}


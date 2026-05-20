'use client'

import { useState, useEffect } from 'react'
import { Tweet, Resume } from '@/app/lib/db'
import TweetCard from '@/components/TweetCard'
import { detectPostPlatform } from '@/app/lib/utils'

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
      <div className="max-w-2xl mx-auto card p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 mx-auto loading-spinner"></div>
          <p className="mt-3 text-lg loading-text">Loading resume…</p>
        </div>
      </div>
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
    <div className="max-w-2xl mx-auto card p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-3 heading-handwritten">
            {resume ? 'Edit Resume' : 'Create Resume'}
          </h2>
          <p className="text-secondary">
            Add X/Twitter or Instagram post links to showcase your thoughts and insights
          </p>
        </div>
        {resume && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-base btn-danger"
          >
            Delete Resume
          </button>
        )}
      </div>

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
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {tweets.length > 1 && !loading && (
                  <div className="text-muted">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10 13a1 1 0 100-2 1 1 0 000 2zM10 8a1 1 0 100-2 1 1 0 000 2zM10 5a1 1 0 100-2 1 1 0 000 2zM6 13a1 1 0 100-2 1 1 0 000 2zM6 8a1 1 0 100-2 1 1 0 000 2zM6 5a1 1 0 100-2 1 1 0 000 2z"/>
                    </svg>
                  </div>
                )}
                <h3 className="text-xl font-medium heading-handwritten">
                  Post #{index + 1}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {tweets.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveTweetUp(index)}
                      disabled={loading || index === 0}
                      className="btn-icon"
                      title="Move up"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3.5l-4 4h8l-4-4z"/>
                        <path d="M4 10h8v1H4v-1z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTweetDown(index)}
                      disabled={loading || index === tweets.length - 1}
                      className="btn-icon"
                      title="Move down"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 5h8v1H4V5z"/>
                        <path d="M8 12.5l4-4H4l4 4z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTweet(index)}
                      className="btn-remove"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex-1 min-w-0 space-y-4">
                <div className="space-y-3">
                  <label className="form-label">
                    Post Link *
                  </label>
                  <input
                    type="url"
                    value={tweet.tweet_link}
                    onChange={(e) => updateTweet(index, 'tweet_link', e.target.value)}
                    placeholder="https://x.com/… or https://instagram.com/p/…"
                    className="input-field"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-3">
                  <label className="form-label">
                    Notes (optional)
                  </label>
                  <textarea
                    value={tweet.notes || ''}
                    onChange={(e) => updateTweet(index, 'notes', e.target.value)}
                    placeholder="Add your thoughts about this post…"
                    rows={3}
                    className="textarea-field"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="lg:w-72 flex flex-col gap-3">
                <label className="form-label">
                  Preview
                </label>
                {tweet.tweet_link.trim() ? (
                  <div className="rounded-2xl border px-3 py-4" style={{
                    borderColor: 'var(--border-gentle)',
                    background: 'var(--background-secondary)',
                    boxShadow: 'var(--shadow-gentle)'
                  }}>
                    <div className="tweet-preview-container">
                      <TweetCard
                        tweetItem={tweet}
                        index={index}
                        variant="compact"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed px-4 py-6 text-sm text-center" style={{
                    borderColor: 'var(--border-gentle)',
                    background: 'var(--background-card)',
                    color: 'var(--foreground-secondary)'
                  }}>
                    Add a post link to see the preview
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={addTweet}
            className="btn-base btn-secondary"
            disabled={loading}
          >
            Add Another Post
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-base btn-primary px-8"
          >
            {loading 
              ? (resume ? 'Updating…' : 'Creating…') 
              : (resume ? 'Update Resume' : 'Create Resume')
            }
          </button>
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
      </form>
    </div>
  )
}


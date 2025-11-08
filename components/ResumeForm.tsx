'use client'

import { useState, useEffect } from 'react'
import { Tweet, Resume } from '@/app/lib/db'
import TweetCard from '@/components/TweetCard'

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
          setTweets(data.resume.tweets.length > 0 ? data.resume.tweets : [{ tweet_link: '', notes: '' }])
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

    // Basic URL validation
    for (const tweet of validTweets) {
      try {
        new URL(tweet.tweet_link)
      } catch {
        setError('Please enter valid URLs for post links')
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
          <div 
            className="animate-spin rounded-full h-8 w-8 border-2 mx-auto loading-spinner"
            style={{ borderTopColor: 'var(--accent-green)', borderColor: 'var(--border-soft)' }}
          ></div>
          <p className="mt-3 text-lg" style={{ color: 'var(--foreground-secondary)' }}>Loading resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto card p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--foreground)' }}
          >
            {resume ? 'Edit Resume' : 'Create Resume'}
          </h2>
          <p style={{ color: 'var(--foreground-secondary)' }}>
            Add Twitter/X or Instagram posts to showcase your thoughts and insights
          </p>
        </div>
        {resume && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 text-white"
            style={{ background: '#dc3545', border: '1.5px solid #dc3545' }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#c82333';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = '#dc3545';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
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
            className={`border rounded-2xl p-6 transition-all duration-200 ${
              !loading && tweets.length > 1 ? 'cursor-move' : ''
            }`}
            style={{
              borderColor: draggedIndex === index 
                ? 'var(--accent-sage)' 
                : dragOverIndex === index 
                ? 'var(--accent-green)' 
                : 'var(--border-soft)',
              background: draggedIndex === index 
                ? 'var(--background-secondary)' 
                : dragOverIndex === index 
                ? 'var(--hover-bg)' 
                : 'var(--background-card)',
              opacity: draggedIndex === index ? 0.7 : 1,
              transform: draggedIndex === index ? 'scale(0.98)' : dragOverIndex === index ? 'scale(1.02)' : 'scale(1)',
              boxShadow: dragOverIndex === index ? 'var(--shadow-soft)' : 'var(--shadow-gentle)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {tweets.length > 1 && !loading && (
                  <div style={{ color: 'var(--foreground-light)' }}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10 13a1 1 0 100-2 1 1 0 000 2zM10 8a1 1 0 100-2 1 1 0 000 2zM10 5a1 1 0 100-2 1 1 0 000 2zM6 13a1 1 0 100-2 1 1 0 000 2zM6 8a1 1 0 100-2 1 1 0 000 2zM6 5a1 1 0 100-2 1 1 0 000 2z"/>
                    </svg>
                  </div>
                )}
                <h3 
                  className="text-xl font-medium"
                  style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--foreground)' }}
                >
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
                      className="p-2 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ 
                        background: 'var(--background-secondary)', 
                        border: '1.5px solid var(--border-soft)',
                        color: 'var(--foreground)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--hover-bg)';
                          e.currentTarget.style.borderColor = 'var(--accent-green)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--background-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-soft)';
                        }
                      }}
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
                      className="p-2 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ 
                        background: 'var(--background-secondary)', 
                        border: '1.5px solid var(--border-soft)',
                        color: 'var(--foreground)'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--hover-bg)';
                          e.currentTarget.style.borderColor = 'var(--accent-green)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--background-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border-soft)';
                        }
                      }}
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
                      className="text-sm px-3 py-1 rounded-lg transition-colors"
                      style={{ color: '#dc3545', background: '#f8d7da', border: '1px solid #f5c6cb' }}
                      disabled={loading}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f1b0b7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8d7da';
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Post Link (Twitter/X or Instagram) *
                </label>
                <input
                  type="url"
                  value={tweet.tweet_link}
                  onChange={(e) => updateTweet(index, 'tweet_link', e.target.value)}
                  placeholder="https://twitter.com/... or https://instagram.com/p/..."
                  className="w-full px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    border: '1.5px solid var(--border-gentle)',
                    background: 'var(--background-card)',
                    color: 'var(--foreground)',
                    fontSize: '0.95rem'
                  }}
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-green)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(157, 181, 161, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-gentle)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Notes (optional)
                </label>
                <textarea
                  value={tweet.notes || ''}
                  onChange={(e) => updateTweet(index, 'notes', e.target.value)}
                  placeholder="Add your thoughts about this post..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl transition-all duration-200 resize-none"
                  style={{
                    border: '1.5px solid var(--border-gentle)',
                    background: 'var(--background-card)',
                    color: 'var(--foreground)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-sans)'
                  }}
                  disabled={loading}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-green)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(157, 181, 161, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-gentle)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Tweet Preview */}
              {tweet.tweet_link.trim() && (
                <div>
                  <label 
                    className="block text-sm font-medium mb-3"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Preview
                  </label>
                  <TweetCard
                    tweetItem={tweet}
                    index={index}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={addTweet}
            className="px-5 py-2.5 font-medium rounded-xl transition-all duration-200 text-white"
            style={{ background: 'var(--accent-brown)', border: '1.5px solid var(--accent-brown)' }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'var(--accent-warm)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'var(--accent-brown)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            Add Another Post
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            style={{
              background: loading ? 'var(--foreground-light)' : 'var(--accent-green)',
              border: '1.5px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'var(--accent-sage)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.background = 'var(--accent-green)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading 
              ? (resume ? 'Updating...' : 'Creating...') 
              : (resume ? 'Update Resume' : 'Create Resume')
            }
          </button>
        </div>

        {error && (
          <div 
            className="text-sm p-4 rounded-xl border"
            style={{ 
              color: '#c53030',
              background: '#fed7d7',
              borderColor: '#feb2b2'
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
              borderColor: 'var(--accent-sage)'
            }}
          >
            {success}
          </div>
        )}
      </form>
    </div>
  )
}



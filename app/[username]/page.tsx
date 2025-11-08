'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import TweetCard from '@/components/TweetCard'

interface TweetItem {
  tweet_link: string
  notes?: string
}

interface UserProfile {
  id: string
  username: string
  created_at: string
  tweets: TweetItem[]
  resume_created_at?: string
}

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${resolvedParams.username}`)
        
        if (response.status === 404) {
          notFound()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        
        const data = await response.json()
        setProfile(data.profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (resolvedParams.username) {
      fetchProfile()
    }
  }, [resolvedParams.username])

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-10 w-10 border-2 mx-auto loading-spinner"
            style={{ borderTopColor: 'var(--accent-green)', borderColor: 'var(--border-soft)' }}
          ></div>
          <p className="mt-4 text-lg" style={{ color: 'var(--foreground-secondary)' }}>Loading profile...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-handwritten)', color: '#c53030' }}
          >
            Oops!
          </h1>
          <p style={{ color: 'var(--foreground-secondary)' }}>{error}</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return notFound()
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--foreground)' }}
          >
            {profile.username}
          </h1>
          <div className="w-24 h-0.5 mx-auto" style={{ background: 'var(--accent-sage)' }}></div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {profile.tweets && profile.tweets.length > 0 ? (
            <>
              <div className="flex flex-col gap-4">
                {profile.tweets.map((tweetItem, index) => (
                  <TweetCard
                    key={index}
                    tweetItem={tweetItem}
                    index={index}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div 
                className="card p-12 max-w-lg mx-auto"
                style={{ background: 'var(--background-secondary)' }}
              >
                <h2 
                  className="text-3xl font-semibold mb-3"
                  style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--foreground)' }}
                >
                  No posts yet
                </h2>
                <p style={{ color: 'var(--foreground-secondary)', fontSize: '1.1rem' }}>
                  {profile.username} hasn&apos;t shared any thoughts yet.
                </p>
                <div className="mt-6 w-16 h-0.5 mx-auto" style={{ background: 'var(--accent-sage)' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


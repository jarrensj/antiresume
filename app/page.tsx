'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import UsernameForm from '@/components/UsernameForm'
import ResumeForm from '@/components/ResumeForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import SocialLinksForm from '@/components/SocialLinksForm'
import WalletAddressesForm from '@/components/WalletAddressesForm'

interface UserProfile {
  id: string
  clerk_user_id: string
  username: string
  email?: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [showResumeForm, setShowResumeForm] = useState(false)
  const [showSocialForm, setShowSocialForm] = useState(false)
  const [showWalletForm, setShowWalletForm] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [copied, setCopied] = useState(false)

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/username')
        const data = await response.json()
        
        if (response.ok && data.profile) {
          setUserProfile(data.profile)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleUsernameSet = (username: string) => {
    // Refresh the profile data
    setUserProfile(prev => prev ? { ...prev, username } : null)
    setShowUpdateForm(false)
    setShowSocialForm(false)
    setLoading(true)
    
    // Refetch to get updated profile
    fetch('/api/username')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setUserProfile(data.profile)
        }
      })
      .finally(() => setLoading(false))
  }

  const handleCopyLink = async () => {
    if (!userProfile) return
    
    const fullUrl = `${window.location.origin}/${userProfile.username}`
    
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleResetProfile = async () => {
    setResetLoading(true)
    setResetError('')

    try {
      const response = await fetch('/api/username', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset profile')
      }

      // Success! Reset the local state
      setUserProfile(null)
      setShowResetDialog(false)
      setShowUpdateForm(false)
      setShowResumeForm(false)
      setShowSocialForm(false)
      setShowWalletForm(false)
      
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-6 pt-32 pb-12 flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
      <SignedOut>
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 heading-handwritten">
              Welcome!
            </h1>
            <p className="text-lg text-secondary">
              Create your resume
            </p>
          </div>
          
          <div className="space-y-4">
            <SignInButton>
              <button className="w-full btn-base btn-primary px-8 py-3">
                Sign In to Start
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 mx-auto loading-spinner"></div>
            <p className="mt-4 text-lg loading-text">
              Loading your space…
            </p>
          </div>
        ) : userProfile ? (
          // User has a profile - show dashboard
          <div className="text-center max-w-3xl mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-5xl font-bold mb-3 heading-handwritten">
                Welcome back, {userProfile.username}!
              </h1>
              <p className="text-lg text-secondary">
                Edit your profile
              </p>
            </div>

            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 heading-handwritten">
                Your Profile
              </h2>
              <div className="text-left space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>Username:</span>
                  <span className="text-secondary">{userProfile.username}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>Member since:</span>
                  <span className="text-secondary">
                    {new Date(userProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3 flex-wrap">
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>Profile URL:</span>
                  <a 
                    href={`/${userProfile.username}`}
                    className="profile-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /{userProfile.username}
                  </a>
                </div>
              </div>
              
              <div className="flex gap-3 flex-wrap justify-center">
                <button
                  onClick={() => {
                    setShowUpdateForm(!showUpdateForm);
                    if (!showUpdateForm) {
                      setShowResumeForm(false);
                      setShowSocialForm(false);
                      setShowWalletForm(false);
                    }
                  }}
                  className="btn-base btn-secondary"
                >
                  {showUpdateForm ? 'Cancel' : 'Change Username'}
                </button>
                <button
                  onClick={() => {
                    setShowResumeForm(!showResumeForm);
                    if (!showResumeForm) {
                      setShowUpdateForm(false);
                      setShowSocialForm(false);
                      setShowWalletForm(false);
                    }
                  }}
                  className="btn-base btn-primary"
                >
                  {showResumeForm ? 'Cancel' : 'Manage Resume'}
                </button>
                <button
                  onClick={() => {
                    setShowSocialForm(!showSocialForm);
                    if (!showSocialForm) {
                      setShowUpdateForm(false);
                      setShowResumeForm(false);
                      setShowWalletForm(false);
                    }
                  }}
                  className="btn-base btn-info"
                >
                  {showSocialForm ? 'Cancel' : 'Manage Social Links'}
                </button>
                <button
                  onClick={() => {
                    setShowWalletForm(!showWalletForm);
                    if (!showWalletForm) {
                      setShowUpdateForm(false);
                      setShowResumeForm(false);
                      setShowSocialForm(false);
                    }
                  }}
                  className="btn-base btn-info"
                >
                  {showWalletForm ? 'Cancel' : 'Manage Wallet Addresses'}
                </button>
                <div className="flex gap-2 items-center">
                  <a
                    href={`/${userProfile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 text-white font-medium rounded-xl transition-all duration-200 no-underline"
                    style={{ 
                      background: 'var(--accent-sage)',
                      border: '1.5px solid var(--accent-sage)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-green)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-sage)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    View Public Profile
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="p-2.5 text-white rounded-xl transition-all duration-200"
                    style={{ 
                      background: copied ? 'var(--accent-green)' : 'var(--accent-sage)',
                      border: '1.5px solid transparent',
                      fontSize: '1.2rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--accent-green)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!copied) {
                        e.currentTarget.style.background = 'var(--accent-sage)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                    title={copied ? 'Copied!' : 'Copy profile link'}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
                <button
                  onClick={() => setShowResetDialog(true)}
                  className="btn-base btn-danger"
                >
                  Reset Profile
                </button>
              </div>
            </div>

            {showUpdateForm && (
              <div className="mb-8">
                <UsernameForm
                  mode="update"
                  currentUsername={userProfile.username}
                  onUsernameSet={handleUsernameSet}
                />
              </div>
            )}

            {showResumeForm && (
              <div className="mb-8">
                <ResumeForm
                  onResumeUpdated={() => {
                    // Optionally refresh or show success message
                    console.log('Resume updated!')
                  }}
                />
              </div>
            )}

            {showSocialForm && (
              <div className="mb-8">
                <SocialLinksForm />
              </div>
            )}

            {showWalletForm && (
              <div className="mb-8">
                <WalletAddressesForm />
              </div>
            )}

            {resetError && (
              <div className="mt-4 max-w-md mx-auto alert alert-error">
                {resetError}
              </div>
            )}
          </div>
        ) : (
          // User doesn't have a profile - show username creation form
          <div className="w-full max-w-md mx-auto">
            <UsernameForm onUsernameSet={handleUsernameSet} />
          </div>
        )}
      </SignedIn>

      {/* Reset Profile Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetDialog}
        title="Reset Profile?"
        message="Are you sure you want to reset your profile? This will permanently delete your username, resume, and all associated data. This action cannot be undone."
        confirmText="Yes, Reset Profile"
        cancelText="Cancel"
        onConfirm={handleResetProfile}
        onCancel={() => {
          setShowResetDialog(false)
          setResetError('')
        }}
        isLoading={resetLoading}
        variant="danger"
      />
    </main>
  );
}
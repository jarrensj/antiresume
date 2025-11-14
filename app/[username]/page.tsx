'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import PublicTweetCard from '@/components/PublicTweetCard'
import { Linkedin, Twitter, Instagram, Globe, Copy, Check } from 'lucide-react'

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
  linkedin?: string | null
  twitter_handle?: string | null
  ig_handle?: string | null
  website?: string | null
  evm_wallet_address?: string | null
  solana_wallet_address?: string | null
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
  const [copiedWallet, setCopiedWallet] = useState<'evm' | 'solana' | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`/api/profile/${resolvedParams.username}`)
        if (!response.ok) {
          if (response.status === 404) {
            setProfile(null)
          } else {
            setError('Failed to load profile')
          }
          setLoading(false)
          return
        }
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [resolvedParams.username])

  if (loading) {
    return (
      <main className="min-h-screen p-8 pt-32 flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 mx-auto loading-spinner"></div>
          <p className="mt-4 text-lg loading-text">Loading profile…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 pt-32 flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 heading-handwritten" style={{ color: '#c53030' }}>
            Oops!
          </h1>
          <p className="text-secondary">{error}</p>
        </div>
      </main>
    )
  }

  if (!profile) {
    notFound()
  }

  const getSocialLinks = () => {
    const links = []
    
    if (profile.linkedin) {
      links.push({
        href: profile.linkedin,
        icon: Linkedin,
        label: 'LinkedIn',
        ariaLabel: 'Visit LinkedIn profile'
      })
    }
    
    if (profile.twitter_handle) {
      const handle = profile.twitter_handle.startsWith('@') 
        ? profile.twitter_handle.slice(1) 
        : profile.twitter_handle
      links.push({
        href: `https://twitter.com/${handle}`,
        icon: Twitter,
        label: 'Twitter',
        ariaLabel: 'Visit Twitter profile'
      })
    }
    
    if (profile.ig_handle) {
      const handle = profile.ig_handle.startsWith('@') 
        ? profile.ig_handle.slice(1) 
        : profile.ig_handle
      links.push({
        href: `https://instagram.com/${handle}`,
        icon: Instagram,
        label: 'Instagram',
        ariaLabel: 'Visit Instagram profile'
      })
    }
    
    if (profile.website) {
      links.push({
        href: profile.website,
        icon: Globe,
        label: 'Website',
        ariaLabel: 'Visit website'
      })
    }
    
    return links
  }

  const socialLinks = getSocialLinks()

  const truncateWalletAddress = (address: string) => {
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}…${address.slice(-8)}`
  }

  const copyToClipboard = async (text: string, walletType: 'evm' | 'solana') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedWallet(walletType)
      setTimeout(() => setCopiedWallet(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <main className="profile-page min-h-screen px-6 py-12" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 heading-handwritten">
            {profile.username}
          </h1>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-4 mt-6">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.ariaLabel}
                    className="social-icon-link"
                  >
                    <Icon size={20} strokeWidth={2} />
                  </a>
                )
              })}
            </div>
          )}

          {/* Wallet Addresses */}
          {(profile.evm_wallet_address || profile.solana_wallet_address) && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="card p-6" style={{ background: 'var(--background-secondary)' }}>
                <h2 className="text-xl font-semibold mb-4 text-center heading-handwritten">
                  Wallet Addresses
                </h2>
                <div className="space-y-3">
                  {profile.evm_wallet_address && (
                    <div>
                      <div className="text-sm font-medium text-secondary mb-1">EVM</div>
                      <button
                        onClick={() => copyToClipboard(profile.evm_wallet_address!, 'evm')}
                        className="w-full text-left group relative"
                        title="Click to copy full address"
                      >
                        <code className="text-sm bg-opacity-50 px-2 py-1 rounded inline-flex items-center gap-2 transition-colors group-hover:bg-opacity-70 cursor-pointer" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                          <span className="flex-1">{truncateWalletAddress(profile.evm_wallet_address)}</span>
                          {copiedWallet === 'evm' ? (
                            <Check size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Copy size={16} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          )}
                        </code>
                      </button>
                    </div>
                  )}
                  {profile.solana_wallet_address && (
                    <div>
                      <div className="text-sm font-medium text-secondary mb-1">Solana</div>
                      <button
                        onClick={() => copyToClipboard(profile.solana_wallet_address!, 'solana')}
                        className="w-full text-left group relative"
                        title="Click to copy full address"
                      >
                        <code className="text-sm bg-opacity-50 px-2 py-1 rounded inline-flex items-center gap-2 transition-colors group-hover:bg-opacity-70 cursor-pointer" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                          <span className="flex-1">{truncateWalletAddress(profile.solana_wallet_address)}</span>
                          {copiedWallet === 'solana' ? (
                            <Check size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Copy size={16} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          )}
                        </code>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tweets Section */}
        <div className="space-y-6">
          {profile.tweets && profile.tweets.length > 0 ? (
            <>
              <div className="flex flex-col gap-4">
                {profile.tweets.map((tweetItem, index) => (
                  <PublicTweetCard key={index} tweetItem={tweetItem} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
                nothing yet
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

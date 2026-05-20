'use client'

import Link from 'next/link'
import { Show, SignInButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import UsernameForm from '@/components/UsernameForm'
import ResumeForm from '@/components/ResumeForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import SocialLinksForm from '@/components/SocialLinksForm'
import WalletAddressesForm from '@/components/WalletAddressesForm'
import { FileText, Users, Shield, Sparkles, Code, Palette, TrendingUp, ExternalLink, Menu, X as CloseIcon } from 'lucide-react'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  type SidebarSection = 'profile' | 'username' | 'resume' | 'social' | 'wallet'

  const getActiveSection = (): SidebarSection => {
    if (showUpdateForm) return 'username'
    if (showResumeForm) return 'resume'
    if (showSocialForm) return 'social'
    if (showWalletForm) return 'wallet'
    return 'profile'
  }

  const handleSectionNav = (section: SidebarSection) => {
    const activeSection = getActiveSection()
    const nextSection = activeSection === section ? 'profile' : section

    setShowUpdateForm(nextSection === 'username')
    setShowResumeForm(nextSection === 'resume')
    setShowSocialForm(nextSection === 'social')
    setShowWalletForm(nextSection === 'wallet')
    closeSidebar()
  }

  const handleResetNav = () => {
    setShowResetDialog(true)
    closeSidebar()
  }

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
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Show when="signed-out">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Decorative icons */}
            <div className="flex justify-center items-center space-x-12 mb-8 opacity-60">
              <FileText className="w-6 h-6 text-charcoal-400 hand-drawn" strokeWidth={1} />
              <Sparkles className="w-8 h-8 text-sage-400 hand-drawn" strokeWidth={1} />
              <Users className="w-6 h-6 text-charcoal-400 hand-drawn" strokeWidth={1} />
            </div>

            {/* Main content */}
            <h1 className="text-4xl md:text-6xl font-noto font-light text-charcoal-800 mb-6 leading-tight">
              antiresume<br />
              <span className="font-medium text-sage-500">Leverage your digital footprint.</span>
            </h1>
            
            <p className="text-xl text-charcoal-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A resume is written by the author. The antiresume is built out of genuine interactions, public and real wins, and concrete online evidence of how impactful you are.
            </p>

            {/* CTA Button */}
            <div className="mb-16">
              <SignInButton>
                <button className="bg-charcoal-700 hover:bg-charcoal-800 text-matcha-cream font-zen text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Show your antiresume
                </button>
              </SignInButton>
            </div>

            {/* Subtle decorative line */}
            <div className="w-16 h-px bg-charcoal-300 mx-auto opacity-60"></div>
          </div>
        </section>

        {/* What is an antiresume Section */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-noto font-light text-charcoal-800 text-center mb-12">
              What&apos;s in an antiresume?
            </h2>
            
            <div className="space-y-8">
              {/* Component 1 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sage-200 rounded-xl flex items-center justify-center">
                  <span className="text-sage-500 font-noto font-medium">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-noto font-medium text-charcoal-800 mb-2">
                    Your impact
                  </h3>
                  <p className="text-charcoal-600 leading-relaxed">
                    Not bullet points about responsibilities written by the author — links to posts about real projects, code repositories, and things you&apos;ve shipped and impacts that you&apos;ve made.
                  </p>
                </div>
              </div>

              {/* Component 2 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sage-200 rounded-xl flex items-center justify-center">
                  <span className="text-sage-500 font-noto font-medium">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-noto font-medium text-charcoal-800 mb-2">
                    Social proof that matters
                  </h3>
                  <p className="text-charcoal-600 leading-relaxed">
                    Embed tweets from people who&apos;ve worked with you, used your products, or genuinely support your work.
                  </p>
                </div>
              </div>

              {/* Component 3 */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-sage-200 rounded-xl flex items-center justify-center">
                  <span className="text-sage-500 font-noto font-medium">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-noto font-medium text-charcoal-800 mb-2">
                    Your digital footprint
                  </h3>
                  <p className="text-charcoal-600 leading-relaxed">
                    Show your social links and what you&apos;ve shipped. Flex your digital footprint and public and real you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-sage-100/40">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-noto font-light text-charcoal-800 text-center mb-4">
              For Builders
            </h2>
            <p className="text-center text-charcoal-600 mb-12 max-w-2xl mx-auto">
              Whether you&apos;re engineering, designing, or trading — show your wins (and losses) the way they deserve to be shared.
            </p>

            <div className="space-y-6">
              {/* Engineers Card */}
              <div className="bg-matcha-cream border-2 border-sage-300 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-sage-200 rounded-xl flex items-center justify-center">
                    <Code className="w-6 h-6 text-sage-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-noto font-medium text-charcoal-800 mb-3">
                      For Engineers
                    </h3>
                    <p className="text-charcoal-600 leading-relaxed mb-3">
                      Stop sharing your best work in a PDF. Share the posts about your side projects blowing up, the shares by other legendary people, and the comments from people saying your code changed their life.
                    </p>
                    <p className="text-charcoal-600 leading-relaxed font-medium">
                      Flex <span className="text-sage-500 font-semibold">the product launches</span> that you were a part of and the numbers that it did online.
                    </p>
                  </div>
                </div>
              </div>

              {/* Designers Card */}
              <div className="bg-matcha-cream border-2 border-sage-300 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-sage-200 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-sage-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-noto font-medium text-charcoal-800 mb-3">
                      For Designers
                    </h3>
                    <p className="text-charcoal-600 leading-relaxed mb-3">
                      Traditional portfolios are static and boring. Share the public comments where people are blown away with your designs, posts of your designs going viral, and public online testimonials posted from clients who couldn&apos;t be happier.
                    </p>
                    <p className="text-charcoal-600 leading-relaxed font-medium">
                      Show your work and the numbers that it did online and the <span className="text-sage-500 font-semibold">real reactions</span> from amazing people.
                    </p>
                  </div>
                </div>
              </div>

              {/* Traders Card */}
              <div className="bg-matcha-cream border-2 border-sage-300 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-sage-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-sage-500" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-noto font-medium text-charcoal-800 mb-3">
                      For Traders
                    </h3>
                    <p className="text-charcoal-600 leading-relaxed mb-3">
                      Share your insane wins when you 10x a position. Share your brutal losses when the market humbled you but show it all with real post evidence online where you shared it all in real-time and with the post receipts. That can&apos;t be faked. 
                    </p>
                    <p className="text-charcoal-600 leading-relaxed font-medium">
                      <span className="text-sage-500 font-semibold">Flex your online receipts</span> where you were right on a thesis so early. 
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-matcha-light/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-noto font-light text-charcoal-800 text-center mb-4">
              Why antiresume?
            </h2>
            <p className="text-center text-charcoal-600 mb-12 max-w-2xl mx-auto">
              Your online presence tells the real story. Show what you&apos;ve actually built and who genuinely believes in you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-sage-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-noto font-medium text-charcoal-800 mb-3">
                  Real Projects
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  Display what you&apos;ve actually built. Link to your demo posts, the product launches, and just what you&apos;ve shipped.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-sage-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-noto font-medium text-charcoal-800 mb-3">
                  Genuine Vouches
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  Share posts from people who actually believe in you and your character and your work.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-sage-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-noto font-medium text-charcoal-800 mb-3">
                  Authentic Story
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  Your online presence is verifiable. No inflated titles, just real work and real impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example antiresumes Section */}
        <section className="py-12 px-6 bg-sage-50/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-noto font-light text-charcoal-800 mb-6">
              Example antiresumes
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/jarrensj"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-matcha-cream hover:bg-sage-100 text-charcoal-800 font-zen px-6 py-3 rounded-xl border-2 border-sage-300 hover:border-sage-400 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                /jarrensj
              </Link>
              <Link
                href="/jarrensj"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-matcha-cream hover:bg-sage-100 text-charcoal-800 font-zen px-6 py-3 rounded-xl border-2 border-sage-300 hover:border-sage-400 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                /jarrensj
              </Link>
              <Link
                href="/jarrensj"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-matcha-cream hover:bg-sage-100 text-charcoal-800 font-zen px-6 py-3 rounded-xl border-2 border-sage-300 hover:border-sage-400 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                /jarrensj
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-charcoal-200 bg-matcha-light/30">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-6 h-6 text-charcoal-600" strokeWidth={1.5} />
                  <span className="font-noto font-medium text-charcoal-800">antiresume</span>
                </div>
                <Link href="/" className="text-sm text-charcoal-600 leading-relaxed hover:text-sage-500 transition-colors">
                  build your antiresume
                </Link>
              </div>
              
              <div className="md:col-span-1">
                <h4 className="font-noto font-medium text-charcoal-800 mb-4">Socials</h4>
                <div className="space-y-2">
                  <a 
                    href="https://x.com/antiresume" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-charcoal-600 hover:text-sage-500 transition-colors"
                  >
                    X
                  </a>
                  <a 
                    href="https://instagram.com/antiresume" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-sm text-charcoal-600 hover:text-sage-500 transition-colors"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
            
            <div className="border-t border-charcoal-200 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
              <Link href="/" className="text-xs text-charcoal-500 mb-2 sm:mb-0 hover:text-sage-500 transition-colors">
                antiresume.com
              </Link>
              <div className="flex items-center space-x-1 text-xs text-charcoal-500">
                <span>Made with sushi</span>
              </div>
            </div>
          </div>
        </footer>
      </Show>

      <Show when="signed-in">
        {/* Hamburger Menu Button */}
        {userProfile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-6 left-6 z-50 p-2 rounded-lg bg-matcha-cream border-2 border-sage-300 hover:bg-sage-100 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <CloseIcon className="w-6 h-6 text-charcoal-700" /> : <Menu className="w-6 h-6 text-charcoal-700" />}
          </button>
        )}

          <DashboardSidebar
            sidebarOpen={sidebarOpen}
            onProfileClick={() => handleSectionNav('profile')}
            onUsernameClick={() => handleSectionNav('username')}
            onResumeClick={() => handleSectionNav('resume')}
            onSocialLinksClick={() => handleSectionNav('social')}
            onWalletsClick={() => handleSectionNav('wallet')}
            onResetClick={handleResetNav}
          />

        <div className="px-6 pt-32 pb-12 flex flex-col items-center justify-center">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 mx-auto loading-spinner"></div>
            <p className="mt-4 text-lg loading-text">
              Loading your space…
            </p>
          </div>
        ) : userProfile ? (
          // User has a profile - show dashboard or forms
          <div className="text-center max-w-3xl mx-auto w-full">
            {!showUpdateForm && !showResumeForm && !showSocialForm && !showWalletForm ? (
              // Show profile dashboard when no form is active
              <>
                <div className="mb-10">
                  <h1 className="text-5xl font-bold mb-3">
                    Welcome back, {userProfile.username}!
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Edit your profile
                  </p>
                </div>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-left space-y-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-foreground">Username:</span>
                        <span className="text-muted-foreground">{userProfile.username}</span>
                      </div>
                      <div className="flex items-center space-x-3 flex-wrap">
                        <span className="font-medium text-foreground">Profile URL:</span>
                        <a
                          href={`/${userProfile.username}`}
                          className="text-primary underline-offset-4 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          /{userProfile.username}
                        </a>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="secondary" asChild>
                        <a
                          href={`/${userProfile.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Public Profile
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Show only the active form
              <>
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
              </>
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
        </div>
      </Show>

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

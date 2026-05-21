'use client'

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 flex justify-end items-center px-6 py-4 gap-4 h-20 z-50" style={{ background: 'var(--background)' }}>
      <Show when="signed-out">
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <button className="px-4 py-2 font-medium rounded-lg transition-all duration-200" style={{ color: 'var(--foreground)', background: 'transparent', border: '1.5px solid var(--border-gentle)' }}>
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-5 py-2 font-medium rounded-lg transition-all duration-200 text-white" style={{ background: 'var(--accent-green)', border: '1.5px solid var(--accent-green)' }}>
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div>
          <UserButton />
        </div>
      </Show>
    </header>
  )
}


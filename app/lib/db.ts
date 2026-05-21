import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Create a Supabase client configured for use with Clerk
export function createClerkSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Types for our database
export interface Tweet {
  tweet_link: string
  notes?: string
}

export interface UserProfile {
  id: string
  clerk_user_id: string
  username: string
  email?: string
  linkedin?: string
  twitter_handle?: string
  ig_handle?: string
  website?: string
  evm_wallet_address?: string
  solana_wallet_address?: string
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  user_profile_id: string
  tweets: Tweet[]
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  user_profile_id: string
  s3_key: string
  caption: string | null
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  display_order: number
  created_at: string
  updated_at: string
}

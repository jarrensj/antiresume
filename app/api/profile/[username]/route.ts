import { NextRequest, NextResponse } from "next/server"
import { createClerkSupabaseClient } from "@/app/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get public profile data by username
    // We only return public information, not sensitive data like clerk_user_id
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, username, linkedin, twitter_handle, ig_handle, website, email, evm_wallet_address, solana_wallet_address, created_at')
      .eq('username', username.trim())
      .single()

    if (error && error.code === 'PGRST116') { // PGRST116 is "not found"
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // Get user's resume/tweets (public data)
    const { data: resume } = await supabase
      .from('resumes')
      .select('tweets, created_at')
      .eq('user_profile_id', profile.id)
      .single()

    return NextResponse.json({ 
      profile: {
        ...profile,
        tweets: resume?.tweets || [],
        resume_created_at: resume?.created_at
      }
    })

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


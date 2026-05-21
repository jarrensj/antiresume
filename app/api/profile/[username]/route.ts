import { NextRequest, NextResponse } from "next/server"
import { createClerkSupabaseClient } from "@/app/lib/db"
import { publicUrlForKey } from "@/app/lib/s3"

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
    // We only return public information, not sensitive data like clerk_user_id or email
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, username, linkedin, twitter_handle, ig_handle, website, evm_wallet_address, solana_wallet_address, created_at')
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

    // Get user's public photo gallery
    const { data: photoRows } = await supabase
      .from('photos')
      .select('id, s3_key, caption, width, height, display_order, created_at')
      .eq('user_profile_id', profile.id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    const photos = (photoRows ?? []).map((row) => ({
      id: row.id,
      url: publicUrlForKey(row.s3_key),
      caption: row.caption,
      width: row.width,
      height: row.height,
    }))

    return NextResponse.json({
      profile: {
        ...profile,
        tweets: resume?.tweets || [],
        resume_created_at: resume?.created_at,
        photos,
      },
    })

  } catch (error) {
    console.error('Error in profile API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


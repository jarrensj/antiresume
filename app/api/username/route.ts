import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/app/lib/db"
import { sanitizeSocialFields } from "@/app/lib/socials"

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json() as Record<string, unknown>
    const rawUsername = typeof body.username === "string" ? body.username : ""
    const trimmedUsername = rawUsername.trim()
    
    if (!trimmedUsername) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const socialFields = sanitizeSocialFields(body)

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', trimmedUsername)
      .single()
    
    if (existingUser) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Check if user already has a profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (userProfile) {
      // Update existing profile
      const timestamp = new Date().toISOString()
      const updateData: Record<string, string | null> = {
        username: trimmedUsername,
        updated_at: timestamp,
        username_last_changed_at: timestamp,
      }

      Object.assign(updateData, socialFields)

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('clerk_user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return NextResponse.json({ error: "Failed to update username" }, { status: 500 })
      }

      return NextResponse.json({ success: true, profile: data })
    } else {
      // Create new profile
      const timestamp = new Date().toISOString()
      const insertData: Record<string, string | null> = {
        clerk_user_id: userId,
        username: trimmedUsername,
        created_at: timestamp,
        updated_at: timestamp,
        username_last_changed_at: timestamp,
      }

      Object.assign(insertData, socialFields)

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return NextResponse.json({ error: "Failed to create username" }, { status: 500 })
      }

      return NextResponse.json({ success: true, profile: data })
    }

  } catch (error) {
    console.error('Error in username API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json() as Record<string, unknown>
    const rawUsername = typeof body.username === "string" ? body.username : ""
    const trimmedUsername = rawUsername.trim()
    
    if (!trimmedUsername) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const socialFields = sanitizeSocialFields(body)

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Check if the user has an existing profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('username, username_last_changed_at')
      .eq('clerk_user_id', userId)
      .single()

    if (!existingProfile) {
      return NextResponse.json({ error: "User profile not found. Please create a username first." }, { status: 404 })
    }

    // Check if the new username is different from current username
    if (existingProfile.username === trimmedUsername) {
      return NextResponse.json({ error: "New username must be different from current username" }, { status: 400 })
    }

    // Check if 3 days have passed since last username change
    if (existingProfile.username_last_changed_at) {
      const lastChanged = new Date(existingProfile.username_last_changed_at)
      const now = new Date()
      const threeDaysInMs = 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      const timeSinceLastChange = now.getTime() - lastChanged.getTime()
      
      if (timeSinceLastChange < threeDaysInMs) {
        const timeRemaining = threeDaysInMs - timeSinceLastChange
        const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000))
        const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000))
        
        let timeMessage: string
        if (daysRemaining > 1) {
          timeMessage = `${daysRemaining} days`
        } else if (hoursRemaining > 1) {
          timeMessage = `${hoursRemaining} hours`
        } else {
          timeMessage = "less than 1 hour"
        }
        
        return NextResponse.json({ 
          error: `You can only change your username once every 3 days. Please try again in ${timeMessage}.`,
          timeRemaining: timeRemaining
        }, { status: 429 })
      }
    }
    
    // Check if new username already exists (but not for current user)
    const { data: usernameExists } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', trimmedUsername)
      .neq('clerk_user_id', userId)
      .single()
    
    if (usernameExists) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Update the username and social media fields
    const timestamp = new Date().toISOString()
    const updateData: Record<string, string | null> = {
      username: trimmedUsername,
      updated_at: timestamp,
      username_last_changed_at: timestamp,
    }

    Object.assign(updateData, socialFields)

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data, message: "Profile updated successfully" })

  } catch (error) {
    console.error('Error in username PUT API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get user profile
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user profile:', error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: userProfile })

  } catch (error) {
    console.error('Error in username GET API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Get the user profile ID first
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Delete the user's resume first (if exists)
    await supabase
      .from('resumes')
      .delete()
      .eq('user_profile_id', userProfile.id)

    // Delete the user profile
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('clerk_user_id', userId)

    if (error) {
      console.error('Error deleting user profile:', error)
      return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Profile deleted successfully" })

  } catch (error) {
    console.error('Error in username DELETE API:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

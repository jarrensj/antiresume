import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/app/lib/db"

// Validation helpers
function validateUrl(url: string): boolean {
  if (!url.trim()) return true // Empty is valid (optional field)
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function validateLinkedIn(url: string): string | null {
  if (!url.trim()) return null // Empty is valid
  if (!validateUrl(url)) {
    return 'Please enter a valid LinkedIn URL'
  }
  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.includes('linkedin.com')) {
      return 'Please enter a valid LinkedIn URL from linkedin.com'
    }
  } catch {
    return 'Please enter a valid LinkedIn URL'
  }
  return null
}

function validateTwitterHandle(handle: string): string | null {
  if (!handle.trim()) return null // Empty is valid
  const cleanHandle = handle.trim().replace(/^@/, '')
  if (cleanHandle.length < 1 || cleanHandle.length > 15) {
    return 'Twitter handle must be 1-15 characters'
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleanHandle)) {
    return 'Twitter handle can only contain letters, numbers, and underscores'
  }
  return null
}

function validateInstagramHandle(handle: string): string | null {
  if (!handle.trim()) return null // Empty is valid
  const cleanHandle = handle.trim().replace(/^@/, '')
  if (cleanHandle.length < 1 || cleanHandle.length > 30) {
    return 'Instagram handle must be 1-30 characters'
  }
  if (!/^[a-zA-Z0-9_.]+$/.test(cleanHandle)) {
    return 'Instagram handle can only contain letters, numbers, underscores, and periods'
  }
  return null
}

function validateWebsite(url: string): string | null {
  if (!url.trim()) return null // Empty is valid
  if (!validateUrl(url)) {
    return 'Please enter a valid website URL (must include http:// or https://)'
  }
  return null
}

function validateSocialMediaFields(linkedin?: string, twitter_handle?: string, ig_handle?: string, website?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (linkedin) {
    const error = validateLinkedIn(linkedin)
    if (error) errors.push(error)
  }
  
  if (twitter_handle) {
    const error = validateTwitterHandle(twitter_handle)
    if (error) errors.push(error)
  }
  
  if (ig_handle) {
    const error = validateInstagramHandle(ig_handle)
    if (error) errors.push(error)
  }
  
  if (website) {
    const error = validateWebsite(website)
    if (error) errors.push(error)
  }
  
  return { valid: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = getAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { username, linkedin, twitter_handle, ig_handle, website } = await request.json()
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Validate social media fields
    const validation = validateSocialMediaFields(linkedin, twitter_handle, ig_handle, website)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('; ') }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username.trim())
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
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          username: username.trim(),
          linkedin: linkedin?.trim() || null,
          twitter_handle: twitter_handle?.trim() || null,
          ig_handle: ig_handle?.trim() || null,
          website: website?.trim() || null,
          updated_at: new Date().toISOString()
        })
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
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          clerk_user_id: userId,
          username: username.trim(),
          linkedin: linkedin?.trim() || null,
          twitter_handle: twitter_handle?.trim() || null,
          ig_handle: ig_handle?.trim() || null,
          website: website?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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

    // Parse the request body
    const { username, linkedin, twitter_handle, ig_handle, website } = await request.json()
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Validate social media fields
    const validation = validateSocialMediaFields(linkedin, twitter_handle, ig_handle, website)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('; ') }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient()
    
    // Check if the user has an existing profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('clerk_user_id', userId)
      .single()

    if (!existingProfile) {
      return NextResponse.json({ error: "User profile not found. Please create a username first." }, { status: 404 })
    }

    // Check if the new username is different from current username
    if (existingProfile.username === username.trim()) {
      return NextResponse.json({ error: "New username must be different from current username" }, { status: 400 })
    }
    
    // Check if new username already exists (but not for current user)
    const { data: usernameExists } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username.trim())
      .neq('clerk_user_id', userId)
      .single()
    
    if (usernameExists) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Update the username and social media fields
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        username: username.trim(),
        linkedin: linkedin?.trim() || null,
        twitter_handle: twitter_handle?.trim() || null,
        ig_handle: ig_handle?.trim() || null,
        website: website?.trim() || null,
        updated_at: new Date().toISOString()
      })
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

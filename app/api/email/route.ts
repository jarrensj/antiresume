import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/app/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClerkSupabaseClient()

    const { data, error } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("clerk_user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ email: null }, { status: 200 })
      }

      console.error("Error fetching email:", error)
      return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 })
    }

    return NextResponse.json({ email: data.email || null })
  } catch (error) {
    console.error("Error in email GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as { email?: string }
    const email = typeof body.email === 'string' ? body.email.trim() : null

    // Basic email validation
    if (email && email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }
    }

    const supabase = createClerkSupabaseClient()

    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single()

    if (fetchError || !existingProfile) {
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking user profile for email update:", fetchError)
      }
      return NextResponse.json({ error: "User profile not found. Please create a username first." }, { status: 404 })
    }

    const timestamp = new Date().toISOString()

    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        email: email || null,
        updated_at: timestamp,
      })
      .eq("clerk_user_id", userId)
      .select("email")
      .single()

    if (error) {
      console.error("Error updating email:", error)
      return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, email: data.email })
  } catch (error) {
    console.error("Error in email PUT API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

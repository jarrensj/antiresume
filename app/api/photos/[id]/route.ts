import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/app/lib/db'
import { deletePhotoKey } from '@/app/lib/s3'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Photo id is required' }, { status: 400 })

    const supabase = createClerkSupabaseClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('s3_key')
      .eq('id', id)
      .eq('user_profile_id', profile.id)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
      .eq('user_profile_id', profile.id)

    if (deleteError) {
      console.error('photos DELETE supabase error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
    }

    try {
      await deletePhotoKey(photo.s3_key)
    } catch (err) {
      console.error('photos DELETE s3 error (row already removed):', err)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('photos DELETE unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

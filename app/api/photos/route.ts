import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'
import { createClerkSupabaseClient, Photo } from '@/app/lib/db'
import { publicUrlForKey, uploadPhotoBuffer } from '@/app/lib/s3'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function serializePhoto(row: Photo) {
  return { ...row, url: publicUrlForKey(row.s3_key) }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClerkSupabaseClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    if (!profile) return NextResponse.json({ photos: [] })

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_profile_id', profile.id)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('photos GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
    }

    return NextResponse.json({ photos: (data ?? []).map(serializePhoto) })
  } catch (err) {
    console.error('photos GET unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file')
    const caption = formData.get('caption')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File exceeds ${MAX_BYTES / 1024 / 1024} MB limit` }, { status: 413 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, or GIF images are allowed' }, { status: 415 })
    }

    const supabase = createClerkSupabaseClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    if (!profile) {
      return NextResponse.json({ error: 'Create a username before uploading photos' }, { status: 404 })
    }

    const ext = EXT_BY_TYPE[file.type] ?? 'bin'
    const key = `users/${profile.id}/${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadPhotoBuffer(key, buffer, file.type)

    const { data: maxRow } = await supabase
      .from('photos')
      .select('display_order')
      .eq('user_profile_id', profile.id)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    const nextOrder = (maxRow?.display_order ?? -1) + 1

    const captionValue = typeof caption === 'string' ? caption.trim().slice(0, 500) : ''

    const { data: inserted, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_profile_id: profile.id,
        s3_key: key,
        caption: captionValue.length > 0 ? captionValue : null,
        mime_type: file.type,
        size_bytes: file.size,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (insertError || !inserted) {
      console.error('photos POST insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record uploaded photo' }, { status: 500 })
    }

    return NextResponse.json({ photo: serializePhoto(inserted) })
  } catch (err) {
    console.error('photos POST unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

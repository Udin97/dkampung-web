import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/session'

const BUCKET    = 'menu-images'
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED   = ['image/jpeg', 'image/png', 'image/webp']
const EXT       = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

function slug(s) {
  return (s || 'image')
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image'
}

export async function POST(request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' },
      { status: 500 }
    )
  }

  let form
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Tiada fail dipilih' }, { status: 400 })
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Hanya JPG, PNG atau WEBP dibenarkan' },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Saiz fail melebihi 2 MB (${(file.size / 1024 / 1024).toFixed(2)} MB)` },
      { status: 400 }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const path = `${Date.now()}-${slug(file.name)}.${EXT[file.type]}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 })
}

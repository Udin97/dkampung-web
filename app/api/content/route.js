import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

function auth(request) {
  const h = request.headers.get('Authorization') || ''
  return h.replace('Bearer ', '') === process.env.ADMIN_PASSWORD
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('page_content')
    .select('*')
    .order('page')
    .order('key')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data || [] })
}

export async function PUT(request) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
  }
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { page, key, value } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('page_content')
    .upsert({ page, key, value, updated_at: new Date().toISOString() }, { onConflict: 'page,key' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ content: data })
}

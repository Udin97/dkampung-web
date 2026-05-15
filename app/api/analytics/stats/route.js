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

export async function GET(request) {
  if (!auth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('page_visits')
    .select('page, referrer, visited_at')
    .order('visited_at', { ascending: false })
    .limit(2000)

  return NextResponse.json({ visits: data || [] })
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DEFAULT_BRANCHES = [
  { name: 'Taman Putra Perdana', address: 'Taman Putra Perdana, Puchong, Selangor', phone: '+60 14-386 0742', hours: 'Isnin – Ahad, 7:00 pagi – 11:00 malam', mapQuery: 'Taman Putra Perdana Puchong' },
  { name: 'Cyberjaya',           address: 'Cyberjaya, Selangor',                    phone: '+60 14-386 0742', hours: 'Isnin – Ahad, 7:00 pagi – 11:00 malam', mapQuery: 'Cyberjaya Selangor' },
  { name: 'Kota Warisan',        address: 'Kota Warisan, Sepang, Selangor',          phone: '+60 14-386 0742', hours: 'Isnin – Ahad, 7:00 pagi – 11:00 malam', mapQuery: 'Kota Warisan Selangor' },
]

function normalize(b) {
  if (typeof b === 'string') return { name: b, address: '', phone: '', hours: '', mapQuery: b }
  return { name: b.name || '', address: b.address || '', phone: b.phone || '', hours: b.hours || '', mapQuery: b.mapQuery || b.name || '' }
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase
      .from('page_content')
      .select('value')
      .eq('page', 'footer')
      .eq('key', 'branches')
      .single()

    if (error || !data?.value) {
      return NextResponse.json({ branches: DEFAULT_BRANCHES })
    }

    const parsed = JSON.parse(data.value)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json({ branches: DEFAULT_BRANCHES })
    }

    return NextResponse.json({ branches: parsed.map(normalize) })
  } catch {
    return NextResponse.json({ branches: DEFAULT_BRANCHES })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailHtml } from '@/lib/receipt'
import { isAdmin } from '@/lib/session'

// Create a server-side Supabase client (uses env vars directly — not exposed to browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

// POST /api/reservations — called when the booking form is submitted
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, date, time, pax, branch, notes } = body

    // Validate required fields
    if (!name || !email || !phone || !date || !time || !pax || !branch) {
      return NextResponse.json(
        { error: 'Sila isi semua maklumat yang diperlukan.' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const { data, error: dbError } = await supabase
      .from('reservations')
      .insert([{ name, email, phone, date, time, pax: parseInt(pax), branch, notes: notes || '' }])
      .select()
      .single()

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Ralat sistem. Sila cuba lagi.' }, { status: 500 })
    }

    // Send confirmation email (non-fatal — booking is saved even if email fails)
    try {
      await resend.emails.send({
        from: 'DKAMPUNG <onboarding@resend.dev>',
        to: [email],
        subject: `Pengesahan Tempahan DKAMPUNG — DK-${data.id.slice(0, 8).toUpperCase()}`,
        html: emailHtml(data),
      })
    } catch (emailErr) {
      console.error('Email error (non-fatal):', emailErr)
    }

    return NextResponse.json({ success: true, reservation: data }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Ralat tidak dijangka.' }, { status: 500 })
  }
}

// GET /api/reservations — admin only
export async function GET(request) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reservations: data })
}

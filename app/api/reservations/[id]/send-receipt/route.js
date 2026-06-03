import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailHtml } from '@/lib/receipt'
import { isAdmin } from '@/lib/session'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request, { params }) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: reservation, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !reservation) {
    return NextResponse.json({ error: 'Tempahan tidak dijumpai.' }, { status: 404 })
  }

  try {
    await resend.emails.send({
      from: 'DKAMPUNG <onboarding@resend.dev>',
      to: [reservation.email],
      subject: `E-Resit Tempahan DKAMPUNG — DK-${reservation.id.slice(0, 8).toUpperCase()}`,
      html: emailHtml(reservation, { isReceipt: true }),
    })
  } catch (err) {
    console.error('Send receipt error:', err)
    return NextResponse.json({ error: 'Gagal hantar emel. Sila cuba lagi.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Create a server-side Supabase client (uses env vars directly — not exposed to browser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

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
        subject: 'Pengesahan Tempahan DKAMPUNG 🍮',
        html: `
          <div style="font-family:'Jost',sans-serif;max-width:520px;margin:auto;padding:32px;background:#FEF9F0;border-radius:16px">
            <div style="text-align:center;margin-bottom:24px">
              <div style="display:inline-block;background:#1B4332;color:#C9A84C;font-size:22px;font-weight:900;padding:10px 20px;border-radius:10px;letter-spacing:3px">
                DKAMPUNG
              </div>
            </div>
            <h2 style="color:#5C3317;font-size:24px;margin-bottom:8px">Tempahan Diterima ✅</h2>
            <p style="color:#6B5744;margin-bottom:24px">
              Terima kasih, <strong>${name}</strong>. Tempahan anda telah kami terima dan sedang diproses.
            </p>
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden">
              <tr style="background:#1B4332">
                <td colspan="2" style="padding:12px 16px;color:#C9A84C;font-size:12px;letter-spacing:2px;font-weight:600;text-transform:uppercase">Butiran Tempahan</td>
              </tr>
              ${[
                ['Nama',      name],
                ['Tarikh',    date],
                ['Masa',      time],
                ['Cawangan',  branch],
                ['Telefon',   phone],
                ...(notes ? [['Pesanan', `<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;margin:0">${notes}</pre>`]] : []),
              ].map(([k, v], i) => `
                <tr style="background:${i % 2 === 0 ? '#FEF9F0' : '#fff'}">
                  <td style="padding:12px 16px;color:#6B5744;font-size:14px;width:120px">${k}</td>
                  <td style="padding:12px 16px;color:#1A1008;font-size:14px;font-weight:600">${v}</td>
                </tr>
              `).join('')}
            </table>
            <div style="margin-top:24px;padding:16px;background:#F5E6C8;border-radius:12px;font-size:13px;color:#5C3317">
              <strong>Nota:</strong> Kami akan menghubungi anda dalam masa 24 jam untuk pengesahan muktamad.
              Untuk pertanyaan segera, sila WhatsApp kami di
              <a href="https://wa.me/60143860742" style="color:#1B4332;font-weight:600">+60 14-386 0742</a>.
            </div>
            <p style="color:#6B5744;font-size:12px;margin-top:24px;text-align:center">
              © 2025 DKAMPUNG · Gion Master · Terima kasih kerana memilih kami!
            </p>
          </div>
        `,
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

// GET /api/reservations — called by the Admin page
export async function GET() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reservations: data })
}

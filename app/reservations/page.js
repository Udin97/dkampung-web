'use client'

import { useState } from 'react'
import Link from 'next/link'

const BRANCHES = [
  'Dapur Kampung Putra Perdana',
  'Dapur Kampung Cyberjaya',
  'Nasi Lemak Che Dil Cyberjaya',
]

const TIME_SLOTS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
]

const inputCls = `w-full bg-stone border border-brown/15 rounded-xl px-4 py-3 text-sm text-ink
  placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/20
  focus:border-forest/30 transition-all`

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-[0.78rem] font-semibold text-charcoal/70 mb-2 tracking-wide">
        {label} {required && <span className="text-terra">*</span>}
      </label>
      {children}
      {hint && <p className="text-[0.7rem] text-muted/60 mt-1.5">{hint}</p>}
    </div>
  )
}

export default function ReservationsPage() {
  const [form, setForm]     = useState({ name:'', email:'', phone:'', date:'', time:'', pax:'', branch:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Ralat tidak dijangka.')
      else { setSuccess(true); setForm({ name:'',email:'',phone:'',date:'',time:'',pax:'',branch:'',notes:'' }) }
    } catch {
      setError('Tiada sambungan internet. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone pt-[68px] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center py-20">
          <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-fraunces font-black text-4xl text-charcoal mb-3">Tempahan Diterima!</h1>
          <p className="text-muted mb-1.5 text-sm leading-relaxed">
            Terima kasih! Pengesahan telah dihantar ke emel anda.
          </p>
          <p className="text-muted/70 text-[0.82rem] mb-10 leading-relaxed">
            Kami akan menghubungi anda dalam 24 jam. Untuk pertanyaan segera, sila WhatsApp kami.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setSuccess(false)}
              className="bg-charcoal text-cream px-6 py-3 rounded-full font-semibold text-sm
                hover:bg-forest transition-colors">
              Buat Tempahan Lain
            </button>
            <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold text-sm">
              WhatsApp Kami
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone pt-[68px]">
      <div className="grid md:grid-cols-[360px_1fr] min-h-[calc(100vh-68px)]">

        {/* ── Left panel ── */}
        <div className="bg-charcoal relative overflow-hidden flex flex-col px-8 py-14 md:sticky md:top-[68px] md:h-[calc(100vh-68px)]">

          {/* Dot pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

          <div className="relative flex-1 flex flex-col">
            {/* Brand */}
            <div className="mb-10">
              <div className="text-[0.6rem] font-semibold tracking-[4px] uppercase text-gold/50 mb-4">
                Tempahan Online
              </div>
              <h1 className="font-fraunces font-black text-cream leading-[0.88] mb-4"
                style={{ fontSize: 'clamp(2.5rem,3.5vw,3.2rem)' }}>
                Buat<br />Tempahan
              </h1>
              <p className="text-cream/40 text-sm leading-relaxed">
                Isi borang dan kami akan menghubungi anda dalam 24 jam untuk pengesahan muktamad.
              </p>
            </div>

            {/* Info list */}
            <div className="space-y-5 mb-10">
              {[
                { icon: '⏱', title: 'Tempah 3 Hari Awal', desc: 'Untuk pastikan kuih tersedia segar.' },
                { icon: '🫓', title: 'Minimum 50 Biji',    desc: 'Setiap jenis kuih minimum 50 biji.' },
                { icon: '✉️', title: 'Pengesahan Email',   desc: 'Resit tempahan dihantar ke emel anda.' },
              ].map(i => (
                <div key={i.title} className="flex items-start gap-3.5">
                  <span className="text-xl opacity-60 mt-0.5">{i.icon}</span>
                  <div>
                    <div className="text-cream/70 text-sm font-semibold">{i.title}</div>
                    <div className="text-cream/35 text-xs leading-relaxed">{i.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact shortcut */}
            <div className="mt-auto pt-8 border-t border-white/8">
              <p className="text-cream/30 text-xs mb-3">Atau hubungi terus:</p>
              <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                +60 14-386 0742
              </a>
            </div>
          </div>
        </div>

        {/* ── Right: form ── */}
        <div className="px-6 md:px-12 py-12 max-w-2xl">

          {error && (
            <div className="bg-red-50 border border-red-200/60 text-red-700 rounded-2xl p-4 mb-8 text-sm flex items-start gap-3">
              <span className="text-red-500 text-base mt-0.5">!</span>
              {error}
            </div>
          )}

          {/* Section: Personal info */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-6 rounded-full bg-charcoal text-cream text-xs flex items-center justify-center font-semibold shrink-0">1</span>
              <h2 className="font-fraunces font-semibold text-xl text-charcoal">Maklumat Peribadi</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Field label="Nama Penuh" required>
                <input name="name" type="text" required value={form.name} onChange={set}
                  placeholder="Ahmad bin Ali" className={inputCls} />
              </Field>
              <Field label="No. WhatsApp" required>
                <input name="phone" type="tel" required value={form.phone} onChange={set}
                  placeholder="01X-XXXXXXX" className={inputCls} />
              </Field>
            </div>
            <Field label="Alamat Emel" required hint="Pengesahan tempahan akan dihantar ke sini.">
              <input name="email" type="email" required value={form.email} onChange={set}
                placeholder="contoh@email.com" className={inputCls} />
            </Field>
          </div>

          {/* Divider */}
          <div className="border-t border-brown/10 mb-10" />

          {/* Section: Booking details */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-6 rounded-full bg-charcoal text-cream text-xs flex items-center justify-center font-semibold shrink-0">2</span>
              <h2 className="font-fraunces font-semibold text-xl text-charcoal">Butiran Tempahan</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Field label="Tarikh Ambil" required hint="Minimum 3 hari dari sekarang.">
                <input name="date" type="date" required min={minDateStr} value={form.date} onChange={set}
                  className={inputCls} />
              </Field>
              <Field label="Masa Ambil" required>
                <select name="time" required value={form.time} onChange={set} className={inputCls}>
                  <option value="">-- Pilih masa --</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Field label="Bilangan (biji)" required hint="Minimum 50 biji per tempahan.">
                <input name="pax" type="number" required min="50" step="10" value={form.pax} onChange={set}
                  placeholder="Min. 50 biji" className={inputCls} />
              </Field>
              <Field label="Cawangan Ambil" required>
                <select name="branch" required value={form.branch} onChange={set} className={inputCls}>
                  <option value="">-- Pilih cawangan --</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Catatan Tambahan">
              <textarea name="notes" rows={3} value={form.notes} onChange={set}
                placeholder="Contoh: Campuran pandan dan coklat (25 biji setiap satu)..."
                className={`${inputCls} resize-none`} />
            </Field>
          </div>

          {/* Submit */}
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="w-full bg-charcoal text-cream py-4 rounded-full font-semibold text-[0.9rem]
              hover:bg-forest transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            {loading ? 'Menghantar...' : 'Hantar Tempahan →'}
          </button>

          <p className="text-center text-muted/60 text-xs mt-5 leading-relaxed">
            Dengan menghantar borang ini, anda bersetuju untuk dihubungi bagi tujuan pengesahan tempahan.
          </p>
        </div>
      </div>
    </div>
  )
}

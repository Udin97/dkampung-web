'use client'

import { useState } from 'react'

const BRANCHES = [
  {
    name:    'Taman Putra Perdana',
    address: 'Taman Putra Perdana, Puchong, Selangor',
    hours:   'Isnin – Ahad, 7:00 pagi – 11:00 malam',
    num:     '01',
    mapSrc:  'https://maps.google.com/maps?q=Taman+Putra+Perdana+Puchong&output=embed',
  },
  {
    name:    'Cyberjaya',
    address: 'Cyberjaya, Selangor',
    hours:   'Isnin – Ahad, 7:00 pagi – 11:00 malam',
    num:     '02',
    mapSrc:  'https://maps.google.com/maps?q=Cyberjaya+Selangor&output=embed',
  },
  {
    name:    'Kota Warisan',
    address: 'Kota Warisan, Selangor',
    hours:   'Isnin – Ahad, 7:00 pagi – 11:00 malam',
    num:     '03',
    mapSrc:  'https://maps.google.com/maps?q=Kota+Warisan+Selangor&output=embed',
  },
]

const inputCls = `w-full bg-stone border border-brown/15 rounded-xl px-4 py-3 text-sm text-ink
  placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/20
  focus:border-forest/30 transition-all`

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent]  = useState(false)

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const msg = encodeURIComponent(`Nama: ${form.name}\nEmel: ${form.email}\n\n${form.message}`)
    window.open(`https://wa.me/60143860742?text=${msg}`, '_blank')
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-stone pt-[68px]">

      {/* ── Header ── */}
      <div className="relative overflow-hidden py-20 text-center px-6"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1756133570715-1b931bfb4482?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="absolute inset-0 bg-charcoal/82" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative">
          <div className="text-gold/50 text-[0.62rem] tracking-[4px] uppercase mb-4">Hubungi Kami</div>
          <h1 className="font-fraunces font-black text-cream leading-none mb-5"
            style={{ fontSize: 'clamp(3rem,6vw,5rem)' }}>
            Cawangan & Kenalan
          </h1>
          <p className="text-cream/40 max-w-sm mx-auto text-[0.9rem] leading-relaxed">
            Kami sedia membantu melalui telefon, WhatsApp, atau borang di bawah.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* ── Quick contact strips ── */}
        <div className="grid md:grid-cols-3 gap-4 mb-20">
          {[
            {
              label: 'Telefon',
              value: '+60 14-386 0742',
              sub:   'Hubungi terus',
              href:  'tel:+60143860742',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              ),
            },
            {
              label: 'WhatsApp',
              value: 'Gion Master',
              sub:   'Balas segera',
              href:  'https://wa.me/60143860742',
              icon: (
                <svg className="w-5 h-5 fill-current stroke-none" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              ),
            },
            {
              label: 'Waktu Operasi',
              value: '7:00 pagi – 11:00 malam',
              sub:   'Isnin – Ahad',
              href:  null,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                </svg>
              ),
            },
          ].map(c => (
            <div key={c.label}
              className="group bg-white rounded-2xl p-6 border border-brown/8
                hover:border-forest/18 hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)]
                transition-all duration-200 active:scale-[0.97]">
              <div className="w-10 h-10 rounded-xl bg-forest/8 text-forest flex items-center justify-center mb-4
                group-hover:bg-forest group-hover:text-cream transition-all duration-200">
                {c.icon}
              </div>
              <div className="text-[0.65rem] text-muted/60 uppercase tracking-wide mb-1">{c.label}</div>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-charcoal hover:text-forest transition-colors text-[0.95rem] block">
                  {c.value}
                </a>
              ) : (
                <div className="font-semibold text-charcoal text-[0.95rem]">{c.value}</div>
              )}
              <div className="text-muted text-xs mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Branch locations ── */}
        <div className="mb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-3">Lokasi</div>
              <h2 className="font-fraunces font-black text-3xl text-charcoal">Cawangan Kami</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BRANCHES.map(b => (
              <div key={b.name}
                className="bg-white rounded-3xl overflow-hidden border border-brown/8
                  hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] transition-shadow duration-300 flex flex-col">

                {/* Card header with number */}
                <div className="bg-forest relative overflow-hidden px-6 py-7">
                  <div className="absolute right-4 bottom-0 font-fraunces font-black text-6xl text-white/5 leading-none select-none">
                    {b.num}
                  </div>
                  <div className="relative">
                    <div className="text-gold/60 text-[0.6rem] tracking-[3px] uppercase mb-2">Cawangan {b.num}</div>
                    <h3 className="font-fraunces font-semibold text-cream leading-tight text-[1.05rem]">
                      {b.name}
                    </h3>
                  </div>
                </div>

                {/* Map */}
                <div className="h-44 bg-stone">
                  <iframe src={b.mapSrc} width="100%" height="100%"
                    style={{ border: 0 }} allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Peta ${b.name}`} />
                </div>

                {/* Details */}
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <svg className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-muted text-xs leading-relaxed">{b.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
                    </svg>
                    <span className="text-muted text-xs">{b.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact form ── */}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-3">Mesej</div>
            <h2 className="font-fraunces font-black text-3xl text-charcoal mb-2">Hantar Mesej</h2>
            <p className="text-muted text-sm">Mesej anda akan dibuka terus dalam WhatsApp.</p>
          </div>

          {sent ? (
            <div className="bg-white border border-green-200/60 rounded-3xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-charcoal mb-1.5">Mesej berjaya dibuka di WhatsApp!</p>
              <p className="text-muted text-sm mb-6">Sila hantar mesej dalam WhatsApp yang terbuka.</p>
              <button onClick={() => setSent(false)}
                className="text-sm text-forest font-semibold hover:text-terra transition-colors">
                Hantar mesej lain →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-brown/8 space-y-5">
              <div>
                <label className="block text-[0.78rem] font-semibold text-charcoal/70 mb-2 tracking-wide">
                  Nama <span className="text-terra">*</span>
                </label>
                <input name="name" type="text" required value={form.name} onChange={set}
                  placeholder="Nama anda" className={inputCls} />
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold text-charcoal/70 mb-2 tracking-wide">
                  Emel <span className="text-terra">*</span>
                </label>
                <input name="email" type="email" required value={form.email} onChange={set}
                  placeholder="emel@anda.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold text-charcoal/70 mb-2 tracking-wide">
                  Mesej <span className="text-terra">*</span>
                </label>
                <textarea name="message" rows={4} required value={form.message} onChange={set}
                  placeholder="Ceritakan keperluan anda..."
                  className={`${inputCls} resize-none`} />
              </div>
              <button type="submit"
                className="w-full bg-[#25D366] text-white py-4 rounded-full font-semibold text-sm
                  hover:opacity-90 transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Hantar via WhatsApp →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

const BRANCHES = [
  {
    name:    'Dapur Kampung Putra Perdana',
    address: 'Taman Putra Perdana, Puchong, Selangor',
    hours:   'Isnin – Ahad, 8:00 pagi – Petang',
    color:   'bg-forest',
    mapSrc:  'https://maps.google.com/maps?q=Taman+Putra+Perdana+Puchong&output=embed',
  },
  {
    name:    'Dapur Kampung Cyberjaya',
    address: 'Cyberjaya, Selangor',
    hours:   'Isnin – Ahad, 8:00 pagi – Petang',
    color:   'bg-forest2',
    mapSrc:  'https://maps.google.com/maps?q=Cyberjaya+Selangor&output=embed',
  },
  {
    name:    'Nasi Lemak Che Dil Cyberjaya',
    address: 'Cyberjaya, Selangor',
    hours:   'Isnin – Ahad, 8:00 pagi – Petang',
    color:   'bg-sage',
    mapSrc:  'https://maps.google.com/maps?q=Cyberjaya+Selangor&output=embed',
  },
]

const inputClass = "w-full border border-brown/20 rounded-xl px-4 py-3 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/30 transition"

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent]  = useState(false)

  const set = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const msg = encodeURIComponent(`Nama: ${form.name}\nEmel: ${form.email}\n\n${form.message}`)
    window.open(`https://wa.me/60143860742?text=${msg}`, '_blank')
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-cream pt-[70px]">
      {/* Header */}
      <div className="bg-forest py-14 text-center px-6">
        <div className="text-gold/60 text-[0.7rem] tracking-[3px] uppercase mb-3">Hubungi Kami</div>
        <h1 className="font-fraunces font-black text-5xl text-cream mb-3">Cawangan & Kenalan</h1>
        <p className="text-cream/60 max-w-sm mx-auto">Kami sedia membantu. Hubungi kami melalui telefon, WhatsApp, atau borang di bawah.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Quick contact */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: '📞', label: 'Telefon',         value: '+60 14-386 0742',         href: 'tel:+60143860742' },
            { icon: '💬', label: 'WhatsApp',         value: 'Said Hashim',             href: 'https://wa.me/60143860742' },
            { icon: '🕗', label: 'Waktu Operasi',    value: 'Isnin–Ahad · 8am–Petang', href: null },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-6 border border-brown/8 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="text-muted text-xs uppercase tracking-wide mb-1">{c.label}</div>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer"
                  className="font-semibold text-forest hover:text-terra transition-colors">
                  {c.value}
                </a>
              ) : (
                <div className="font-semibold text-forest">{c.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Branch locations */}
        <h2 className="font-fraunces font-bold text-3xl text-forest mb-8">Lokasi Cawangan</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {BRANCHES.map(b => (
            <div key={b.name} className="bg-white rounded-2xl overflow-hidden border border-brown/8 flex flex-col">
              <div className={`${b.color} p-5`}>
                <h3 className="font-fraunces font-semibold text-lg text-cream">{b.name}</h3>
              </div>
              <div className="h-48">
                <iframe src={b.mapSrc} width="100%" height="100%"
                  style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Peta ${b.name}`} />
              </div>
              <div className="p-5">
                <p className="text-muted text-sm mb-1">📍 {b.address}</p>
                <p className="text-muted text-sm">🕗 {b.hours}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="max-w-xl mx-auto">
          <h2 className="font-fraunces font-bold text-3xl text-forest mb-2 text-center">Hantar Mesej</h2>
          <p className="text-center text-muted text-sm mb-8">Mesej anda akan dibuka terus dalam WhatsApp.</p>
          {sent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <p className="font-semibold mb-1">Mesej berjaya dibuka di WhatsApp!</p>
              <p className="text-sm mb-4">Sila hantar mesej dalam WhatsApp yang terbuka.</p>
              <button onClick={() => setSent(false)} className="text-sm text-green-600 underline">
                Hantar mesej lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-brown/8">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-brown2 mb-2">Nama <span className="text-terra">*</span></label>
                <input name="name" type="text" required value={form.name} onChange={set}
                  placeholder="Nama anda" className={inputClass} />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-brown2 mb-2">Emel <span className="text-terra">*</span></label>
                <input name="email" type="email" required value={form.email} onChange={set}
                  placeholder="emel@anda.com" className={inputClass} />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-brown2 mb-2">Mesej <span className="text-terra">*</span></label>
                <textarea name="message" rows={4} required value={form.message} onChange={set}
                  placeholder="Ceritakan keperluan anda..."
                  className={`${inputClass} resize-none`} />
              </div>
              <button type="submit"
                className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity">
                💬 Hantar via WhatsApp →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

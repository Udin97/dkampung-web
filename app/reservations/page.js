'use client'

import { useState } from 'react'
import Link from 'next/link'

const BRANCHES = [
  'Dapur Kampung Putra Perdana',
  'Dapur Kampung Cyberjaya',
  'Nasi Lemak Che Dil Cyberjaya',
]

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
]

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brown2 mb-2">
        {label} {required && <span className="text-terra">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = "w-full border border-brown/20 rounded-xl px-4 py-3 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-forest/30 transition"

export default function ReservationsPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    date: '', time: '', pax: '',
    branch: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  const set = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ralat tidak dijangka. Sila cuba lagi.')
      } else {
        setSuccess(true)
        setForm({ name:'', email:'', phone:'', date:'', time:'', pax:'', branch:'', notes:'' })
      }
    } catch {
      setError('Tiada sambungan internet. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream pt-[70px] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center py-20">
          <div className="text-7xl mb-6">✅</div>
          <h1 className="font-fraunces font-black text-4xl text-forest mb-4">Tempahan Diterima!</h1>
          <p className="text-muted mb-2">Terima kasih! Pengesahan telah dihantar ke emel anda.</p>
          <p className="text-muted text-sm mb-10">Kami akan menghubungi anda dalam 24 jam. Untuk pertanyaan segera, sila WhatsApp kami.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setSuccess(false)}
              className="bg-forest text-cream px-6 py-3 rounded-lg font-semibold hover:bg-brown transition-colors">
              Buat Tempahan Lain
            </button>
            <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-[70px]">
      {/* Header */}
      <div className="bg-forest py-14 text-center px-6">
        <div className="text-gold/60 text-[0.7rem] tracking-[3px] uppercase mb-3">Tempahan Online</div>
        <h1 className="font-fraunces font-black text-5xl text-cream mb-3">Buat Tempahan</h1>
        <p className="text-cream/60 max-w-sm mx-auto">Isi borang di bawah. Kami akan menghubungi anda dalam 24 jam untuk pengesahan.</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-brown/8 p-8 md:p-10">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Personal info */}
          <h2 className="font-fraunces font-semibold text-xl text-brown mb-6 pb-2 border-b border-brown/10">
            Maklumat Peribadi
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Field label="Nama Penuh" required>
              <input name="name" type="text" required value={form.name} onChange={set}
                placeholder="Ahmad bin Ali" className={inputClass} />
            </Field>
            <Field label="No. WhatsApp" required>
              <input name="phone" type="tel" required value={form.phone} onChange={set}
                placeholder="01X-XXXXXXX" className={inputClass} />
            </Field>
          </div>
          <div className="mb-8">
            <Field label="Alamat Emel" required>
              <input name="email" type="email" required value={form.email} onChange={set}
                placeholder="contoh@email.com" className={inputClass} />
            </Field>
          </div>

          {/* Booking details */}
          <h2 className="font-fraunces font-semibold text-xl text-brown mb-6 pb-2 border-b border-brown/10">
            Butiran Tempahan
          </h2>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Field label="Tarikh Ambil" required>
              <input name="date" type="date" required min={minDateStr} value={form.date} onChange={set}
                className={inputClass} />
            </Field>
            <Field label="Masa Ambil" required>
              <select name="time" required value={form.time} onChange={set} className={inputClass}>
                <option value="">-- Pilih masa --</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Field label="Bilangan (biji)" required>
              <input name="pax" type="number" required min="50" step="10" value={form.pax} onChange={set}
                placeholder="Min. 50 biji" className={inputClass} />
            </Field>
            <Field label="Cawangan Ambil" required>
              <select name="branch" required value={form.branch} onChange={set} className={inputClass}>
                <option value="">-- Pilih cawangan --</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>
          <div className="mb-8">
            <Field label="Catatan Tambahan">
              <textarea name="notes" rows={3} value={form.notes} onChange={set}
                placeholder="Contoh: Campuran pandan dan coklat (25 biji setiap satu)..."
                className={`${inputClass} resize-none`} />
            </Field>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-forest text-cream py-4 rounded-xl font-semibold text-base hover:bg-brown transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Menghantar...' : 'Hantar Tempahan →'}
          </button>

          <p className="text-center text-muted text-xs mt-4 leading-relaxed">
            Tempahan perlu dibuat sekurang-kurangnya 3 hari lebih awal. Minimum 50 biji setiap tempahan.
          </p>
        </form>

        {/* Alternative contact */}
        <div className="mt-8 text-center">
          <p className="text-muted text-sm mb-3">Atau hubungi kami terus:</p>
          <div className="flex gap-3 justify-center">
            <a href="tel:+60143860742"
              className="inline-flex items-center gap-2 border border-brown/20 text-brown2 px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-forest hover:text-forest transition-colors">
              📞 +60 14-386 0742
            </a>
            <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'

const BRANCHES = [
  'Taman Putra Perdana',
  'Cyberjaya',
  'Kota Warisan',
]

const TIME_SLOTS = [
  '7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
  '6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM',
]

const MENU_FALLBACK = [
  { id: 'apam', category: 'Kuih Kukus', emoji: '🫓', items: [
    { name: 'Apam Putih',  price: 1.50, min: 50 },
    { name: 'Apam Pandan', price: 1.50, min: 50 },
    { name: 'Apam Keladi', price: 1.60, min: 50 },
  ]},
  { id: 'kaswi', category: 'Kaswi', emoji: '🍮', items: [
    { name: 'Kaswi Jagung', price: 1.80, min: 50 },
    { name: 'Kaswi Pandan', price: 1.80, min: 50 },
    { name: 'Kaswi Coklat', price: 1.80, min: 50 },
    { name: 'Kaswi Ubi',    price: 1.80, min: 50 },
  ]},
  { id: 'santan', category: 'Kuih Santan', emoji: '🥥', items: [
    { name: 'Tepung Pelita',  price: 2.00, min: 50 },
    { name: 'Kuih Talam',     price: 2.00, min: 50 },
    { name: 'Serimuka Pulut', price: 2.50, min: 50 },
  ]},
  { id: 'nasi', category: 'Nasi & Hidangan', emoji: '🍚', items: [
    { name: 'Nasi Lemak Che Dil', price: 5.00, min: 1 },
  ]},
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
  const [form, setForm]         = useState({ name:'', email:'', phone:'', date:'', time:'', branch:'' })
  const [orderItems, setOrderItems] = useState({})
  const [specialNote, setSpecialNote] = useState('')
  const [menu, setMenu]         = useState(MENU_FALLBACK)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [confirming, setConfirming] = useState(false)
  const [sent, setSent]         = useState(false)

  useEffect(() => {
    if (!confirming) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [confirming])

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.items?.length) return
        const map = {}
        data.items.forEach(item => {
          const catId = item.category_id || 'other'
          if (!map[catId]) {
            map[catId] = {
              id: catId,
              category: item.category_name,
              emoji: item.category_emoji || '🍽',
              items: [],
            }
          }
          map[catId].items.push({
            name:  item.name,
            price: parseFloat(item.price),
            min:   item.min_order || 50,
          })
        })
        const groups = Object.values(map)
        if (groups.length) setMenu(groups)
      })
      .catch(() => {})
  }, [])

  const itemMap = useMemo(() => {
    const m = {}
    menu.forEach(cat => cat.items.forEach(item => { m[item.name] = item }))
    return m
  }, [menu])

  const totalQty   = Object.values(orderItems).reduce((s, q) => s + q, 0)
  const totalPrice = Object.entries(orderItems).reduce((s, [name, q]) => s + q * (itemMap[name]?.price || 0), 0)

  const increment = (name, min) => {
    setOrderItems(p => {
      const cur  = p[name] || 0
      const step = min >= 50 ? 10 : 1
      return { ...p, [name]: cur === 0 ? step : cur + step }
    })
  }

  const decrement = (name, min) => {
    setOrderItems(p => {
      const cur = p[name] || 0
      if (cur === 0) return p
      const step = min >= 50 ? 10 : 1
      const next = cur - step
      if (next <= 0) {
        const updated = { ...p }
        delete updated[name]
        return updated
      }
      return { ...p, [name]: next }
    })
  }

  const set = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleReview = e => {
    e?.preventDefault?.()
    setError('')

    if (!form.name || !form.phone || !form.email || !form.date || !form.time || !form.branch) {
      setError('Sila lengkapkan semua maklumat yang diperlukan.')
      return
    }

    if (totalQty === 0) {
      setError('Sila pilih sekurang-kurangnya satu item menu.')
      return
    }

    if (totalQty < 50) {
      setError('Jumlah minimum tempahan ialah 50 biji.')
      return
    }

    setConfirming(true)
  }

  const handleConfirm = async () => {
    setError('')
    const orderLines = Object.entries(orderItems)
      .map(([name, qty]) => `• ${name} × ${qty} biji — RM ${(qty * (itemMap[name]?.price || 0)).toFixed(2)}`)
      .join('\n')
    const notes = `PESANAN:\n${orderLines}\nJumlah: ${totalQty} biji | Anggaran: RM ${totalPrice.toFixed(2)}${specialNote ? `\nNota: ${specialNote}` : ''}`

    setLoading(true)
    try {
      const res  = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pax: totalQty, notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Ralat tidak dijangka.')
        setLoading(false)
        return
      }
      setSent(true)
      setLoading(false)
      setTimeout(() => {
        setSuccess(true)
        setConfirming(false)
        setSent(false)
        setForm({ name:'', email:'', phone:'', date:'', time:'', branch:'' })
        setOrderItems({})
        setSpecialNote('')
      }, 1600)
    } catch {
      setError('Tiada sambungan internet. Sila cuba lagi.')
      setLoading(false)
    }
  }

  const fmtDate = d => {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString('ms-MY', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    } catch { return d }
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

      {/* ── Confirmation modal ── */}
      {confirming && (
        <div className="fixed inset-0 z-[60] bg-charcoal/55 backdrop-blur-sm flex items-center justify-center p-4
          animate-fadeIn"
          onClick={loading || sent ? undefined : () => setConfirming(false)}>
          <div onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto
              shadow-[0_24px_80px_rgba(0,0,0,0.25)] animate-popIn">

            {sent ? (
              /* Success animation view */
              <div className="px-8 py-14 text-center">
                <div className="relative w-24 h-24 mx-auto mb-7">
                  <span className="absolute inset-0 rounded-full bg-forest/25 animate-ping" />
                  <span className="absolute inset-0 rounded-full bg-forest flex items-center justify-center animate-scaleIn">
                    <svg className="w-12 h-12" viewBox="0 0 52 52" fill="none">
                      <path d="M14 27 L23 36 L40 18" stroke="white" strokeWidth="4"
                        strokeLinecap="round" strokeLinejoin="round" className="animate-drawCheck" />
                    </svg>
                  </span>
                </div>
                <h2 className="font-fraunces font-black text-2xl text-charcoal mb-2 animate-fadeUpDelay">
                  Tempahan Dihantar!
                </h2>
                <p className="text-muted text-sm leading-relaxed animate-fadeUpDelay">
                  Kami akan hubungi anda tidak lama lagi.
                </p>
              </div>
            ) : (
              /* Details review view */
              <>
                <div className="px-6 py-5 border-b border-brown/8 flex items-center justify-between">
                  <div>
                    <div className="text-[0.62rem] font-semibold tracking-[3px] uppercase text-gold mb-1">Semakan</div>
                    <h2 className="font-fraunces font-black text-xl text-charcoal">Sahkan Tempahan Anda</h2>
                  </div>
                  <button type="button" onClick={() => setConfirming(false)} disabled={loading}
                    className="w-9 h-9 rounded-full hover:bg-stone flex items-center justify-center text-muted
                      disabled:opacity-30 transition-colors" aria-label="Tutup">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Customer */}
                  <section>
                    <div className="text-[0.6rem] font-semibold tracking-[2.5px] uppercase text-muted mb-2.5">Maklumat Pelanggan</div>
                    <div className="bg-stone/60 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                      <div className="flex justify-between gap-3"><span className="text-muted">Nama</span><span className="text-charcoal font-medium text-right">{form.name}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-muted">WhatsApp</span><span className="text-charcoal font-medium text-right">{form.phone}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-muted">Emel</span><span className="text-charcoal font-medium text-right break-all">{form.email}</span></div>
                    </div>
                  </section>

                  {/* Booking */}
                  <section>
                    <div className="text-[0.6rem] font-semibold tracking-[2.5px] uppercase text-muted mb-2.5">Butiran Tempahan</div>
                    <div className="bg-stone/60 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                      <div className="flex justify-between gap-3"><span className="text-muted">Cawangan</span><span className="text-charcoal font-medium text-right">{form.branch}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-muted">Tarikh</span><span className="text-charcoal font-medium text-right">{fmtDate(form.date)}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-muted">Masa</span><span className="text-charcoal font-medium text-right">{form.time}</span></div>
                    </div>
                  </section>

                  {/* Items */}
                  <section>
                    <div className="text-[0.6rem] font-semibold tracking-[2.5px] uppercase text-muted mb-2.5 flex items-center justify-between">
                      <span>Senarai Kuih</span>
                      <span className="text-charcoal/60">{totalQty} biji</span>
                    </div>
                    <div className="bg-stone/60 rounded-xl divide-y divide-brown/8">
                      {Object.entries(orderItems).map(([name, qty]) => {
                        const price    = itemMap[name]?.price || 0
                        const subtotal = qty * price
                        return (
                          <div key={name} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <div className="min-w-0 flex-1">
                              <div className="text-charcoal font-medium truncate">{name}</div>
                              <div className="text-muted text-xs">{qty} × RM {price.toFixed(2)}</div>
                            </div>
                            <div className="text-forest font-semibold text-sm shrink-0">RM {subtotal.toFixed(2)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </section>

                  {/* Total */}
                  <section className="bg-charcoal rounded-2xl px-5 py-4 flex items-center justify-between">
                    <span className="text-cream/60 text-xs uppercase tracking-wider font-semibold">Jumlah Keseluruhan</span>
                    <span className="text-gold font-fraunces font-black text-2xl">RM {totalPrice.toFixed(2)}</span>
                  </section>

                  {/* Notes */}
                  {specialNote && (
                    <section>
                      <div className="text-[0.6rem] font-semibold tracking-[2.5px] uppercase text-muted mb-2.5">Nota Khas</div>
                      <div className="bg-stone/60 rounded-xl px-4 py-3 text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
                        {specialNote}
                      </div>
                    </section>
                  )}

                  {/* Inline error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200/60 text-red-700 rounded-xl p-3 text-xs flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">!</span>
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-brown/8 flex gap-2.5 sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setConfirming(false)} disabled={loading}
                    className="flex-1 border border-brown/20 text-charcoal px-4 py-3 rounded-full font-semibold text-sm
                      hover:bg-stone transition-all duration-150 active:scale-[0.96] disabled:opacity-40">
                    Edit Semula
                  </button>
                  <button type="button" onClick={handleConfirm} disabled={loading}
                    className="flex-[1.4] bg-charcoal text-cream px-4 py-3 rounded-full font-semibold text-sm
                      hover:bg-forest transition-all duration-150 active:scale-[0.96] disabled:opacity-50
                      flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-[1.5px] border-cream/30 border-t-cream rounded-full animate-spin" />
                        Menghantar...
                      </>
                    ) : (
                      <>Sahkan & Hantar →</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[360px_1fr] min-h-[calc(100vh-68px)]">

        {/* ── Left panel ── */}
        <div className="relative overflow-hidden flex flex-col px-8 py-14 md:sticky md:top-[68px] md:h-[calc(100vh-68px)]"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1566469503247-ea0307a39dee?w=800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
          <div className="absolute inset-0 bg-charcoal/88" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div className="relative flex-1 flex flex-col overflow-y-auto">
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

            <div className="space-y-5 mb-10">
              {[
                {
                  icon: <svg className="w-5 h-5 text-gold/60 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                  title: 'Tempah 3 Hari Awal',
                  desc: 'Untuk pastikan kuih tersedia segar.',
                },
                {
                  icon: <svg className="w-5 h-5 text-gold/60 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>,
                  title: 'Minimum 50 Biji',
                  desc: 'Jumlah keseluruhan minimum 50 biji.',
                },
                {
                  icon: <svg className="w-5 h-5 text-gold/60 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>,
                  title: 'Pengesahan Email',
                  desc: 'Resit tempahan dihantar ke emel anda.',
                },
              ].map(i => (
                <div key={i.title} className="flex items-start gap-3.5">
                  {i.icon}
                  <div>
                    <div className="text-cream/70 text-sm font-semibold">{i.title}</div>
                    <div className="text-cream/35 text-xs leading-relaxed">{i.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live order summary */}
            {totalQty > 0 && (
              <div className="bg-white/5 rounded-2xl px-5 py-4 mb-6 border border-white/8">
                <div className="text-[0.6rem] font-semibold tracking-[3px] uppercase text-gold/60 mb-2">Ringkasan</div>
                <div className="text-cream font-semibold">{totalQty} biji</div>
                <div className="text-gold font-bold text-2xl font-fraunces">RM {totalPrice.toFixed(2)}</div>
              </div>
            )}

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

          {/* Section 1: Personal info */}
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

          <div className="border-t border-brown/10 mb-10" />

          {/* Section 2: Booking details */}
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
            <Field label="Cawangan Ambil" required>
              <select name="branch" required value={form.branch} onChange={set} className={inputCls}>
                <option value="">-- Pilih cawangan --</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>

          <div className="border-t border-brown/10 mb-10" />

          {/* Section 3: Menu selection */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-6 rounded-full bg-charcoal text-cream text-xs flex items-center justify-center font-semibold shrink-0">3</span>
              <h2 className="font-fraunces font-semibold text-xl text-charcoal">Pilihan Menu</h2>
            </div>

            <div className="space-y-5">
              {menu.map(cat => (
                <div key={cat.id} className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
                  <div className="px-5 py-3 border-b border-brown/6 flex items-center gap-2 bg-stone/50">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-fraunces font-semibold text-charcoal text-sm">{cat.category}</span>
                  </div>
                  <div className="divide-y divide-brown/5">
                    {cat.items.map(item => {
                      const qty = orderItems[item.name] || 0
                      return (
                        <div key={item.name}
                          className="flex items-center gap-3 px-5 py-3.5">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-charcoal">{item.name}</div>
                            <div className="text-xs text-muted mt-0.5">
                              RM {parseFloat(item.price).toFixed(2)} / biji
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button"
                              onClick={() => decrement(item.name, item.min)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-full border border-brown/20 flex items-center justify-center
                                text-charcoal hover:bg-stone disabled:opacity-25 transition-all duration-100 active:scale-[0.88] font-bold text-sm">
                              −
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-charcoal tabular-nums">
                              {qty}
                            </span>
                            <button type="button"
                              onClick={() => increment(item.name, item.min)}
                              className="w-7 h-7 rounded-full bg-charcoal text-cream flex items-center justify-center
                                hover:bg-forest transition-all duration-100 active:scale-[0.88] font-bold text-sm">
                              +
                            </button>
                          </div>
                          <div className="w-16 text-right shrink-0">
                            {qty > 0 && (
                              <span className="text-xs font-semibold text-forest">
                                RM {(qty * item.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Total bar */}
            {totalQty > 0 && (
              <div className="mt-5 bg-charcoal rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-cream/50 text-xs">Jumlah Pesanan</div>
                  <div className="text-cream font-semibold text-sm">{totalQty} biji</div>
                </div>
                <div className="text-right">
                  <div className="text-cream/50 text-xs">Anggaran Harga</div>
                  <div className="text-gold font-bold text-xl font-fraunces">RM {totalPrice.toFixed(2)}</div>
                </div>
              </div>
            )}

            {/* Special note */}
            <div className="mt-5">
              <label className="block text-[0.78rem] font-semibold text-charcoal/70 mb-2 tracking-wide">
                Nota Khas <span className="text-muted font-normal text-xs">(pilihan)</span>
              </label>
              <textarea rows={2} value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                placeholder="Contoh: Campuran pandan dan coklat (25 biji setiap satu)..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Submit */}
          <button type="button" onClick={handleReview} disabled={loading}
            className="w-full bg-charcoal text-cream py-4 rounded-full font-semibold text-[0.9rem]
              hover:bg-forest transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            Semak & Hantar Tempahan →
          </button>

          <p className="text-center text-muted/60 text-xs mt-5 leading-relaxed">
            Dengan menghantar borang ini, anda bersetuju untuk dihubungi bagi tujuan pengesahan tempahan.
          </p>
        </div>
      </div>
    </div>
  )
}

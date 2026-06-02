'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { printHtml } from '@/lib/receipt'

// ── helpers ───────────────────────────────────────────────────────────────────
function parsePrice(notes) {
  const m = notes?.match(/Anggaran: RM ([\d.]+)/)
  return m ? parseFloat(m[1]) : null
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
function safeHost(url) {
  if (!url) return 'Langsung'
  try { return new URL(url).hostname || 'Langsung' } catch { return 'Langsung' }
}

const STATUS_CLS = {
  pending:          'bg-amber-50  text-amber-700  border-amber-200',
  confirmed:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  ready_for_pickup: 'bg-teal-50   text-teal-700   border-teal-200',
  completed:        'bg-blue-50   text-blue-700   border-blue-200',
  cancelled:        'bg-red-50    text-red-600    border-red-200',
}

const STATUS_LABEL = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  ready_for_pickup: 'Siap Ambil',
  completed:        'Selesai',
  cancelled:        'Cancelled',
}

// ── SVG Charts ────────────────────────────────────────────────────────────────
function AreaChart({ data }) {
  if (!data.length) return null
  const W = 600, H = 110, px = 6, py = 8
  const max = Math.max(...data.map(d => d.count), 1)
  const pts = data.map((d, i) => [
    px + (i / Math.max(data.length - 1, 1)) * (W - 2 * px),
    H - py - (d.count / max) * (H - 2 * py),
  ])
  const line  = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area  = `${pts[0][0]},${H} ${line} ${pts[pts.length - 1][0]},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1B4332" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1B4332" stopOpacity="0"    />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {[0.25, 0.5, 0.75].map(f => (
        <line key={f} x1={px} y1={py + f * (H - 2 * py)} x2={W - px} y2={py + f * (H - 2 * py)}
          stroke="#e5e0d8" strokeWidth="0.8" strokeDasharray="4 4" />
      ))}
      <polygon points={area} fill="url(#ag)" />
      <polyline points={line} fill="none" stroke="#1B4332" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => data[i].count > 0 && (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#1B4332" stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function DonutChart({ pending, confirmed, cancelled, readyForPickup = 0, completed = 0 }) {
  const total = pending + confirmed + cancelled + readyForPickup + completed
  const r = 36, cx = 50, cy = 50
  const circ = 2 * Math.PI * r
  const segs = [
    { count: confirmed,        color: '#10b981' },
    { count: readyForPickup,   color: '#0d9488' },
    { count: completed,        color: '#3b82f6' },
    { count: pending,          color: '#f59e0b' },
    { count: cancelled,        color: '#ef4444' },
  ]
  let acc = 0
  return (
    <svg viewBox="0 0 100 100">
      {total === 0
        ? <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e0d8" strokeWidth={13} />
        : segs.map((s, i) => {
            if (!s.count) return null
            const pct   = s.count / total
            const dash  = pct * circ
            const angle = acc * 360 - 90
            acc += pct
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={s.color} strokeWidth={13}
                strokeDasharray={`${dash} ${circ - dash}`}
                transform={`rotate(${angle},${cx},${cy})`} />
            )
          })
      }
      <text x={cx} y={cy - 3} textAnchor="middle"
        style={{ fontSize: 18, fontWeight: 900, fill: '#0C1710' }}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle"
        style={{ fontSize: 7, fill: '#8B7D6B' }}>Tempahan</text>
    </svg>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brown/8">
          <h3 className="font-fraunces font-bold text-charcoal text-lg">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone text-muted text-2xl leading-none transition-colors">
            ×
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="py-20 flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
    </div>
  )
}

// ── Toast stack ───────────────────────────────────────────────────────────────
function ToastStack({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
            animate-popIn pointer-events-auto min-w-[220px]
            ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-forest text-cream'}`}>
          {t.type === 'error'
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          }
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]     = useState('')
  const [err, setErr]   = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? { text: 'Selamat Pagi',       emoji: 'sun'  } :
    hour < 15 ? { text: 'Selamat Tengah Hari', emoji: 'sun'  } :
    hour < 19 ? { text: 'Selamat Petang',      emoji: 'dusk' } :
                { text: 'Selamat Malam',       emoji: 'moon' }

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { sessionStorage.setItem('adminPw', pw); onLogin(pw) }
    else setErr('Kata laluan tidak betul. Sila cuba lagi.')
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 bg-cream overflow-hidden flex items-center justify-center px-5">

      {/* Warm gradient blobs */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.28) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-40 -right-32 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(27,67,50,0.18) 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(193,90,55,0.10) 0%, transparent 70%)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle, #1B4332 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div className="relative w-full max-w-[400px]">

        {/* Greeting badge */}
        <div className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-brown/12 rounded-full pl-2 pr-4 py-1.5
            shadow-[0_4px_20px_rgba(28,16,8,0.04)]">
            <span className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
              {greeting.emoji === 'sun' && (
                <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              )}
              {greeting.emoji === 'dusk' && (
                <svg className="w-3.5 h-3.5 text-terra" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M5 18a7 7 0 0114 0M12 3v3m9 6h-3M3 12h3m12.364-6.364l-2.121 2.121M7.757 7.757L5.636 5.636"/>
                </svg>
              )}
              {greeting.emoji === 'moon' && (
                <svg className="w-3.5 h-3.5 text-forest" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </span>
            <span className="text-charcoal/70 text-xs font-medium tracking-wide">{greeting.text}</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-9">
          <div className="font-fraunces font-black text-2xl tracking-[5px] mb-1 select-none">
            <span className="text-charcoal">DK</span><span className="text-gold">AMPUNG</span>
          </div>
          <h1 className="font-fraunces text-[2.4rem] leading-[1.05] text-charcoal mb-3">
            Selamat <span className="italic font-normal text-forest2">Kembali</span>
          </h1>
          <p className="text-muted text-sm max-w-[280px] mx-auto leading-relaxed">
            Sila log masuk untuk uruskan tempahan, menu, dan pelanggan.
          </p>
        </div>

        {/* Card */}
        <form onSubmit={submit}
          className="bg-white rounded-3xl border border-brown/8 p-7 space-y-5"
          style={{ boxShadow: '0 24px 60px rgba(28,16,8,0.07), 0 4px 14px rgba(28,16,8,0.04)' }}>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-charcoal/55 text-[0.66rem] font-bold tracking-[2.5px] uppercase">Kata Laluan</label>
              <button type="button" onClick={() => setShow(s => !s)}
                className="text-muted/70 hover:text-charcoal text-[0.66rem] font-semibold tracking-wide transition-colors">
                {show ? 'Sorok' : 'Tunjuk'}
              </button>
            </div>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/55" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input type={show ? 'text' : 'password'} value={pw} onChange={e => { setPw(e.target.value); setErr('') }}
                placeholder="Masukkan kata laluan anda"
                autoFocus
                className="w-full bg-stone/70 border border-transparent text-charcoal placeholder:text-muted/45
                  rounded-2xl pl-11 pr-4 py-3.5 text-sm
                  focus:outline-none focus:bg-white focus:border-gold/40
                  focus:shadow-[0_0_0_4px_rgba(201,168,76,0.10)]
                  transition-all" />
            </div>
            {err && (
              <p className="text-red-500 text-xs mt-2.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
                {err}
              </p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={busy || !pw}
            className="w-full bg-charcoal text-cream py-3.5 rounded-2xl font-semibold text-[0.88rem] tracking-wide
              hover:bg-forest transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
            style={{ boxShadow: '0 8px 24px rgba(12,23,16,0.18)' }}>
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 border-[1.5px] border-cream/30 border-t-cream rounded-full animate-spin" />
                <span>Mengesahkan...</span>
              </>
            ) : (
              <>
                <span>Log Masuk</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-center text-muted/60 text-[0.72rem] mt-6 leading-relaxed">
          Sistem hanya untuk staf DKAMPUNG.<br />
          Untuk bantuan, hubungi pentadbir.
        </p>
      </div>
    </div>
  )
}

// ── Nav icons ─────────────────────────────────────────────────────────────────
const ICONS = {
  overview: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  reservations: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
    </svg>
  ),
  menu: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10"/>
    </svg>
  ),
  content: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  ),
}

const TABS = [
  { id: 'overview',     label: 'Overview'   },
  { id: 'reservations', label: 'Tempahan'   },
  { id: 'menu',         label: 'Menu'       },
  { id: 'content',      label: 'Kandungan'  },
  { id: 'analytics',    label: 'Analitik'   },
]

// ── Overview ──────────────────────────────────────────────────────────────────
function OverviewTab({ pw, onRefresh }) {
  const [d, setD] = useState(null)

  useEffect(() => {
    setD(null)
    Promise.all([
      fetch('/api/reservations', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/analytics/stats', { cache: 'no-store', headers: { Authorization: `Bearer ${pw}` } }).then(r => r.json()),
      fetch('/api/menu', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([res, stats, menu]) =>
      setD({ reservations: res.reservations || [], visits: stats.visits || [], menuItems: menu.items || [] })
    )
  }, [pw])

  if (!d) return <Spinner />

  const today          = new Date().toISOString().split('T')[0]
  const todayV         = d.visits.filter(v => v.visited_at?.startsWith(today)).length
  const pending        = d.reservations.filter(r => r.status === 'pending').length
  const confirmed      = d.reservations.filter(r => r.status === 'confirmed').length
  const cancelled      = d.reservations.filter(r => r.status === 'cancelled').length
  const readyForPickup = d.reservations.filter(r => r.status === 'ready_for_pickup').length
  const completed      = d.reservations.filter(r => r.status === 'completed').length
  const totalRevenue   = d.reservations
    .filter(r => ['confirmed','ready_for_pickup','completed'].includes(r.status))
    .reduce((sum, r) => sum + (parsePrice(r.notes) || 0), 0)

  const days = Array.from({ length: 14 }, (_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (13 - i))
    const iso = dt.toISOString().split('T')[0]
    return { iso, label: dt.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }), count: d.visits.filter(v => v.visited_at?.startsWith(iso)).length }
  })

  const cards = [
    { label: 'Pelawat Hari Ini', val: todayV,               bg: 'bg-blue-50',    num: 'text-blue-600',   icon: <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
    { label: 'Jumlah Pelawat',   val: d.visits.length,       bg: 'bg-forest/8',   num: 'text-forest',     icon: <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> },
    { label: 'Tempahan Pending', val: pending,               bg: 'bg-amber-50',   num: 'text-amber-600',  icon: <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { label: 'Jumlah Tempahan',  val: d.reservations.length, bg: 'bg-purple-50',  num: 'text-purple-600', icon: <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> },
  ]

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-fraunces font-black text-xl text-charcoal leading-tight">Papan Pemuka</h2>
          <p className="text-muted text-xs mt-0.5">Ringkasan tempahan dan aktiviti laman web</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh}
            className="inline-flex items-center gap-2 bg-white border border-brown/15 hover:bg-stone
              text-charcoal text-xs font-semibold px-3.5 py-2 rounded-full transition-colors"
            title="Muat semula data terkini">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Segar Semula
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-brown/8 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-4`}>{c.icon}</div>
            <div className={`font-fraunces font-black text-4xl leading-none ${c.num}`}>{c.val}</div>
            <div className="text-muted text-xs mt-2 font-medium">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="bg-white rounded-2xl border border-brown/8 p-5 flex items-center justify-between">
        <div>
          <div className="text-muted text-xs mb-1 font-semibold uppercase tracking-wider">Anggaran Hasil</div>
          <div className="font-fraunces font-black text-3xl text-forest">RM {totalRevenue.toFixed(2)}</div>
          <div className="text-muted text-xs mt-1">{confirmed + readyForPickup + completed} tempahan aktif</div>
        </div>
        <div className="w-14 h-14 bg-forest/8 rounded-2xl flex items-center justify-center shrink-0">
          <svg className="w-7 h-7 text-forest" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
          </svg>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        {/* Area chart */}
        <div className="bg-white rounded-2xl border border-brown/8 p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-semibold text-charcoal text-sm">Lawatan 14 Hari</h3>
              <p className="text-muted text-xs mt-0.5">Bilangan lawatan harian ke laman web</p>
            </div>
            <span className="text-muted text-xs bg-stone px-2.5 py-1 rounded-full">{d.visits.length} jumlah</span>
          </div>
          <div className="mt-4">
            <AreaChart data={days} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[0.6rem] text-muted">{days[0].label}</span>
            <span className="text-[0.6rem] text-muted">{days[days.length - 1].label}</span>
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-2xl border border-brown/8 p-5 flex flex-col">
          <h3 className="font-semibold text-charcoal text-sm mb-0.5">Status Tempahan</h3>
          <p className="text-muted text-xs mb-5">Agihan mengikut status</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-5">
            <div className="w-28 h-28">
              <DonutChart pending={pending} confirmed={confirmed} cancelled={cancelled} readyForPickup={readyForPickup} completed={completed} />
            </div>
            <div className="w-full space-y-2.5">
              {[
                { label: 'Disahkan',   count: confirmed,        dot: 'bg-emerald-400' },
                { label: 'Siap Ambil', count: readyForPickup,   dot: 'bg-teal-500'    },
                { label: 'Selesai',    count: completed,        dot: 'bg-blue-500'    },
                { label: 'Pending',    count: pending,          dot: 'bg-amber-400'   },
                { label: 'Dibatal',    count: cancelled,        dot: 'bg-red-400'     },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <span className="text-muted text-xs">{s.label}</span>
                  </div>
                  <span className="font-bold text-charcoal text-sm">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-brown/8 flex items-center justify-between">
          <h3 className="font-semibold text-charcoal text-sm">Tempahan Terkini</h3>
          <span className="text-muted text-xs">{d.reservations.length} rekod</span>
        </div>
        <div className="divide-y divide-brown/5">
          {d.reservations.slice(0, 6).map(r => (
            <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-forest/10 text-forest font-bold text-sm flex items-center justify-center shrink-0">
                  {r.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-semibold text-charcoal text-sm">{r.name}</div>
                  <div className="text-muted text-xs">{r.date} · {r.branch}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-forest font-bold text-sm">{r.pax} pax</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_CLS[r.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {STATUS_LABEL[r.status] || r.status}
                </span>
              </div>
            </div>
          ))}
          {!d.reservations.length && (
            <p className="text-muted text-sm text-center py-10">Tiada tempahan</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reservations ──────────────────────────────────────────────────────────────
function ReservationsTab({ pw, onStatusChange, addToast, askConfirm }) {
  const ALL_TIME_SLOTS = [
    '7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM',
    '12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
    '6:00 PM','7:00 PM','8:00 PM','9:00 PM','10:00 PM','11:00 PM',
  ]

  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busy, setBusy]     = useState(null)
  const [detail, setDetail] = useState(null)
  const [sendingReceipt, setSendingReceipt] = useState(false)
  const [receiptSent, setReceiptSent] = useState(false)
  const [enabledSlots, setEnabledSlots] = useState(new Set(ALL_TIME_SLOTS))
  const [slotSaving, setSlotSaving]     = useState(false)
  const [showSlotSettings, setShowSlotSettings] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/reservations', { cache: 'no-store' }).then(r => r.json()).then(d => { setRows(d.reservations || []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  // Load saved time slot config
  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const entry = data?.content?.find(c => c.page === 'reservations' && c.key === 'available_times')
        if (entry?.value) {
          try { setEnabledSlots(new Set(JSON.parse(entry.value))) } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const counts = { all: rows.length, pending: rows.filter(r => r.status === 'pending').length, confirmed: rows.filter(r => r.status === 'confirmed').length, ready_for_pickup: rows.filter(r => r.status === 'ready_for_pickup').length, completed: rows.filter(r => r.status === 'completed').length, cancelled: rows.filter(r => r.status === 'cancelled').length }
  const shown = rows.filter(r => (filter === 'all' || r.status === filter) && (!search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search)))

  async function setStatus(id, status) {
    const prev = rows.find(r => r.id === id)?.status
    setBusy(id)
    setRows(p => p.map(r => r.id === id ? { ...r, status } : r))
    if (detail?.id === id) setDetail(p => ({ ...p, status }))
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ status }) })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      onStatusChange?.()
    } catch (err) {
      setRows(p => p.map(r => r.id === id ? { ...r, status: prev } : r))
      if (detail?.id === id) setDetail(p => ({ ...p, status: prev }))
      addToast(`Gagal kemaskini status: ${err.message}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  function del(id) {
    askConfirm('Padam tempahan ini? Tindakan ini tidak boleh dibatalkan.', async () => {
      try {
        const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${pw}` } })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        setRows(p => p.filter(r => r.id !== id))
        setDetail(null)
        onStatusChange?.()
        addToast('Tempahan berjaya dipadam')
      } catch (err) {
        addToast(`Gagal padam: ${err.message}`, 'error')
      }
    })
  }

  async function sendReceipt(id) {
    setSendingReceipt(true)
    setReceiptSent(false)
    try {
      const res = await fetch(`/api/reservations/${id}/send-receipt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${pw}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      setReceiptSent(true)
      setTimeout(() => setReceiptSent(false), 3000)
      addToast(`E-resit dihantar ke ${detail?.email || ''}`)
    } catch (err) {
      addToast(`Gagal hantar e-resit: ${err.message}`, 'error')
    } finally {
      setSendingReceipt(false)
    }
  }

  async function saveSlots() {
    setSlotSaving(true)
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({ page: 'reservations', key: 'available_times', value: JSON.stringify([...enabledSlots]) }),
      })
      if (!res.ok) throw new Error('Gagal simpan')
      addToast('Tetapan masa berjaya disimpan')
    } catch { addToast('Gagal simpan tetapan masa.', 'error') }
    finally { setSlotSaving(false) }
  }

  function csv() {
    const hdr  = ['Nama','Emel','Telefon','Tarikh','Masa','Bilangan','Cawangan','Status','Didaftar']
    const body = rows.map(r => [r.name,r.email,r.phone,r.date,r.time,r.pax,`"${r.branch}"`,r.status,fmtDate(r.created_at)].join(','))
    const blob = new Blob([[hdr.join(','),...body].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a    = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `tempahan_${new Date().toISOString().split('T')[0]}.csv` })
    a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      {/* ── Tetapan Masa ── */}
      <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
        <button onClick={() => setShowSlotSettings(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone/40 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-charcoal text-sm">Tetapan Masa Tempahan</div>
              <div className="text-muted text-xs">{enabledSlots.size} / {ALL_TIME_SLOTS.length} masa aktif</div>
            </div>
          </div>
          <svg className={`w-4 h-4 text-muted transition-transform ${showSlotSettings ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSlotSettings && (
          <div className="px-5 pb-5 border-t border-brown/6">
            <p className="text-muted text-xs mt-4 mb-3">Pilih masa yang tersedia untuk pelanggan buat tempahan:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {ALL_TIME_SLOTS.map(slot => {
                const on = enabledSlots.has(slot)
                return (
                  <button key={slot} type="button"
                    onClick={() => setEnabledSlots(p => {
                      const s = new Set(p)
                      s.has(slot) ? s.delete(slot) : s.add(slot)
                      return s
                    })}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center
                      ${on
                        ? 'bg-forest/10 text-forest border-forest/30 hover:bg-forest/20'
                        : 'bg-stone text-muted/50 border-brown/10 line-through hover:border-brown/20'
                      }`}>
                    {on ? '✓ ' : ''}{slot}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={saveSlots} disabled={slotSaving}
                className="bg-forest text-cream px-5 py-2 rounded-xl text-sm font-semibold
                  hover:bg-forest/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {slotSaving && <span className="w-3.5 h-3.5 border-[1.5px] border-cream/30 border-t-cream rounded-full animate-spin" />}
                Simpan Tetapan
              </button>
              <button onClick={() => setEnabledSlots(new Set(ALL_TIME_SLOTS))}
                className="text-muted text-xs hover:text-charcoal transition-colors ml-auto">
                Pilih semua
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => { setDetail(null); setReceiptSent(false) }} title="Butiran Tempahan">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-brown/8">
              <div className="w-12 h-12 rounded-full bg-forest/10 text-forest font-black text-xl flex items-center justify-center">
                {detail.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="font-fraunces font-bold text-charcoal">{detail.name}</div>
                <div className="text-muted text-sm">{detail.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['Telefon',detail.phone],['Tarikh',detail.date],['Masa',detail.time],['Pax',`${detail.pax} pax`],['Anggaran', parsePrice(detail.notes) != null ? `RM ${parsePrice(detail.notes).toFixed(2)}` : '—'],['Cawangan',detail.branch],['Daftar',fmtDate(detail.created_at)]].map(([k,v]) => (
                <div key={k}>
                  <div className="text-muted text-xs mb-0.5">{k}</div>
                  <div className="font-semibold text-charcoal text-sm">{v}</div>
                </div>
              ))}
            </div>
            {detail.notes && (
              <div className="bg-stone rounded-xl p-4">
                <div className="text-muted text-xs mb-2 font-semibold uppercase tracking-wide">Pesanan</div>
                <pre className="text-charcoal text-xs font-mono whitespace-pre-wrap leading-relaxed">{detail.notes}</pre>
              </div>
            )}
            <button onClick={() => sendReceipt(detail.id)} disabled={sendingReceipt}
              className="w-full flex items-center justify-center gap-2 bg-gold/10 text-gold2 border border-gold/30
                px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gold/20 transition-colors disabled:opacity-50">
              {sendingReceipt ? (
                <><span className="w-3.5 h-3.5 border-[1.5px] border-gold/30 border-t-gold rounded-full animate-spin" />Menghantar...</>
              ) : receiptSent ? (
                <>✓ E-Resit Dihantar ke {detail.email}</>
              ) : (
                <>Hantar E-Resit ke {detail.email}</>
              )}
            </button>
            <div className="flex gap-2 pt-1 border-t border-brown/8">
              <select value={detail.status} onChange={e => setStatus(detail.id, e.target.value)} disabled={busy === detail.id}
                className="flex-1 border border-brown/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="ready_for_pickup">Siap Ambil</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => {
                const w = window.open('', '_blank')
                w.document.write(printHtml(detail))
                w.document.close()
                w.print()
              }}
                className="bg-forest/8 text-forest border border-forest/20 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest/15 transition-colors">
                Cetak Resit
              </button>
              <button onClick={() => del(detail.id)}
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                Padam
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {[['all','Semua'],['pending','Pending'],['confirmed','Confirmed'],['ready_for_pickup','Siap Ambil'],['completed','Selesai'],['cancelled','Cancelled']].map(([s,label]) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === s ? 'bg-charcoal text-cream' : 'bg-white text-muted border border-brown/20 hover:border-brown/40'}`}>
              {label} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / telefon..."
            className="border border-brown/20 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/30 w-48" />
          <button onClick={csv} className="bg-white border border-brown/20 text-charcoal px-4 py-2 rounded-xl text-sm font-semibold hover:bg-stone transition-colors">
            ⬇ CSV
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brown/8">
                  {['Pelanggan','Tarikh & Masa','Pesanan','Cawangan','Status',''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!shown.length && <tr><td colSpan={6} className="text-center py-16 text-muted">Tiada rekod</td></tr>}
                {shown.map(r => (
                  <tr key={r.id} className="border-b border-brown/5 hover:bg-stone/40 transition-colors cursor-pointer" onClick={() => setDetail(r)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-forest/8 text-forest font-bold text-sm flex items-center justify-center shrink-0">
                          {r.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-charcoal">{r.name}</div>
                          <div className="text-muted text-xs">{r.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-charcoal">{r.date}</div>
                      <div className="text-muted text-xs">{r.time}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-forest">{r.pax} pax</div>
                      {parsePrice(r.notes) != null && (
                        <div className="text-xs text-muted">RM {parsePrice(r.notes).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs max-w-[130px] truncate">{r.branch}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} disabled={busy === r.id}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-60 ${STATUS_CLS[r.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="ready_for_pickup">siap ambil</option>
                        <option value="completed">selesai</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-forest text-xs font-semibold">Lihat →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-stone/30 text-xs text-muted border-t border-brown/8">
            {shown.length} daripada {rows.length} rekod
          </div>
        </div>
      )}
    </div>
  )
}

// ── Menu ──────────────────────────────────────────────────────────────────────
const CATS = [
  { id: 'apam',   name: 'Kuih Kukus',     emoji: '🫓' },
  { id: 'kaswi',  name: 'Kaswi',          emoji: '🍮' },
  { id: 'santan', name: 'Kuih Santan',     emoji: '🥥' },
  { id: 'nasi',   name: 'Nasi & Hidangan', emoji: '🍚' },
]
const BLANK = { category_id: 'apam', name: '', description: '', price: '', min_order: 50, image_url: '', is_available: true }

function MenuForm({ data, onChange, onSave, onCancel, saving, pw }) {
  const inp = 'w-full border border-brown/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30'
  const [uploading, setUploading] = useState(false)
  const [upErr, setUpErr]         = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUpErr('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/menu/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${pw}` },
        body: fd,
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Muat naik gagal')
      onChange('image_url', body.url)
    } catch (err) {
      setUpErr(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Kategori</label>
        <select value={data.category_id} onChange={e => onChange('category_id', e.target.value)} className={inp}>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Nama Item <span className="text-terra">*</span></label>
        <input value={data.name} onChange={e => onChange('name', e.target.value)} placeholder="Nama kuih..." className={inp} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Keterangan</label>
        <textarea value={data.description || ''} onChange={e => onChange('description', e.target.value)} rows={2}
          placeholder="Huraian ringkas..." className={`${inp} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Harga (RM) <span className="text-terra">*</span></label>
          <input type="number" step="0.01" min="0" value={data.price} onChange={e => onChange('price', e.target.value)} placeholder="0.00" className={inp} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Min. Order</label>
          <input type="number" min="1" value={data.min_order} onChange={e => onChange('min_order', parseInt(e.target.value))} className={inp} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Gambar</label>
        <div className="flex items-start gap-3">
          {/* Preview */}
          <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-brown/15
            bg-gradient-to-br from-cream to-stone flex items-center justify-center">
            {data.image_url ? (
              <img src={data.image_url} alt="" className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none' }} />
            ) : (
              <svg className="w-7 h-7 text-muted/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          {/* Controls */}
          <div className="flex-1 space-y-2">
            <label className={`block w-full text-center border border-brown/20 rounded-xl px-3 py-2.5 text-sm font-semibold
              ${uploading ? 'bg-stone text-muted cursor-not-allowed' : 'bg-white text-charcoal hover:bg-stone cursor-pointer'}
              transition-colors`}>
              {uploading ? 'Memuat naik...' : 'Muat Naik Gambar'}
              <input type="file" accept="image/jpeg,image/png,image/webp"
                disabled={uploading} onChange={handleFile} className="hidden" />
            </label>
            <input value={data.image_url || ''} onChange={e => onChange('image_url', e.target.value)}
              placeholder="Atau tampal URL gambar..." className={`${inp} text-xs`} />
            {upErr && <p className="text-terra text-xs">{upErr}</p>}
            <p className="text-muted/70 text-[0.68rem]">JPG / PNG / WEBP, maksimum 2 MB.</p>
          </div>
        </div>
      </div>
      {/* Toggle */}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-medium text-charcoal">Tersedia untuk tempahan</span>
        <button type="button" onClick={() => onChange('is_available', !data.is_available)}
          className={`relative w-11 h-6 rounded-full transition-colors ${data.is_available ? 'bg-forest' : 'bg-brown/25'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${data.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
      <div className="flex gap-2 pt-2 border-t border-brown/8">
        <button onClick={onCancel} className="flex-1 border border-brown/20 text-muted px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone transition-colors">
          Batal
        </button>
        <button onClick={onSave} disabled={saving || !data.name || !data.price}
          className="flex-1 bg-charcoal text-cream px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest transition-colors disabled:opacity-40">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

function MenuTab({ pw, addToast, askConfirm }) {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)   // null | 'add' | 'edit'
  const [formData, setFormData] = useState(BLANK)
  const [editId, setEditId]     = useState(null)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false) })
  }, [])

  const change = (key, val) => setFormData(p => ({ ...p, [key]: val }))

  function openAdd() { setFormData(BLANK); setEditId(null); setModal('add') }
  function openEdit(item) { setFormData({ ...item }); setEditId(item.id); setModal('edit') }
  function closeModal() { setModal(null) }

  async function saveItem() {
    setSaving(true)
    try {
      let res, data
      if (modal === 'add') {
        const cat = CATS.find(c => c.id === formData.category_id) || CATS[0]
        res  = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ ...formData, category_name: cat.name, category_emoji: cat.emoji }) })
        data = await res.json()
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        setItems(p => [...p, data.item])
      } else {
        res  = await fetch(`/api/menu/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify(formData) })
        data = await res.json()
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        setItems(p => p.map(i => i.id === editId ? data.item : i))
      }
      closeModal()
      addToast(modal === 'add' ? 'Item berjaya ditambah' : 'Item berjaya dikemaskini')
    } catch (err) {
      addToast(`Gagal simpan: ${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  function del(id) {
    askConfirm('Padam item menu ini? Tindakan ini tidak boleh dibatalkan.', async () => {
      try {
        const res = await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${pw}` } })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        setItems(p => p.filter(i => i.id !== id))
        addToast('Item berjaya dipadam')
      } catch (err) {
        addToast(`Gagal padam: ${err.message}`, 'error')
      }
    })
  }

  const grouped = CATS.map(cat => ({ ...cat, items: items.filter(i => i.category_id === cat.id) }))

  return (
    <div className="space-y-5">
      <Modal open={!!modal} onClose={closeModal} title={modal === 'add' ? 'Tambah Item Baharu' : 'Edit Item Menu'}>
        <MenuForm data={formData} onChange={change} onSave={saveItem} onCancel={closeModal} saving={saving} pw={pw} />
      </Modal>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-charcoal">Item Menu</h3>
          <p className="text-muted text-xs mt-0.5">{items.length} item jumlah</p>
        </div>
        <button onClick={openAdd}
          className="bg-charcoal text-cream px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Tambah Item
        </button>
      </div>

      {loading ? <Spinner /> : grouped.map(cat => (
        <div key={cat.id} className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-brown/8 flex items-center gap-2.5 bg-stone/40">
            <span className="text-xl">{cat.emoji}</span>
            <h4 className="font-fraunces font-semibold text-charcoal">{cat.name}</h4>
            <span className="ml-1 text-xs text-muted bg-white border border-brown/12 px-2 py-0.5 rounded-full">{cat.items.length}</span>
          </div>
          {!cat.items.length && (
            <div className="px-5 py-10 text-center text-muted text-sm">
              <div className="text-3xl mb-2 opacity-30">🍽</div>
              Tiada item dalam kategori ini
            </div>
          )}
          <div className="divide-y divide-brown/5">
            {cat.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone/30 transition-colors group">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.is_available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-charcoal text-sm">{item.name}</span>
                    {!item.is_available && (
                      <span className="text-[0.6rem] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">Habis</span>
                    )}
                  </div>
                  <div className="text-muted text-xs mt-0.5 truncate">{item.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-terra text-sm">RM {parseFloat(item.price).toFixed(2)}</div>
                  <div className="text-muted text-xs">Min {item.min_order}</div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(item)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest/8 text-forest hover:bg-forest/16 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => del(item.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    Padam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Content ───────────────────────────────────────────────────────────────────
const DEFAULTS = [
  { page: 'home',    key: 'hero.badge',        label: 'Hero Badge',           value: 'Kuih Tradisional · Segar Setiap Hari' },
  { page: 'home',    key: 'hero.subtitle',      label: 'Hero Subtitle',        value: 'Dibuat dengan penuh kasih sayang menggunakan resipi turun-temurun. Segar setiap pagi — siap untuk majlis anda.' },
  { page: 'home',    key: 'stats.branches',     label: 'Stat: Cawangan',       value: '3' },
  { page: 'home',    key: 'stats.kuih_types',   label: 'Stat: Jenis Kuih',     value: '10+' },
  { page: 'home',    key: 'stats.customers',    label: 'Stat: Pelanggan/Bln',  value: '500+' },
  { page: 'home',    key: 'about.p1',           label: 'Tentang Kami Para 1',  value: 'DKAMPUNG bermula dari dapur kecil di Taman Putra Perdana dengan satu matlamat — menghidupkan semula rasa kuih tradisional yang semakin dilupakan.' },
  { page: 'home',    key: 'about.p2',           label: 'Tentang Kami Para 2',  value: 'Kini kami beroperasi di 3 cawangan, melayani tempahan kenduri dan majlis dari 50 hingga 200 pax dengan penghantaran segar setiap hari.' },
  { page: 'menu',    key: 'header.subtitle',    label: 'Menu Header Subtitle', value: 'Semua kuih dibuat segar setiap hari menggunakan bahan-bahan semula jadi pilihan.' },
  { page: 'contact', key: 'phone',              label: 'Telefon',              value: '+60 14-386 0742' },
  { page: 'contact', key: 'whatsapp',           label: 'WhatsApp Number',      value: '60143860742' },
  { page: 'contact', key: 'email',              label: 'Emel',                 value: 'dkampung@gmail.com' },
]

const BLANK_BRANCH = { name: '', address: '', phone: '', hours: '', mapQuery: '' }

function normalizeBranch(b) {
  if (typeof b === 'string') return { name: b, address: '', phone: '', hours: '', mapQuery: b }
  return { name: b.name||'', address: b.address||'', phone: b.phone||'', hours: b.hours||'', mapQuery: b.mapQuery||b.name||'' }
}

function ContentTab({ pw, addToast, askConfirm }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [editKey, setEditKey] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving]   = useState(false)
  const [group, setGroup]     = useState('home')

  // Footer-specific state
  const [fBranches,  setFBranches]  = useState([
    { name:'Taman Putra Perdana', address:'', phone:'', hours:'', mapQuery:'Taman Putra Perdana Puchong' },
    { name:'Cyberjaya',           address:'', phone:'', hours:'', mapQuery:'Cyberjaya Selangor'          },
    { name:'Kota Warisan',        address:'', phone:'', hours:'', mapQuery:'Kota Warisan Selangor'       },
  ])
  const [mapPreviews, setMapPreviews] = useState({})
  const [mapLoaded,   setMapLoaded]   = useState({})
  const [fNavLinks,  setFNavLinks]  = useState([
    { href:'/menu', label:'Menu Kuih' },{ href:'/reservations', label:'Buat Tempahan' },
    { href:'/contact', label:'Hubungi Kami' },{ href:'/admin', label:'Admin' },
  ])
  const [fHoursDays, setFHoursDays] = useState('Isnin – Ahad')
  const [fHoursTime, setFHoursTime] = useState('7:00 pagi – 11:00 malam')
  const [fSaving,    setFSaving]    = useState({})

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(d => {
      const db = d.content || []
      setContent(DEFAULTS.map(def => { const found = db.find(c => c.page === def.page && c.key === def.key); return found ? { ...def, value: found.value } : def }))
      // Load footer data
      const get = key => db.find(c => c.page === 'footer' && c.key === key)?.value
      try { const v = get('branches'); if (v) { const p = JSON.parse(v); setFBranches(Array.isArray(p) ? p.map(normalizeBranch) : []) } } catch {}
      try { const v = get('nav_links'); if (v) setFNavLinks(JSON.parse(v))  } catch {}
      if (get('hours_days')) setFHoursDays(get('hours_days'))
      if (get('hours_time')) setFHoursTime(get('hours_time'))
      setLoading(false)
    })
  }, [])

  async function save(page, key) {
    setSaving(true)
    try {
      await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ page, key, value: editVal }) })
      setContent(p => p.map(c => c.page === page && c.key === key ? { ...c, value: editVal } : c))
      setEditKey(null)
      addToast('Berjaya disimpan')
    } catch {
      addToast('Gagal menyimpan', 'error')
    }
    setSaving(false)
  }

  async function saveFooter(key, value) {
    setFSaving(p => ({ ...p, [key]: true }))
    try {
      const res = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ page: 'footer', key, value }) })
      if (!res.ok) throw new Error('Gagal menyimpan')
      addToast('Berjaya disimpan')
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan', 'error')
    }
    setFSaving(p => ({ ...p, [key]: false }))
  }

  const shown = content.filter(c => c.page === group)

  const inputCls = 'border border-brown/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30 bg-white'

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['home','menu','contact','footer'].map(g => (
          <button key={g} onClick={() => setGroup(g)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${group === g ? 'bg-charcoal text-cream' : 'bg-white text-muted border border-brown/20 hover:border-brown/40'}`}>
            {g === 'footer' ? '🦶 Footer' : g}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : group === 'footer' ? (
        <div className="space-y-5">

          {/* ── NAVIGASI ── */}
          <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-brown/6 flex items-center justify-between">
              <div>
                <div className="font-semibold text-charcoal text-sm">Navigasi</div>
                <div className="text-muted text-xs mt-0.5">Pautan yang terpapar di footer</div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {fNavLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={link.label} onChange={e => setFNavLinks(p => p.map((l,j) => j===i ? {...l,label:e.target.value} : l))}
                    placeholder="Label" className={`${inputCls} flex-1`} />
                  <input value={link.href} onChange={e => setFNavLinks(p => p.map((l,j) => j===i ? {...l,href:e.target.value} : l))}
                    placeholder="/pautan" className={`${inputCls} w-36`} />
                  <button onClick={() => setFNavLinks(p => p.filter((_,j) => j!==i))}
                    className="text-red-400 hover:text-red-600 text-xs px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                    Padam
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setFNavLinks(p => [...p, {href:'', label:''}])}
                  className="text-forest text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-forest/8 transition-colors border border-forest/20">
                  + Tambah Pautan
                </button>
                <button onClick={() => saveFooter('nav_links', JSON.stringify(fNavLinks))} disabled={fSaving.nav_links}
                  className="bg-charcoal text-cream px-5 py-1.5 rounded-xl text-sm font-semibold hover:bg-forest transition-colors disabled:opacity-50 ml-auto flex items-center gap-2">
                  {fSaving.nav_links && <span className="w-3.5 h-3.5 border-[1.5px] border-cream/30 border-t-cream rounded-full animate-spin"/>}
                  Simpan
                </button>
              </div>
            </div>
          </div>

          {/* ── CAWANGAN ── */}
          <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-brown/6">
              <div className="font-semibold text-charcoal text-sm">Cawangan</div>
              <div className="text-muted text-xs mt-0.5">Urus maklumat cawangan — nama, alamat, telefon, waktu, dan peta</div>
            </div>
            <div className="p-4 space-y-3">
              {fBranches.map((branch, i) => (
                <div key={i} className="border border-brown/12 rounded-xl overflow-hidden">
                  {/* Card header */}
                  <div className="px-4 py-2.5 bg-stone/60 flex items-center justify-between">
                    <span className="font-semibold text-charcoal text-sm">{branch.name || `Cawangan ${i + 1}`}</span>
                    <button
                      onClick={() => askConfirm(`Padam cawangan "${branch.name || `Cawangan ${i+1}`}"?`, () => {
                        setFBranches(p => p.filter((_,j) => j !== i))
                        setMapPreviews(p => { const n = {...p}; delete n[i]; return n })
                        setMapLoaded(p => { const n = {...p}; delete n[i]; return n })
                      })}
                      className="text-red-400 hover:text-red-600 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      Padam
                    </button>
                  </div>
                  {/* Fields */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide block mb-1.5">Nama Cawangan</label>
                        <input value={branch.name}
                          onChange={e => setFBranches(p => p.map((b,j) => j===i ? {...b, name: e.target.value} : b))}
                          placeholder="cth: Cyberjaya" className={`${inputCls} w-full`} />
                      </div>
                      <div>
                        <label className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide block mb-1.5">No. Telefon</label>
                        <input value={branch.phone}
                          onChange={e => setFBranches(p => p.map((b,j) => j===i ? {...b, phone: e.target.value} : b))}
                          placeholder="+60 14-386 0742" className={`${inputCls} w-full`} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide block mb-1.5">Alamat</label>
                      <input value={branch.address}
                        onChange={e => setFBranches(p => p.map((b,j) => j===i ? {...b, address: e.target.value} : b))}
                        placeholder="cth: Taman Putra Perdana, Puchong, Selangor" className={`${inputCls} w-full`} />
                    </div>
                    <div>
                      <label className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide block mb-1.5">Waktu Operasi</label>
                      <input value={branch.hours}
                        onChange={e => setFBranches(p => p.map((b,j) => j===i ? {...b, hours: e.target.value} : b))}
                        placeholder="cth: Isnin – Ahad, 7:00 pagi – 11:00 malam" className={`${inputCls} w-full`} />
                    </div>
                    <div>
                      <label className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide block mb-1.5">Carian Lokasi (Google Maps)</label>
                      <div className="flex gap-2">
                        <input value={branch.mapQuery}
                          onChange={e => setFBranches(p => p.map((b,j) => j===i ? {...b, mapQuery: e.target.value} : b))}
                          placeholder="cth: Taman Putra Perdana Puchong" className={`${inputCls} flex-1`} />
                        <button
                          onClick={() => {
                            const q = branch.mapQuery || branch.address || branch.name
                            setMapLoaded(p => ({...p, [i]: false}))
                            setMapPreviews(p => ({...p, [i]: q}))
                          }}
                          className="bg-forest/8 text-forest text-xs font-semibold px-3 py-2 rounded-xl hover:bg-forest/16 transition-colors whitespace-nowrap border border-forest/20 shrink-0">
                          🗺 Lihat Peta
                        </button>
                      </div>
                    </div>
                    {/* Map preview */}
                    {mapPreviews[i] && (
                      <div className="relative rounded-xl overflow-hidden h-44 bg-stone border border-brown/10">
                        {!mapLoaded[i] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-stone z-10">
                            <div className="w-6 h-6 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
                          </div>
                        )}
                        <iframe
                          key={mapPreviews[i]}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapPreviews[i])}&output=embed`}
                          width="100%" height="100%"
                          style={{ border: 0 }}
                          allowFullScreen loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Peta ${branch.name}`}
                          onLoad={() => setMapLoaded(p => ({...p, [i]: true}))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => setFBranches(p => [...p, { ...BLANK_BRANCH }])}
                  className="text-forest text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-forest/8 transition-colors border border-forest/20">
                  + Tambah Cawangan
                </button>
                <button onClick={() => saveFooter('branches', JSON.stringify(fBranches))} disabled={fSaving.branches}
                  className="bg-charcoal text-cream px-5 py-1.5 rounded-xl text-sm font-semibold hover:bg-forest transition-colors disabled:opacity-50 ml-auto flex items-center gap-2">
                  {fSaving.branches && <span className="w-3.5 h-3.5 border-[1.5px] border-cream/30 border-t-cream rounded-full animate-spin"/>}
                  Simpan Semua Cawangan
                </button>
              </div>
            </div>
          </div>

          {/* ── WAKTU OPERASI ── */}
          <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
            <div className="px-5 py-4 border-b border-brown/6 flex items-center justify-between">
              <div>
                <div className="font-semibold text-charcoal text-sm">Waktu Operasi</div>
                <div className="text-muted text-xs mt-0.5">Hari dan masa operasi</div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">Hari</label>
                <input value={fHoursDays} onChange={e => setFHoursDays(e.target.value)}
                  placeholder="cth: Isnin – Ahad" className={`${inputCls} w-full`} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wide block mb-1.5">Masa</label>
                <input value={fHoursTime} onChange={e => setFHoursTime(e.target.value)}
                  placeholder="cth: 7:00 pagi – 11:00 malam" className={`${inputCls} w-full`} />
              </div>
              <button onClick={async () => { await saveFooter('hours_days', fHoursDays); await saveFooter('hours_time', fHoursTime) }}
                disabled={fSaving.hours_days || fSaving.hours_time}
                className="bg-charcoal text-cream px-5 py-2 rounded-xl text-sm font-semibold hover:bg-forest transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto">
                {(fSaving.hours_days || fSaving.hours_time) && <span className="w-3.5 h-3.5 border-[1.5px] border-cream/30 border-t-cream rounded-full animate-spin"/>}
                Simpan
              </button>
            </div>
          </div>
        </div>

      ) : (
        <div className="bg-white rounded-2xl border border-brown/8 divide-y divide-brown/5 overflow-hidden">
          {shown.map(item => {
            const uid = `${item.page}.${item.key}`
            const isEditing = editKey === uid
            return (
              <div key={uid} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider mb-1.5">{item.label}</div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea value={editVal} onChange={e => setEditVal(e.target.value)} rows={item.value.length > 80 ? 4 : 2}
                        className="w-full border border-forest/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setEditKey(null)} className="text-sm text-muted hover:text-charcoal px-2">Batal</button>
                        <button onClick={() => save(item.page, item.key)} disabled={saving}
                          className="bg-charcoal text-cream px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-forest transition-colors">
                          {saving ? '...' : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-charcoal text-sm leading-relaxed">{item.value}</p>
                  )}
                </div>
                {!isEditing && (
                  <button onClick={() => { setEditKey(uid); setEditVal(item.value) }}
                    className="text-forest text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-forest/8 transition-colors shrink-0">
                    Edit
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsTab({ pw }) {
  const [visits, setVisits]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${pw}` } })
      .then(r => r.json()).then(d => { setVisits(d.visits || []); setLoading(false) })
  }, [pw])

  if (loading) return <Spinner />

  const today = new Date().toISOString().split('T')[0]

  const byPage  = visits.reduce((a, v) => { a[v.page || '/'] = (a[v.page || '/'] || 0) + 1; return a }, {})
  const pageList = Object.entries(byPage).sort((a, b) => b[1] - a[1])
  const maxP    = pageList[0]?.[1] || 1

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const iso = d.toISOString().split('T')[0]
    return { iso, label: d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }), count: visits.filter(v => v.visited_at?.startsWith(iso)).length }
  })

  const byRef   = visits.reduce((a, v) => { const k = safeHost(v.referrer); a[k] = (a[k] || 0) + 1; return a }, {})
  const refList = Object.entries(byRef).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jumlah Lawatan', val: visits.length, icon: <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg> },
          { label: 'Halaman Unik',   val: pageList.length, icon: <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg> },
          { label: 'Hari Ini',       val: visits.filter(v => v.visited_at?.startsWith(today)).length, icon: <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-brown/8 p-5">
            <div className="mb-3">{s.icon}</div>
            <div className="font-fraunces font-black text-4xl text-charcoal leading-none">{s.val}</div>
            <div className="text-muted text-xs mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-white rounded-2xl border border-brown/8 p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-charcoal text-sm">Lawatan 14 Hari Terakhir</h3>
          <span className="text-muted text-xs bg-stone px-2.5 py-1 rounded-full">{visits.length} jumlah</span>
        </div>
        <p className="text-muted text-xs mb-5">Graf trend lawatan harian</p>
        <AreaChart data={days} />
        <div className="grid grid-cols-7 mt-2">
          {days.filter((_, i) => i % 2 === 0).map(d => (
            <div key={d.iso} className="text-[0.55rem] text-muted text-center">{d.label}</div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Page visits */}
        <div className="bg-white rounded-2xl border border-brown/8 p-5">
          <h3 className="font-semibold text-charcoal text-sm mb-5">Lawatan per Halaman</h3>
          <div className="space-y-3.5">
            {!pageList.length && <p className="text-muted text-sm text-center py-6">Tiada data</p>}
            {pageList.map(([page, count]) => (
              <div key={page}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-charcoal text-xs font-medium">{page}</span>
                  <span className="text-muted text-xs font-bold">{count}</span>
                </div>
                <div className="h-2 bg-stone rounded-full overflow-hidden">
                  <div className="h-full bg-forest rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxP) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-2xl border border-brown/8 p-5">
          <h3 className="font-semibold text-charcoal text-sm mb-5">Sumber Lawatan</h3>
          <div className="space-y-1">
            {!refList.length && <p className="text-muted text-sm text-center py-6">Tiada data</p>}
            {refList.map(([ref, count], i) => (
              <div key={ref} className="flex items-center justify-between py-2.5 border-b border-brown/5 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-forest/8 text-forest text-[0.6rem] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-charcoal text-sm">{ref}</span>
                </div>
                <span className="bg-forest/8 text-forest text-xs font-semibold px-2.5 py-1 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [pw, setPw]   = useState(null)
  const [tab, setTab] = useState('overview')
  const [tick, setTick] = useState(0)
  const [now, setNow] = useState(new Date())
  const [toasts, setToasts] = useState([])
  const [pendingConfirm, setPendingConfirm] = useState(null)
  const bump = useCallback(() => setTick(t => t + 1), [])

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])

  const askConfirm = useCallback((message, onConfirm) => {
    setPendingConfirm({ message, onConfirm })
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('adminPw')
    if (!saved) return
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: saved }) })
      .then(r => { if (r.ok) setPw(saved) })
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!pw) return <LoginScreen onLogin={setPw} />

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <ToastStack toasts={toasts} />

      {/* ── Confirmation modal ── */}
      <Modal open={!!pendingConfirm} onClose={() => setPendingConfirm(null)} title="Pengesahan">
        {pendingConfirm && (
          <div>
            <p className="text-charcoal text-sm leading-relaxed mb-6">{pendingConfirm.message}</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingConfirm(null)}
                className="flex-1 border border-brown/20 text-charcoal px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone transition-colors">
                Batal
              </button>
              <button onClick={() => { pendingConfirm.onConfirm(); setPendingConfirm(null) }}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                Sahkan Padam
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-14 md:w-[220px] bg-charcoal flex flex-col z-20">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-white/8">
          <div className="hidden md:block">
            <div className="font-fraunces font-black text-sm tracking-[3px]">
              <span className="text-gold">DK</span><span className="text-cream">AMPUNG</span>
            </div>
            <div className="text-cream/30 text-[0.6rem] tracking-wide mt-0.5">Admin Portal</div>
          </div>
          <div className="md:hidden w-8 h-8 bg-gold rounded-lg flex items-center justify-center font-fraunces font-black text-charcoal text-xs">DK</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white/12 text-cream' : 'text-cream/40 hover:text-cream/70 hover:bg-white/5'
              }`}>
              <span className="shrink-0">{ICONS[t.id]}</span>
              <span className="hidden md:block">{t.label}</span>
              {tab === t.id && <span className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-white/8 pt-3">
          <button onClick={() => { sessionStorage.removeItem('adminPw'); setPw(null) }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-cream/30 hover:text-cream/60 hover:bg-white/5 transition-all text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span className="hidden md:block">Log Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="ml-14 md:ml-[220px] min-h-screen">
        {/* Top header bar */}
        <div className="sticky top-0 z-10 h-[52px] flex items-center justify-between px-5
          bg-charcoal/[0.96] backdrop-blur-2xl border-b border-white/[0.055]"
          style={{ boxShadow: '0 1px 0 rgba(201,168,76,0.07), 0 6px 28px rgba(0,0,0,0.28)' }}>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="hidden sm:block text-[0.58rem] font-mono font-bold tracking-[3.5px] uppercase text-gold/25 shrink-0 select-none">
              DKAMPUNG
            </span>
            <svg className="hidden sm:block w-3 h-3 text-white/10 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-gold/50 shrink-0 opacity-70" style={{ transform: 'scale(0.78)', transformOrigin: 'center' }}>{ICONS[tab]}</span>
              <span className="text-cream/80 text-[0.8rem] font-semibold tracking-wide truncate">{activeTab?.label}</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live clock */}
            <div className="hidden sm:flex items-center gap-2 bg-white/[0.038] border border-white/[0.07] rounded-full px-3 py-[5px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-cream/40 text-[0.63rem] font-mono tabular-nums tracking-wider leading-none">
                {now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
            </div>

            {/* Date */}
            <span className="hidden lg:block text-cream/20 text-[0.6rem] font-mono tracking-wider uppercase">
              {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>

            <div className="h-4 w-px bg-white/10" />

            {/* Avatar with online dot */}
            <div className="relative">
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.9) 0%, rgba(201,168,76,0.55) 100%)',
                  boxShadow: '0 0 0 1.5px rgba(201,168,76,0.28), 0 0 14px rgba(201,168,76,0.14)',
                }}>
                <span className="text-charcoal font-black text-[0.6rem] tracking-widest leading-none">A</span>
              </div>
              <span className="absolute -bottom-[1px] -right-[1px] w-[9px] h-[9px] rounded-full bg-emerald-400 border-[1.5px] border-charcoal" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'overview'     && <OverviewTab     key={tick} pw={pw} onRefresh={bump} />}
          {tab === 'reservations' && <ReservationsTab pw={pw} onStatusChange={bump} addToast={addToast} askConfirm={askConfirm} />}
          {tab === 'menu'         && <MenuTab         pw={pw} addToast={addToast} askConfirm={askConfirm} />}
          {tab === 'content'      && <ContentTab      pw={pw} addToast={addToast} askConfirm={askConfirm} />}
          {tab === 'analytics'    && <AnalyticsTab    pw={pw} />}
        </div>
      </div>
    </div>
  )
}

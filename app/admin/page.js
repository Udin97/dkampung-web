'use client'

import { useState, useEffect, useCallback } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}
function safeHost(url) {
  if (!url) return 'Langsung'
  try { return new URL(url).hostname || 'Langsung' } catch { return 'Langsung' }
}

const STATUS_CLS = {
  pending:   'bg-amber-50  text-amber-700  border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50    text-red-600    border-red-200',
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

function DonutChart({ pending, confirmed, cancelled }) {
  const total = pending + confirmed + cancelled
  const r = 36, cx = 50, cy = 50
  const circ = 2 * Math.PI * r
  const segs = [
    { count: confirmed, color: '#10b981' },
    { count: pending,   color: '#f59e0b' },
    { count: cancelled, color: '#ef4444' },
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

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { sessionStorage.setItem('adminPw', pw); onLogin(pw) }
    else setErr('Kata laluan salah.')
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4" style={{
      backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.07) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold rounded-2xl mb-5
            font-fraunces font-black text-charcoal text-xl shadow-[0_8px_30px_rgba(201,168,76,0.4)]">DK</div>
          <h1 className="font-fraunces font-black text-3xl text-cream mb-1">Admin Portal</h1>
          <p className="text-cream/40 text-sm">DKAMPUNG Dashboard</p>
        </div>
        <form onSubmit={submit} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-cream/50 text-xs font-semibold tracking-wider uppercase block mb-2">Kata Laluan</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="••••••••" autoFocus
              className="w-full bg-white/8 border border-white/12 text-cream placeholder:text-cream/20 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40" />
          </div>
          {err && <p className="text-red-400 text-sm text-center">{err}</p>}
          <button type="submit" disabled={busy}
            className="w-full bg-gold text-charcoal py-3 rounded-xl font-bold text-sm tracking-wide
              hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_20px_rgba(201,168,76,0.3)]">
            {busy ? 'Mengesahkan...' : 'Log Masuk →'}
          </button>
        </form>
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
function OverviewTab({ pw }) {
  const [d, setD] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/reservations').then(r => r.json()),
      fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${pw}` } }).then(r => r.json()),
      fetch('/api/menu').then(r => r.json()),
    ]).then(([res, stats, menu]) =>
      setD({ reservations: res.reservations || [], visits: stats.visits || [], menuItems: menu.items || [] })
    )
  }, [pw])

  if (!d) return <Spinner />

  const today     = new Date().toISOString().split('T')[0]
  const todayV    = d.visits.filter(v => v.visited_at?.startsWith(today)).length
  const pending   = d.reservations.filter(r => r.status === 'pending').length
  const confirmed = d.reservations.filter(r => r.status === 'confirmed').length
  const cancelled = d.reservations.filter(r => r.status === 'cancelled').length

  const days = Array.from({ length: 14 }, (_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (13 - i))
    const iso = dt.toISOString().split('T')[0]
    return { iso, label: dt.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }), count: d.visits.filter(v => v.visited_at?.startsWith(iso)).length }
  })

  const cards = [
    { label: 'Pelawat Hari Ini', val: todayV,               bg: 'bg-blue-50',    num: 'text-blue-600',   icon: '👤' },
    { label: 'Jumlah Pelawat',   val: d.visits.length,       bg: 'bg-forest/8',   num: 'text-forest',     icon: '📈' },
    { label: 'Tempahan Pending', val: pending,               bg: 'bg-amber-50',   num: 'text-amber-600',  icon: '⏳' },
    { label: 'Jumlah Tempahan',  val: d.reservations.length, bg: 'bg-purple-50',  num: 'text-purple-600', icon: '📋' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-brown/8 p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center text-xl mb-4`}>{c.icon}</div>
            <div className={`font-fraunces font-black text-4xl leading-none ${c.num}`}>{c.val}</div>
            <div className="text-muted text-xs mt-2 font-medium">{c.label}</div>
          </div>
        ))}
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
              <DonutChart pending={pending} confirmed={confirmed} cancelled={cancelled} />
            </div>
            <div className="w-full space-y-2.5">
              {[
                { label: 'Disahkan', count: confirmed, dot: 'bg-emerald-400' },
                { label: 'Pending',  count: pending,   dot: 'bg-amber-400'   },
                { label: 'Dibatal',  count: cancelled, dot: 'bg-red-400'     },
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
                <span className="text-forest font-bold text-sm">{r.pax} biji</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_CLS[r.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {r.status}
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
function ReservationsTab({ pw }) {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busy, setBusy]     = useState(null)
  const [detail, setDetail] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/reservations').then(r => r.json()).then(d => { setRows(d.reservations || []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  const counts = { all: rows.length, pending: rows.filter(r => r.status === 'pending').length, confirmed: rows.filter(r => r.status === 'confirmed').length, cancelled: rows.filter(r => r.status === 'cancelled').length }
  const shown = rows.filter(r => (filter === 'all' || r.status === filter) && (!search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search)))

  async function setStatus(id, status) {
    setBusy(id)
    await fetch(`/api/reservations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ status }) })
    setRows(p => p.map(r => r.id === id ? { ...r, status } : r))
    if (detail?.id === id) setDetail(p => ({ ...p, status }))
    setBusy(null)
  }

  async function del(id) {
    if (!confirm('Padam tempahan ini?')) return
    await fetch(`/api/reservations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${pw}` } })
    setRows(p => p.filter(r => r.id !== id))
    setDetail(null)
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
      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Butiran Tempahan">
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
              {[['Telefon',detail.phone],['Tarikh',detail.date],['Masa',detail.time],['Biji',`${detail.pax} biji`],['Cawangan',detail.branch],['Daftar',fmtDate(detail.created_at)]].map(([k,v]) => (
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
            <div className="flex gap-2 pt-1 border-t border-brown/8">
              <select value={detail.status} onChange={e => setStatus(detail.id, e.target.value)} disabled={busy === detail.id}
                className="flex-1 border border-brown/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
          {[['all','Semua'],['pending','Pending'],['confirmed','Confirmed'],['cancelled','Cancelled']].map(([s,label]) => (
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
                    <td className="px-5 py-3.5 font-bold text-forest">{r.pax} biji</td>
                    <td className="px-5 py-3.5 text-muted text-xs max-w-[130px] truncate">{r.branch}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} disabled={busy === r.id}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-60 ${STATUS_CLS[r.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
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

function MenuForm({ data, onChange, onSave, onCancel, saving }) {
  const inp = 'w-full border border-brown/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30'
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
        <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">URL Gambar</label>
        <input value={data.image_url || ''} onChange={e => onChange('image_url', e.target.value)} placeholder="https://..." className={inp} />
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

function MenuTab({ pw }) {
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
    if (modal === 'add') {
      const cat  = CATS.find(c => c.id === formData.category_id) || CATS[0]
      const res  = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ ...formData, category_name: cat.name, category_emoji: cat.emoji }) })
      const data = await res.json()
      if (data.item) setItems(p => [...p, data.item])
    } else {
      const res  = await fetch(`/api/menu/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.item) setItems(p => p.map(i => i.id === editId ? data.item : i))
    }
    setSaving(false); closeModal()
  }

  async function del(id) {
    if (!confirm('Padam item menu ini?')) return
    await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${pw}` } })
    setItems(p => p.filter(i => i.id !== id))
  }

  const grouped = CATS.map(cat => ({ ...cat, items: items.filter(i => i.category_id === cat.id) }))

  return (
    <div className="space-y-5">
      <Modal open={!!modal} onClose={closeModal} title={modal === 'add' ? 'Tambah Item Baharu' : 'Edit Item Menu'}>
        <MenuForm data={formData} onChange={change} onSave={saveItem} onCancel={closeModal} saving={saving} />
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
  { page: 'home',    key: 'about.p2',           label: 'Tentang Kami Para 2',  value: 'Kini kami beroperasi di 3 cawangan, melayani tempahan kenduri dan majlis dari 50 hingga 200 biji dengan penghantaran segar setiap hari.' },
  { page: 'menu',    key: 'header.subtitle',    label: 'Menu Header Subtitle', value: 'Semua kuih dibuat segar setiap hari menggunakan bahan-bahan semula jadi pilihan.' },
  { page: 'contact', key: 'phone',              label: 'Telefon',              value: '+60 14-386 0742' },
  { page: 'contact', key: 'whatsapp',           label: 'WhatsApp Number',      value: '60143860742' },
  { page: 'contact', key: 'email',              label: 'Emel',                 value: 'dkampung@gmail.com' },
]

function ContentTab({ pw }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [editKey, setEditKey] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving]   = useState(false)
  const [group, setGroup]     = useState('home')

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(d => {
      const db = d.content || []
      setContent(DEFAULTS.map(def => { const found = db.find(c => c.page === def.page && c.key === def.key); return found ? { ...def, value: found.value } : def }))
      setLoading(false)
    })
  }, [])

  async function save(page, key) {
    setSaving(true)
    await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify({ page, key, value: editVal }) })
    setContent(p => p.map(c => c.page === page && c.key === key ? { ...c, value: editVal } : c))
    setEditKey(null); setSaving(false)
  }

  const shown = content.filter(c => c.page === group)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['home','menu','contact'].map(g => (
          <button key={g} onClick={() => setGroup(g)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${group === g ? 'bg-charcoal text-cream' : 'bg-white text-muted border border-brown/20 hover:border-brown/40'}`}>
            {g}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
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
          { label: 'Jumlah Lawatan', val: visits.length, icon: '🌐' },
          { label: 'Halaman Unik',   val: pageList.length, icon: '📄' },
          { label: 'Hari Ini',       val: visits.filter(v => v.visited_at?.startsWith(today)).length, icon: '📅' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-brown/8 p-5">
            <div className="text-2xl mb-3">{s.icon}</div>
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

  useEffect(() => {
    const saved = sessionStorage.getItem('adminPw')
    if (!saved) return
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: saved }) })
      .then(r => { if (r.ok) setPw(saved) })
  }, [])

  if (!pw) return <LoginScreen onLogin={setPw} />

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-[68px] bottom-0 w-14 md:w-[220px] bg-charcoal flex flex-col z-20">
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
      <div className="ml-14 md:ml-[220px] min-h-screen pt-[68px]">
        {/* Top header bar */}
        <div className="bg-white border-b border-brown/8 px-6 py-4 flex items-center justify-between sticky top-[68px] z-10">
          <div>
            <h1 className="font-fraunces font-bold text-charcoal">{activeTab?.label}</h1>
            <p className="text-muted text-xs mt-0.5">
              {new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-forest text-cream font-bold text-sm flex items-center justify-center shadow-sm">A</div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'overview'     && <OverviewTab     pw={pw} />}
          {tab === 'reservations' && <ReservationsTab pw={pw} />}
          {tab === 'menu'         && <MenuTab         pw={pw} />}
          {tab === 'content'      && <ContentTab      pw={pw} />}
          {tab === 'analytics'    && <AnalyticsTab    pw={pw} />}
        </div>
      </div>
    </div>
  )
}

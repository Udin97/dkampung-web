'use client'

import { useState, useEffect, useCallback } from 'react'

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function safeHost(url) {
  if (!url) return 'Langsung'
  try { return new URL(url).hostname || 'Langsung' } catch { return 'Langsung' }
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    if (res.ok) { sessionStorage.setItem('adminPw', pw); onLogin(pw) }
    else { setErr('Kata laluan salah.') }
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest text-gold font-fraunces font-black rounded-xl mb-4 text-sm">DK</div>
          <h1 className="font-fraunces font-black text-2xl text-forest">Admin DKAMPUNG</h1>
          <p className="text-muted text-sm mt-1">Masukkan kata laluan untuk akses</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Kata laluan admin..." autoFocus
            className="border border-brown/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
          {err && <p className="text-red-600 text-sm text-center">{err}</p>}
          <button type="submit" disabled={busy}
            className="bg-forest text-cream px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brown transition-colors disabled:opacity-50">
            {busy ? 'Mengesahkan...' : 'Log Masuk →'}
          </button>
        </form>
      </div>
    </div>
  )
}

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

  const today = new Date().toISOString().split('T')[0]
  const todayV = d.visits.filter(v => v.visited_at?.startsWith(today)).length
  const pending = d.reservations.filter(r => r.status === 'pending').length
  const pageCount = d.visits.reduce((a, v) => { a[v.page] = (a[v.page] || 0) + 1; return a }, {})
  const topPages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxP = topPages[0]?.[1] || 1

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pelawat Hari Ini',  val: todayV,                  bg: 'bg-blue-50',    text: 'text-blue-700' },
          { label: 'Jumlah Pelawat',    val: d.visits.length,          bg: 'bg-forest/8',   text: 'text-forest' },
          { label: 'Tempahan Pending',  val: pending,                  bg: 'bg-yellow-50',  text: 'text-yellow-700' },
          { label: 'Jumlah Tempahan',   val: d.reservations.length,    bg: 'bg-green-50',   text: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} ${s.text} rounded-xl p-4`}>
            <div className="font-fraunces font-black text-3xl leading-none">{s.val}</div>
            <div className="text-xs font-semibold mt-1 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div className="bg-white rounded-xl border border-brown/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-brown/8">
            <h3 className="font-semibold text-brown text-sm">Tempahan Terkini</h3>
          </div>
          <div className="divide-y divide-brown/5">
            {d.reservations.slice(0, 6).map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-brown text-sm">{r.name}</div>
                  <div className="text-muted text-xs">{r.date} · {r.pax} biji</div>
                </div>
                <span className={`${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-600'} text-xs font-semibold px-2 py-0.5 rounded-full capitalize`}>
                  {r.status}
                </span>
              </div>
            ))}
            {d.reservations.length === 0 && <p className="text-muted text-sm text-center py-6">Tiada tempahan</p>}
          </div>
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-xl border border-brown/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-brown/8">
            <h3 className="font-semibold text-brown text-sm">Halaman Popular</h3>
          </div>
          <div className="p-4 space-y-3">
            {topPages.length === 0 && <p className="text-muted text-sm text-center py-4">Tiada data pelawat lagi</p>}
            {topPages.map(([page, count]) => (
              <div key={page}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-brown font-medium">{page}</span>
                  <span className="text-muted text-xs">{count}</span>
                </div>
                <div className="h-1.5 bg-cream2 rounded-full overflow-hidden">
                  <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${(count / maxP) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reservations ──────────────────────────────────────────────────────────────
function ReservationsTab({ pw }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(null)

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
    setBusy(null)
  }

  async function del(id) {
    if (!confirm('Padam tempahan ini?')) return
    await fetch(`/api/reservations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${pw}` } })
    setRows(p => p.filter(r => r.id !== id))
  }

  function csv() {
    const hdr = ['Nama','Emel','Telefon','Tarikh','Masa','Bilangan','Cawangan','Status','Didaftar']
    const body = rows.map(r => [r.name,r.email,r.phone,r.date,r.time,r.pax,`"${r.branch}"`,r.status,fmtDate(r.created_at)].join(','))
    const blob = new Blob([[hdr.join(','),...body].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `tempahan_${new Date().toISOString().split('T')[0]}.csv` })
    a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {['all','pending','confirmed','cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-forest text-cream' : 'bg-white text-muted border border-brown/20'}`}>
              {s === 'all' ? 'Semua' : s} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / telefon..."
            className="border border-brown/20 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/30 w-44" />
          <button onClick={csv} className="bg-forest/10 text-forest px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-forest/20">⬇ CSV</button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream border-b border-brown/8">
                  {['Nama','Telefon','Tarikh & Masa','Biji','Cawangan','Status','Tindakan'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted">Tiada rekod</td></tr>}
                {shown.map(r => (
                  <tr key={r.id} className="border-b border-brown/5 hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brown">{r.name}</div>
                      <div className="text-muted text-xs">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{r.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium">{r.date}</div>
                      <div className="text-muted text-xs">{r.time}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-forest">{r.pax}</td>
                    <td className="px-4 py-3 text-muted text-xs max-w-[140px]">{r.branch}</td>
                    <td className="px-4 py-3">
                      <select value={r.status} onChange={e => setStatus(r.id, e.target.value)} disabled={busy === r.id}
                        className={`${STATUS_STYLE[r.status] || ''} text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-60`}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(r.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50">Padam</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-cream/50 text-xs text-muted border-t border-brown/8">
            {shown.length} daripada {rows.length} rekod
          </div>
        </div>
      )}
    </div>
  )
}

// ── Menu ──────────────────────────────────────────────────────────────────────
const CATS = [
  { id: 'apam',   name: 'Kuih Kukus',      emoji: '🫓' },
  { id: 'kaswi',  name: 'Kaswi',           emoji: '🍮' },
  { id: 'santan', name: 'Kuih Santan',      emoji: '🥥' },
  { id: 'nasi',   name: 'Nasi & Hidangan',  emoji: '🍚' },
]

const BLANK = { category_id: 'apam', name: '', description: '', price: '', min_order: 50, image_url: '', is_available: true }

function MenuTab({ pw }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState(BLANK)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Fetch all items (including unavailable) for admin
    fetch('/api/menu').then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false) })
  }, [])

  async function saveEdit() {
    setSaving(true)
    const res = await fetch(`/api/menu/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` }, body: JSON.stringify(editData) })
    const data = await res.json()
    if (data.item) setItems(p => p.map(i => i.id === editId ? data.item : i))
    setEditId(null); setSaving(false)
  }

  async function del(id) {
    if (!confirm('Padam item menu ini?')) return
    await fetch(`/api/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${pw}` } })
    setItems(p => p.filter(i => i.id !== id))
  }

  async function addItem() {
    if (!newItem.name || !newItem.price) return
    setSaving(true)
    const cat = CATS.find(c => c.id === newItem.category_id) || CATS[0]
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
      body: JSON.stringify({ ...newItem, category_name: cat.name, category_emoji: cat.emoji }),
    })
    const data = await res.json()
    if (data.item) { setItems(p => [...p, data.item]); setNewItem(BLANK); setShowAdd(false) }
    setSaving(false)
  }

  const grouped = CATS.map(cat => ({ ...cat, items: items.filter(i => i.category_id === cat.id) }))

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-brown">Item Menu ({items.length})</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-forest text-cream px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brown transition-colors">
          + Tambah Item
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-forest/20 rounded-xl p-5 space-y-3">
          <h4 className="font-semibold text-forest text-sm">Item Baharu</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1 block">Kategori</label>
              <select value={newItem.category_id} onChange={e => setNewItem(p => ({ ...p, category_id: e.target.value }))}
                className="w-full border border-brown/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30">
                {CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Nama Item *</label>
              <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="Nama kuih..."
                className="w-full border border-brown/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted mb-1 block">Keterangan</label>
              <textarea value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Keterangan..."
                className="w-full border border-brown/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Harga (RM) *</label>
              <input type="number" step="0.01" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} placeholder="0.00"
                className="w-full border border-brown/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Minimum Order</label>
              <input type="number" value={newItem.min_order} onChange={e => setNewItem(p => ({ ...p, min_order: parseInt(e.target.value) }))}
                className="w-full border border-brown/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted hover:text-brown">Batal</button>
            <button onClick={addItem} disabled={saving || !newItem.name || !newItem.price}
              className="bg-forest text-cream px-5 py-2 rounded-lg text-sm font-semibold hover:bg-brown disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {loading ? <Spinner /> : grouped.map(cat => (
        <div key={cat.id} className="bg-white rounded-xl border border-brown/8 overflow-hidden">
          <div className="px-4 py-3 bg-cream2/40 border-b border-brown/8 flex items-center gap-2">
            <span>{cat.emoji}</span>
            <h4 className="font-fraunces font-semibold text-forest">{cat.name}</h4>
            <span className="text-muted text-xs ml-1">({cat.items.length})</span>
          </div>
          <div className="divide-y divide-brown/5">
            {cat.items.length === 0 && <div className="px-4 py-4 text-muted text-sm text-center">Tiada item</div>}
            {cat.items.map(item => (
              <div key={item.id} className="px-4 py-3">
                {editId === item.id ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                      className="border border-brown/20 rounded-lg px-3 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-forest/30" />
                    <input value={editData.description || ''} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Keterangan" className="border border-brown/20 rounded-lg px-3 py-1.5 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-forest/30" />
                    <input type="number" step="0.01" value={editData.price} onChange={e => setEditData(p => ({ ...p, price: parseFloat(e.target.value) }))}
                      placeholder="Harga" className="border border-brown/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
                    <input type="number" value={editData.min_order} onChange={e => setEditData(p => ({ ...p, min_order: parseInt(e.target.value) }))}
                      placeholder="Min order" className="border border-brown/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30" />
                    <div className="col-span-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editData.is_available} onChange={e => setEditData(p => ({ ...p, is_available: e.target.checked }))} className="accent-forest" />
                        <span className="text-sm text-muted">Tersedia</span>
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => setEditId(null)} className="px-3 py-1.5 text-xs text-muted hover:text-brown">Batal</button>
                        <button onClick={saveEdit} disabled={saving} className="bg-forest text-cream px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">
                          {saving ? '...' : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-brown text-sm">{item.name}</span>
                        {!item.is_available && <span className="text-[0.6rem] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">Habis</span>}
                      </div>
                      <div className="text-muted text-xs mt-0.5 truncate">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-terra font-bold text-sm">RM {parseFloat(item.price).toFixed(2)}</div>
                        <div className="text-muted text-xs">Min {item.min_order}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditId(item.id); setEditData({ ...item }) }} className="text-forest text-xs font-semibold px-2 py-1 rounded hover:bg-forest/10">Edit</button>
                        <button onClick={() => del(item.id)} className="text-red-500 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50">Padam</button>
                      </div>
                    </div>
                  </div>
                )}
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
  const [saving, setSaving] = useState(false)
  const [group, setGroup] = useState('home')

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
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${group === g ? 'bg-forest text-cream' : 'bg-white text-muted border border-brown/20'}`}>
            {g}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-brown/8 overflow-hidden divide-y divide-brown/5">
          {shown.map(item => {
            const uid = `${item.page}.${item.key}`
            const isEditing = editKey === uid
            return (
              <div key={uid} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.65rem] font-semibold text-muted uppercase tracking-wide mb-1">{item.label}</div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea value={editVal} onChange={e => setEditVal(e.target.value)} rows={item.value.length > 80 ? 4 : 2}
                          className="w-full border border-forest/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => setEditKey(null)} className="text-sm text-muted hover:text-brown px-2">Batal</button>
                          <button onClick={() => save(item.page, item.key)} disabled={saving}
                            className="bg-forest text-cream px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                            {saving ? '...' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-brown text-sm leading-relaxed">{item.value}</p>
                    )}
                  </div>
                  {!isEditing && (
                    <button onClick={() => { setEditKey(uid); setEditVal(item.value) }}
                      className="text-forest text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-forest/10 shrink-0">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-xs text-muted">Perubahan kandungan disimpan dalam pangkalan data dan akan dipaparkan apabila halaman dimuat semula.</p>
    </div>
  )
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsTab({ pw }) {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/stats', { headers: { Authorization: `Bearer ${pw}` } })
      .then(r => r.json()).then(d => { setVisits(d.visits || []); setLoading(false) })
  }, [pw])

  if (loading) return <Spinner />

  const today = new Date().toISOString().split('T')[0]

  // By page
  const byPage = visits.reduce((a, v) => { a[v.page || '/'] = (a[v.page || '/'] || 0) + 1; return a }, {})
  const pageList = Object.entries(byPage).sort((a, b) => b[1] - a[1])
  const maxP = pageList[0]?.[1] || 1

  // Last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const iso = d.toISOString().split('T')[0]
    return { iso, label: d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }), count: visits.filter(v => v.visited_at?.startsWith(iso)).length }
  })
  const maxD = Math.max(...days.map(d => d.count), 1)

  // Referrers
  const byRef = visits.reduce((a, v) => { const k = safeHost(v.referrer); a[k] = (a[k] || 0) + 1; return a }, {})
  const refList = Object.entries(byRef).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Jumlah Lawatan', val: visits.length },
          { label: 'Halaman Unik',   val: pageList.length },
          { label: 'Hari Ini',       val: visits.filter(v => v.visited_at?.startsWith(today)).length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-brown/8 p-4 text-center">
            <div className="font-fraunces font-black text-3xl text-forest">{s.val}</div>
            <div className="text-muted text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 14-day bar chart */}
      <div className="bg-white rounded-xl border border-brown/8 p-5">
        <h3 className="font-semibold text-brown text-sm mb-4">Lawatan 14 Hari Terakhir</h3>
        <div className="flex items-end gap-1" style={{ height: 120 }}>
          {days.map(d => (
            <div key={d.iso} title={`${d.label}: ${d.count}`} className="flex-1 flex flex-col items-center justify-end gap-1 group cursor-default">
              <div className="w-full bg-forest/70 rounded-t transition-all" style={{ height: `${Math.max(d.count > 0 ? 4 : 0, (d.count / maxD) * 100)}%` }} />
              <div className="text-[0.5rem] text-muted whitespace-nowrap" style={{ fontSize: '0.5rem' }}>{d.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted text-center">Hover bar untuk butiran · {visits.length} lawatan jumlah</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-brown/8 p-5">
          <h3 className="font-semibold text-brown text-sm mb-4">Lawatan per Halaman</h3>
          <div className="space-y-3">
            {pageList.length === 0 && <p className="text-muted text-sm text-center py-4">Tiada data</p>}
            {pageList.map(([page, count]) => (
              <div key={page}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-brown font-medium">{page}</span>
                  <span className="text-muted text-xs">{count}</span>
                </div>
                <div className="h-2 bg-cream2 rounded-full overflow-hidden">
                  <div className="h-full bg-forest/70 rounded-full" style={{ width: `${(count / maxP) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-brown/8 p-5">
          <h3 className="font-semibold text-brown text-sm mb-4">Sumber Lawatan</h3>
          <div className="space-y-2">
            {refList.length === 0 && <p className="text-muted text-sm text-center py-4">Tiada data</p>}
            {refList.map(([ref, count]) => (
              <div key={ref} className="flex items-center justify-between text-sm py-1.5 border-b border-brown/5 last:border-0">
                <span className="text-brown">{ref}</span>
                <span className="bg-forest/8 text-forest text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="py-16 text-center text-muted text-sm">Memuatkan...</div>
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'reservations', label: 'Tempahan' },
  { id: 'menu',         label: 'Menu' },
  { id: 'content',      label: 'Kandungan' },
  { id: 'analytics',    label: 'Analitik' },
]

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

  return (
    <div className="min-h-screen bg-cream pt-[70px]">
      <div className="bg-forest px-6 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-gold/60 text-[0.7rem] tracking-[3px] uppercase mb-1">Pentadbiran</div>
            <h1 className="font-fraunces font-black text-3xl text-cream">Admin Dashboard</h1>
          </div>
          <button onClick={() => { sessionStorage.removeItem('adminPw'); setPw(null) }}
            className="text-cream/50 hover:text-cream text-sm transition-colors">
            Log Keluar
          </button>
        </div>
      </div>

      <div className="border-b border-brown/10 bg-white sticky top-[70px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-forest text-forest' : 'border-transparent text-muted hover:text-brown'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'overview'     && <OverviewTab     pw={pw} />}
        {tab === 'reservations' && <ReservationsTab pw={pw} />}
        {tab === 'menu'         && <MenuTab         pw={pw} />}
        {tab === 'content'      && <ContentTab      pw={pw} />}
        {tab === 'analytics'    && <AnalyticsTab    pw={pw} />}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

const STATUS_STYLE = {
  pending:   'bg-yellow-100 text-yellow-800 border border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border border-green-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminPage() {
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [filter,       setFilter]       = useState('all')
  const [search,       setSearch]       = useState('')

  useEffect(() => {
    fetch('/api/reservations')
      .then(r => r.json())
      .then(d => { setReservations(d.reservations || []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const filtered = reservations
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search))

  const counts = {
    all:       reservations.length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  }

  function downloadCSV() {
    const headers = ['Nama','Emel','Telefon','Tarikh','Masa','Bilangan','Cawangan','Status','Didaftar']
    const rows = reservations.map(r =>
      [r.name, r.email, r.phone, r.date, r.time, r.pax, `"${r.branch}"`, r.status, fmtDate(r.created_at)].join(',')
    )
    const csv  = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `tempahan_dkampung_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-cream pt-[70px]">
      {/* Header */}
      <div className="bg-forest px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-gold/60 text-[0.7rem] tracking-[3px] uppercase mb-2">Pentadbiran</div>
            <h1 className="font-fraunces font-black text-4xl text-cream">Admin Dashboard</h1>
            <p className="text-cream/50 text-sm mt-1">Senarai semua tempahan kuih DKAMPUNG</p>
          </div>
          {/* Stats */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Jumlah',     val: counts.all,       color: 'bg-cream/10' },
              { label: 'Pending',    val: counts.pending,   color: 'bg-yellow-500/20' },
              { label: 'Confirmed',  val: counts.confirmed, color: 'bg-green-500/20' },
              { label: 'Cancelled',  val: counts.cancelled, color: 'bg-red-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl px-5 py-3 text-center`}>
                <div className="font-fraunces font-black text-2xl text-cream">{s.val}</div>
                <div className="text-cream/50 text-[0.65rem] uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all','pending','confirmed','cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                  filter === s
                    ? 'bg-forest text-cream'
                    : 'bg-white text-muted border border-brown/20 hover:border-forest/40'
                }`}>
                {s === 'all' ? 'Semua' : s} ({counts[s] ?? 0})
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama / telefon..."
              className="border border-brown/20 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest/30 w-48" />
            {/* Export */}
            <button onClick={downloadCSV}
              className="bg-forest/10 text-forest px-4 py-2 rounded-xl text-sm font-semibold hover:bg-forest/20 transition-colors whitespace-nowrap">
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {/* States */}
        {loading && <div className="text-center py-20 text-muted">Memuatkan data...</div>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">Ralat: {error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-muted">Tiada tempahan ditemui.</div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream border-b border-brown/8">
                    {['#','Nama & Emel','Telefon','Tarikh','Masa','Biji','Cawangan','Status','Didaftar'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="border-b border-brown/5 hover:bg-cream/50 transition-colors">
                      <td className="px-4 py-3 text-muted text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brown">{r.name}</div>
                        <div className="text-muted text-xs">{r.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{r.phone}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{r.time}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-forest">{r.pax}</span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs max-w-[160px]">{r.branch}</td>
                      <td className="px-4 py-3">
                        <span className={`${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-600'} px-2.5 py-1 rounded-full text-xs font-semibold capitalize`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                        {fmtDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-cream/50 text-xs text-muted border-t border-brown/8">
              Menunjukkan {filtered.length} daripada {reservations.length} rekod
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

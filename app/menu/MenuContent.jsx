'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Calendar } from 'lucide-react'

const CAT_ACCENTS = [
  { dot: 'bg-forest',  label: 'text-forest'  },
  { dot: 'bg-terra',   label: 'text-terra'   },
  { dot: 'bg-sage',    label: 'text-sage'    },
  { dot: 'bg-brown2',  label: 'text-brown2'  },
]

const TAG_BADGE = {
  'Kaswi Pandan':  { label: 'Best Seller', cls: 'bg-forest text-cream' },
  'Apam Putih':    { label: 'Popular',     cls: 'bg-gold text-charcoal' },
  'Tepung Pelita': { label: 'Klasik',      cls: 'bg-terra text-cream' },
  'Kaswi Coklat':  { label: 'Kegemaran',   cls: 'bg-brown2 text-cream' },
}

function MenuCard({ item, emoji }) {
  const badge = TAG_BADGE[item.name]
  return (
    <div className="bg-stone rounded-2xl p-4 flex flex-col gap-2.5
      hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]
      transition-all duration-200 border border-transparent hover:border-brown/8
      active:scale-[0.98]">

      {/* Image */}
      <div className="w-full aspect-square rounded-xl overflow-hidden relative
        bg-gradient-to-br from-cream to-stone/60 flex items-center justify-center">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
        ) : (
          <span className="text-5xl opacity-55 select-none">{emoji}</span>
        )}
        {badge && (
          <span className={`absolute top-2.5 left-2.5 text-[0.58rem] font-bold uppercase tracking-wide
            px-2 py-0.5 rounded-full ${badge.cls}`}>
            · {badge.label}
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="font-fraunces font-semibold text-charcoal text-[0.95rem] leading-tight">
          {item.name}
        </h3>
        <p className="text-muted text-xs leading-relaxed mt-1 line-clamp-2">{item.desc}</p>
      </div>

      {/* Price + min badge */}
      <div className="flex items-center justify-between pt-2.5 border-t border-brown/8">
        <span className="text-terra font-bold text-sm">
          RM {parseFloat(item.price).toFixed(2)}
          <span className="text-muted font-normal text-xs ml-1">/ pax</span>
        </span>
        {item.min > 1 && (
          <span className="text-[0.58rem] font-semibold uppercase tracking-wide
            bg-forest/8 text-forest px-2 py-0.5 rounded-full">
            Min. {item.min}
          </span>
        )}
      </div>
    </div>
  )
}

function CategoryCard({ cat, idx }) {
  const accent = CAT_ACCENTS[idx % CAT_ACCENTS.length]
  return (
    <div className="bg-white rounded-3xl border border-brown/8 overflow-hidden
      hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] transition-shadow duration-300">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-brown/6">
        <span className={`w-2 h-2 rounded-full ${accent.dot} shrink-0`} />
        <h2 className={`font-fraunces font-bold text-xl ${accent.label}`}>{cat.category}</h2>
        <span className="text-2xl ml-1">{cat.emoji}</span>
        <span className="ml-auto text-muted text-xs">{cat.items.length} item</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {cat.items.map(item => (
          <MenuCard key={item.name} item={item} emoji={cat.emoji} />
        ))}
      </div>
    </div>
  )
}

export default function MenuContent({ menu }) {
  const [search, setSearch]     = useState('')
  const [activeId, setActiveId] = useState('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return menu
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.desc?.toLowerCase().includes(q)
        ),
      }))
      .filter(cat =>
        (activeId === 'all' || cat.id === activeId) &&
        cat.items.length > 0
      )
  }, [menu, search, activeId])

  const isEmpty = filtered.length === 0

  return (
    <>
      {/* ── Sticky category + search bar ── */}
      <div className="sticky top-[68px] z-40 bg-stone/95 backdrop-blur-md
        border-b border-brown/8 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3">

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 pb-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[{ id: 'all', category: 'Semua', emoji: '🍽' }, ...menu].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveId(cat.id); setSearch('') }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                    whitespace-nowrap transition-all duration-150 shrink-0
                    ${activeId === cat.id
                      ? 'bg-forest text-cream shadow-sm'
                      : 'bg-white text-charcoal/70 hover:bg-cream border border-brown/10'
                    }`}
                >
                  <span>{cat.emoji}</span>
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveId('all') }}
                placeholder="Cari kuih..."
                className="pl-8 pr-7 py-1.5 rounded-full text-xs border border-brown/15 bg-white
                  focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30
                  w-32 md:w-44 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Menu grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {isEmpty ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-5">🔍</div>
            <div className="font-fraunces font-bold text-xl text-charcoal mb-2">Tiada Keputusan</div>
            <div className="text-muted text-sm mb-6">Cuba nama kuih yang lain.</div>
            <button onClick={() => { setSearch(''); setActiveId('all') }}
              className="text-forest text-sm font-semibold underline underline-offset-2 hover:text-terra transition-colors">
              Papar semua menu
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: single column */}
            <div className="flex flex-col gap-6 md:hidden">
              {filtered.map((cat, idx) => (
                <CategoryCard key={cat.id} cat={cat} idx={idx} />
              ))}
            </div>
            {/* Desktop: two independent masonry columns */}
            <div className="hidden md:flex gap-6 items-start">
              <div className="flex-1 flex flex-col gap-6">
                {filtered.filter((_, i) => i % 2 === 0).map(cat => (
                  <CategoryCard key={cat.id} cat={cat} idx={filtered.indexOf(cat)} />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-6">
                {filtered.filter((_, i) => i % 2 === 1).map(cat => (
                  <CategoryCard key={cat.id} cat={cat} idx={filtered.indexOf(cat)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Enhanced CTA ── */}
      <div className="bg-cream py-20 text-center px-6">
        <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-4">Tempahan Terbuka</div>
        <h3 className="font-fraunces font-black text-charcoal mb-3"
          style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
          Sedia untuk order?
        </h3>
        <p className="text-muted mb-3 text-sm max-w-sm mx-auto leading-relaxed">
          Isi borang tempahan atau hubungi kami terus via WhatsApp.
        </p>

        {/* Quick stats */}
        <div className="flex items-center justify-center gap-6 mb-10 text-xs text-muted/70">
          {['Min. 50 pax', 'Segar setiap hari', 'Pengesahan 24 jam'].map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-muted/30" />}
              {s}
            </span>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/reservations"
            className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3.5 rounded-full
              font-semibold text-sm hover:bg-forest transition-all duration-150 active:scale-[0.96]
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            <Calendar className="w-4 h-4" />
            Buat Tempahan Sekarang →
          </Link>
          <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-full
              font-semibold text-sm hover:opacity-90 transition-all duration-150 active:scale-[0.96]
              shadow-[0_4px_20px_rgba(37,211,102,0.28)]">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

    </>
  )
}

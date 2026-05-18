import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const FALLBACK = [
  { id: 'apam',   category: 'Kuih Kukus',     emoji: '🫓', items: [
    { name: 'Apam Putih',  desc: 'Gebu, lembut, dan manis semula jadi — klasik yang tak pernah jemu.',   price: 1.50, min: 50, image: null },
    { name: 'Apam Pandan', desc: 'Versi pandan harum dengan warna hijau semula jadi dari daun pandan.',   price: 1.50, min: 50, image: null },
    { name: 'Apam Keladi', desc: 'Rasa keladi yang unik dan lembut, pilihan istimewa untuk majlis.',      price: 1.60, min: 50, image: null },
  ]},
  { id: 'kaswi',  category: 'Kaswi',           emoji: '🍮', items: [
    { name: 'Kaswi Jagung', desc: 'Manis jagung dengan tekstur gebu dan lembut, sesuai untuk semua peringkat umur.', price: 1.80, min: 50, image: null },
    { name: 'Kaswi Pandan', desc: 'Harum pandan dengan tekstur kenyal yang sempurna, kegemaran pelanggan kami.',     price: 1.80, min: 50, image: null },
    { name: 'Kaswi Coklat', desc: 'Kelazatan coklat premium dengan tekstur kenyal yang memikat.',                    price: 1.80, min: 50, image: null },
    { name: 'Kaswi Ubi',    desc: 'Rasa ubi jalar yang semula jadi, lembut dan manis secara semula jadi.',           price: 1.80, min: 50, image: null },
  ]},
  { id: 'santan', category: 'Kuih Santan',     emoji: '🥥', items: [
    { name: 'Tepung Pelita',  desc: 'Dua lapisan yang indah — hijau pandan di bawah, putih santan di atas.',  price: 2.00, min: 50, image: null },
    { name: 'Kuih Talam',     desc: 'Lembut berlapisan dengan rasa santan yang kaya dan pandan yang harum.',   price: 2.00, min: 50, image: null },
    { name: 'Serimuka Pulut', desc: 'Pulut kukus lembut dilapisi custard pandan yang halus dan wangi.',        price: 2.50, min: 50, image: null },
  ]},
  { id: 'nasi',   category: 'Nasi & Hidangan', emoji: '🍚', items: [
    { name: 'Nasi Lemak Che Dil', desc: 'Nasi lemak dengan sambal khas Che Dil, ayam goreng berempah, telur rebus, dan timun segar.', price: 5.00, min: 1, image: null },
  ]},
]

export const revalidate = 0

const CAT_ORDER = ['apam','kaswi','santan','nasi']

async function getMenu() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase
      .from('menu_items').select('*').eq('is_available', true)
      .order('category_id').order('sort_order')

    if (error || !data?.length) return FALLBACK

    const map = {}
    data.forEach(item => {
      if (!item.name) return // skip items with no name
      if (!map[item.category_id]) {
        map[item.category_id] = { id: item.category_id, category: item.category_name, emoji: item.category_emoji, items: [] }
      }
      map[item.category_id].items.push({ name: item.name, desc: item.description, price: item.price, min: item.min_order, image: item.image_url || null })
    })

    const sorted = CAT_ORDER.map(id => map[id]).filter(Boolean)
    const extra  = Object.values(map).filter(c => !CAT_ORDER.includes(c.id))
    return [...sorted, ...extra].filter(cat => cat.items.length > 0)
  } catch {
    return FALLBACK
  }
}

const CAT_ACCENTS = [
  { dot: 'bg-forest',  label: 'text-forest' },
  { dot: 'bg-terra',   label: 'text-terra'  },
  { dot: 'bg-sage',    label: 'text-sage'   },
  { dot: 'bg-brown2',  label: 'text-brown2' },
]

function MenuCard({ item, emoji }) {
  return (
    <div className="bg-stone rounded-2xl p-4 flex flex-col gap-2.5
      hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]
      transition-all duration-200 border border-transparent hover:border-brown/8
      active:scale-[0.98]">
      <div className="w-full aspect-square rounded-xl overflow-hidden relative
        bg-gradient-to-br from-cream to-stone/60 flex items-center justify-center">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <span className="text-5xl opacity-55 select-none">{emoji}</span>
        )}
      </div>
      <div>
        <h3 className="font-fraunces font-semibold text-charcoal text-[0.95rem] leading-tight">
          {item.name}
        </h3>
        <p className="text-muted text-xs leading-relaxed mt-1 line-clamp-2">{item.desc}</p>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-brown/8">
        <span className="text-terra font-bold text-sm">
          RM {parseFloat(item.price).toFixed(2)}
          <span className="text-muted font-normal text-xs ml-1">/ biji</span>
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
      <div className="p-4 flex flex-col gap-3">
        {cat.items.map(item => (
          <MenuCard key={item.name} item={item} emoji={cat.emoji} />
        ))}
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Menu Kuih – DKAMPUNG',
  description: 'Senarai lengkap kuih tradisional DKAMPUNG: Apam, Kaswi, Tepung Pelita, Nasi Lemak dan lebih.',
}

export default async function MenuPage() {
  const MENU  = await getMenu()
  const left  = MENU.filter((_, i) => i % 2 === 0)
  const right = MENU.filter((_, i) => i % 2 === 1)

  return (
    <div className="min-h-screen bg-stone pt-[68px]">

      {/* ── Header ── */}
      <div className="relative overflow-hidden py-20 text-center px-6"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1666239308345-c4c12ef3e177?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="absolute inset-0 bg-charcoal/90" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative">
          <div className="text-gold text-[0.62rem] tracking-[4px] uppercase mb-4 font-semibold">Pilihan Kami</div>
          <h1 className="font-fraunces font-black text-cream leading-none mb-5"
            style={{ fontSize: 'clamp(3.5rem,7vw,6rem)', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            Menu Kuih
          </h1>
          <p className="text-cream/90 max-w-sm mx-auto text-[0.9rem] leading-relaxed"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            Semua kuih dibuat segar setiap hari menggunakan bahan-bahan semula jadi pilihan.
            Tempahan minimum 50 biji jumlah.
          </p>
        </div>
      </div>

      {/* ── Categories — two independent columns (no height matching) ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Mobile: single column */}
        <div className="flex flex-col gap-6 md:hidden">
          {MENU.map((cat, idx) => (
            <CategoryCard key={cat.id} cat={cat} idx={idx} />
          ))}
        </div>

        {/* Desktop: two independent flex columns so each column flows on its own */}
        <div className="hidden md:flex gap-6 items-start">
          <div className="flex-1 flex flex-col gap-6">
            {left.map(cat => (
              <CategoryCard key={cat.id} cat={cat} idx={MENU.indexOf(cat)} />
            ))}
          </div>
          <div className="flex-1 flex flex-col gap-6">
            {right.map(cat => (
              <CategoryCard key={cat.id} cat={cat} idx={MENU.indexOf(cat)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="bg-cream py-20 text-center px-6">
        <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-4">Tempahan Terbuka</div>
        <h3 className="font-fraunces font-black text-charcoal mb-4"
          style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)' }}>
          Sedia untuk order?
        </h3>
        <p className="text-muted mb-10 text-sm max-w-sm mx-auto leading-relaxed">
          Isi borang tempahan atau hubungi kami terus via WhatsApp.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/reservations"
            className="bg-charcoal text-cream px-8 py-3.5 rounded-full font-semibold text-sm
              hover:bg-forest transition-all duration-150 active:scale-[0.96]">
            Buat Tempahan Sekarang →
          </Link>
          <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-8 py-3.5 rounded-full font-semibold text-sm
              hover:opacity-90 transition-all duration-150 active:scale-[0.96]">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

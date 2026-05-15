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
      if (!map[item.category_id]) {
        map[item.category_id] = { id: item.category_id, category: item.category_name, emoji: item.category_emoji, items: [] }
      }
      map[item.category_id].items.push({ name: item.name, desc: item.description, price: item.price, min: item.min_order, image: item.image_url || null })
    })

    const sorted = CAT_ORDER.map(id => map[id]).filter(Boolean)
    const extra  = Object.values(map).filter(c => !CAT_ORDER.includes(c.id))
    return [...sorted, ...extra]
  } catch {
    return FALLBACK
  }
}

// Category accent colours (index-based)
const CAT_ACCENTS = [
  { dot: 'bg-forest',  ring: 'ring-forest/20',  label: 'text-forest' },
  { dot: 'bg-terra',   ring: 'ring-terra/20',   label: 'text-terra'  },
  { dot: 'bg-sage',    ring: 'ring-sage/20',    label: 'text-sage'   },
  { dot: 'bg-brown2',  ring: 'ring-brown2/20',  label: 'text-brown2' },
]

function MenuCard({ item }) {
  return (
    <div className="bg-stone rounded-2xl p-4 flex flex-col gap-3
      hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]
      transition-all duration-200 border border-transparent hover:border-brown/8">
      {/* Thumbnail */}
      <div className="w-full h-28 rounded-xl bg-cream2/70 flex items-center justify-center
        relative overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <span className="text-3xl opacity-20 select-none">📷</span>
        )}
      </div>
      {/* Info */}
      <div className="flex-1">
        <h3 className="font-fraunces font-semibold text-charcoal text-[0.95rem] leading-tight">
          {item.name}
        </h3>
        <p className="text-muted text-xs leading-relaxed mt-1 line-clamp-2">{item.desc}</p>
      </div>
      {/* Price row */}
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

export const metadata = {
  title: 'Menu Kuih – DKAMPUNG',
  description: 'Senarai lengkap kuih tradisional DKAMPUNG: Apam, Kaswi, Tepung Pelita, Nasi Lemak dan lebih.',
}

export default async function MenuPage() {
  const MENU = await getMenu()

  return (
    <div className="min-h-screen bg-stone pt-[68px]">

      {/* ── Header ── */}
      <div className="bg-charcoal relative overflow-hidden py-20 text-center px-6">
        {/* dot pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative">
          <div className="text-gold/50 text-[0.62rem] tracking-[4px] uppercase mb-4">Pilihan Kami</div>
          <h1 className="font-fraunces font-black text-cream leading-none mb-5"
            style={{ fontSize: 'clamp(3.5rem,7vw,6rem)' }}>
            Menu Kuih
          </h1>
          <p className="text-cream/40 max-w-sm mx-auto text-[0.9rem] leading-relaxed">
            Semua kuih dibuat segar setiap hari menggunakan bahan-bahan semula jadi pilihan.
            Tempahan minimum 50 biji per jenis.
          </p>
        </div>
      </div>

      {/* ── Categories grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {MENU.map((cat, idx) => {
            const accent = CAT_ACCENTS[idx % CAT_ACCENTS.length]
            return (
              <div key={cat.id} className="bg-white rounded-3xl border border-brown/8 overflow-hidden
                hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] transition-shadow duration-300">

                {/* Category header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-brown/6">
                  <span className={`w-2 h-2 rounded-full ${accent.dot} shrink-0`} />
                  <h2 className={`font-fraunces font-bold text-xl ${accent.label}`}>
                    {cat.category}
                  </h2>
                  <span className="text-2xl ml-1">{cat.emoji}</span>
                  <span className="ml-auto text-muted text-xs">{cat.items.length} item</span>
                </div>

                {/* Items */}
                <div className="p-4 grid grid-cols-1 gap-3">
                  {cat.items.map(item => (
                    <MenuCard key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
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
              hover:bg-forest transition-colors">
            Buat Tempahan Sekarang →
          </Link>
          <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-8 py-3.5 rounded-full font-semibold text-sm
              hover:opacity-90 transition-opacity">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

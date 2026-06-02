import { createClient } from '@supabase/supabase-js'
import MenuContent from './MenuContent'

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

const CAT_ORDER = ['apam', 'kaswi', 'santan', 'nasi']

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
      if (!item.name) return
      if (!map[item.category_id]) {
        map[item.category_id] = { id: item.category_id, category: item.category_name, emoji: item.category_emoji, items: [] }
      }
      map[item.category_id].items.push({
        name:  item.name,
        desc:  item.description,
        price: item.price,
        min:   item.min_order,
        image: item.image_url || null,
      })
    })

    const sorted = CAT_ORDER.map(id => map[id]).filter(Boolean)
    const extra  = Object.values(map).filter(c => !CAT_ORDER.includes(c.id))
    return [...sorted, ...extra].filter(cat => cat.items.length > 0)
  } catch {
    return FALLBACK
  }
}

export const metadata = {
  title: 'Menu Kuih – DKAMPUNG',
  description: 'Senarai lengkap kuih tradisional DKAMPUNG: Apam, Kaswi, Tepung Pelita, Nasi Lemak dan lebih.',
}

export default async function MenuPage() {
  const MENU = await getMenu()

  return (
    <div className="min-h-screen bg-stone pt-[68px]">

      {/* ── Hero header ── */}
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
            Tempahan minimum 50 pax jumlah.
          </p>
        </div>
      </div>

      {/* ── Interactive menu (tabs + search + grid + CTA + FAB) ── */}
      <MenuContent menu={MENU} />

    </div>
  )
}

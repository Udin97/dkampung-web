import Link from 'next/link'
import Image from 'next/image'

const MENU = [
  {
    id: 'apam',
    category: 'Kuih Kukus',
    emoji: '🫓',
    items: [
      { name: 'Apam Putih',  desc: 'Gebu, lembut, dan manis semula jadi — klasik yang tak pernah jemu.',   price: 1.50, min: 50, image: null },
      { name: 'Apam Pandan', desc: 'Versi pandan harum dengan warna hijau semula jadi dari daun pandan.',   price: 1.50, min: 50, image: null },
      { name: 'Apam Keladi', desc: 'Rasa keladi yang unik dan lembut, pilihan istimewa untuk majlis.',      price: 1.60, min: 50, image: null },
    ],
  },
  {
    id: 'kaswi',
    category: 'Kaswi',
    emoji: '🍮',
    items: [
      { name: 'Kaswi Jagung',  desc: 'Manis jagung dengan tekstur gebu dan lembut, sesuai untuk semua peringkat umur.', price: 1.80, min: 50, image: null },
      { name: 'Kaswi Pandan',  desc: 'Harum pandan dengan tekstur kenyal yang sempurna, kegemaran pelanggan kami.',     price: 1.80, min: 50, image: null },
      { name: 'Kaswi Coklat',  desc: 'Kelazatan coklat premium dengan tekstur kenyal yang memikat.',                    price: 1.80, min: 50, image: null },
      { name: 'Kaswi Ubi',     desc: 'Rasa ubi jalar yang semula jadi, lembut dan manis secara semula jadi.',           price: 1.80, min: 50, image: null },
    ],
  },
  {
    id: 'santan',
    category: 'Kuih Santan',
    emoji: '🥥',
    items: [
      { name: 'Tepung Pelita',   desc: 'Dua lapisan yang indah — hijau pandan di bawah, putih santan di atas. Klasik tradisi.',          price: 2.00, min: 50, image: null },
      { name: 'Kuih Talam',      desc: 'Lembut berlapisan dengan rasa santan yang kaya dan pandan yang harum.',                           price: 2.00, min: 50, image: null },
      { name: 'Serimuka Pulut',  desc: 'Pulut kukus lembut dilapisi custard pandan yang halus dan wangi.',                                price: 2.50, min: 50, image: null },
    ],
  },
  {
    id: 'nasi',
    category: 'Nasi & Hidangan',
    emoji: '🍚',
    items: [
      { name: 'Nasi Lemak Che Dil', desc: 'Nasi lemak dengan sambal khas Che Dil, ayam goreng berempah, telur rebus, dan timun segar.', price: 5.00, min: 1, image: null },
    ],
  },
]

function MenuCard({ item }) {
  return (
    <div className="bg-white rounded-xl border border-brown/8 p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Thumbnail */}
      <div className="w-full h-28 rounded-lg bg-cream2 flex items-center justify-center relative overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <span className="text-3xl opacity-30">📷</span>
        )}
      </div>
      {/* Info */}
      <div className="flex-1">
        <h3 className="font-fraunces font-semibold text-brown text-base leading-tight">{item.name}</h3>
        <p className="text-muted text-xs leading-relaxed mt-1 line-clamp-2">{item.desc}</p>
      </div>
      {/* Price row */}
      <div className="flex items-center justify-between pt-2 border-t border-brown/6">
        <span className="text-terra font-bold text-sm">RM {item.price.toFixed(2)} <span className="text-muted font-normal text-xs">/ biji</span></span>
        {item.min > 1 && (
          <span className="text-[0.6rem] font-semibold uppercase tracking-wide bg-forest/8 text-forest px-2 py-0.5 rounded-full">
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

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-white pt-[70px]">
      {/* Header */}
      <div className="bg-forest py-16 text-center px-6">
        <div className="text-gold/60 text-[0.7rem] tracking-[3px] uppercase mb-3">Pilihan Kami</div>
        <h1 className="font-fraunces font-black text-5xl text-cream mb-4">Menu Kuih</h1>
        <p className="text-cream/60 max-w-md mx-auto">
          Semua kuih dibuat segar setiap hari menggunakan bahan-bahan semula jadi pilihan.
          Tempahan minimum 50 biji per jenis.
        </p>
      </div>

      {/* Categories — 2-column parallel grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {MENU.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-brown/8 overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-cream2/50 border-b border-brown/8">
                <span className="text-2xl">{cat.emoji}</span>
                <h2 className="font-fraunces font-bold text-xl text-forest">{cat.category}</h2>
              </div>
              {/* Items grid */}
              <div className="p-4 grid grid-cols-1 gap-3">
                {cat.items.map(item => (
                  <MenuCard key={item.name} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-cream2 py-14 text-center px-6">
        <h3 className="font-fraunces font-bold text-3xl text-forest mb-4">Sedia untuk order?</h3>
        <p className="text-muted mb-8">Isi borang tempahan atau hubungi kami terus via WhatsApp.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/reservations"
            className="bg-forest text-cream px-8 py-3.5 rounded-lg font-semibold hover:bg-brown transition-colors">
            Buat Tempahan Sekarang →
          </Link>
          <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

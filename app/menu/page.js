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
    <div className="bg-cream rounded-2xl overflow-hidden border border-brown/8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image placeholder */}
      <div className="h-44 bg-cream2 flex items-center justify-center relative overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <span className="text-5xl opacity-25">📷</span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-fraunces font-semibold text-xl text-brown mb-1">{item.name}</h3>
        <p className="text-muted text-sm leading-relaxed mb-4 flex-1">{item.desc}</p>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-terra font-bold text-lg">RM {item.price.toFixed(2)}</span>
            <span className="text-muted text-xs ml-1">/ biji</span>
          </div>
          {item.min > 1 && (
            <span className="bg-forest/10 text-forest text-[0.65rem] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full">
              Min. {item.min} biji
            </span>
          )}
        </div>
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

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {MENU.map(cat => (
          <div key={cat.id} className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">{cat.emoji}</span>
              <h2 className="font-fraunces font-bold text-3xl text-forest">{cat.category}</h2>
              <div className="flex-1 h-px bg-brown/10 ml-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.items.map(item => (
                <MenuCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        ))}
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

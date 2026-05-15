import Link from 'next/link'

const FEATURED = [
  { name: 'Apam',          desc: 'Lembut, gebu, dan manis semula jadi.',             price: 'RM 1.50', emoji: '🫓', bg: 'bg-cream2' },
  { name: 'Kaswi Pandan',  desc: 'Harum pandan dengan lapisan santan yang creamy.',   price: 'RM 1.80', emoji: '🟢', bg: 'bg-leaf/20' },
  { name: 'Tepung Pelita', desc: 'Dua lapisan — pandan bawah, santan putih atas.',    price: 'RM 2.00', emoji: '🍮', bg: 'bg-parchment/60' },
  { name: 'Kaswi Coklat',  desc: 'Kelazatan coklat dengan tekstur kenyal sempurna.', price: 'RM 1.80', emoji: '🍫', bg: 'bg-brown2/10' },
]

const FEATURES = [
  { icon: '🌿', title: 'Bahan Semula Jadi',  desc: 'Tiada pewarna atau perisa tiruan' },
  { icon: '☀️', title: 'Segar Setiap Pagi',  desc: 'Dibuat pada hari yang sama' },
  { icon: '🎉', title: 'Untuk Majlis',        desc: 'Tempahan min. 50 biji per jenis' },
  { icon: '✅', title: 'Halal & Bersih',      desc: 'Dapur bersih dan bertauliah' },
]

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="min-h-screen bg-forest relative overflow-hidden flex items-center">
        <div className="absolute right-[-10vw] top-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[750px] max-h-[750px] rounded-full border border-gold/15 pointer-events-none" />
        <div className="absolute right-[-10vw] top-1/2 -translate-y-1/2 w-[55vw] h-[55vw] max-w-[580px] max-h-[580px] rounded-full border border-gold/10 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-20 grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-2 border border-gold/40 text-gold text-[0.68rem] tracking-[3px] uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              Kuih Tradisional · Segar Setiap Hari
            </div>

            <h1 className="font-fraunces font-black leading-[0.92] text-cream tracking-[-2px]"
              style={{ fontSize: 'clamp(3.5rem,8vw,7rem)' }}>
              Kuih
              <span className="block italic text-gold font-normal">Tradisional</span>
              <span className="block" style={{ WebkitTextStroke: '1.5px #F5E6C8', color: 'transparent' }}>
                Terbaik
              </span>
            </h1>

            <p className="mt-7 text-[0.95rem] text-cream/75 leading-[1.9] max-w-md">
              Dibuat dengan penuh kasih sayang menggunakan resipi turun-temurun.
              Apam, Kaswi, Tepung Pelita — segar setiap pagi, siap untuk majlis anda.
            </p>

            <div className="flex gap-10 mt-10">
              {[
                { num: '3',    label: 'Cawangan' },
                { num: '10+',  label: 'Jenis Kuih' },
                { num: '500+', label: 'Pelanggan / Bulan' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-fraunces font-black text-3xl text-gold leading-none">{s.num}</div>
                  <div className="text-[0.72rem] tracking-wide text-cream/50 uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 flex-wrap mt-12">
              <Link href="/menu"
                className="inline-flex items-center gap-2 bg-gold text-forest px-7 py-3.5 rounded-lg font-bold text-[0.85rem] tracking-wide uppercase hover:bg-gold2 hover:-translate-y-0.5 transition-all shadow-[0_12px_30px_rgba(201,168,76,0.3)]">
                Lihat Menu →
              </Link>
              <Link href="/reservations"
                className="inline-flex items-center gap-2 border border-cream/30 text-cream px-7 py-3.5 rounded-lg font-semibold text-[0.85rem] tracking-wide uppercase hover:border-cream/60 hover:bg-white/5 hover:-translate-y-0.5 transition-all">
                Buat Tempahan
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-cream/10 backdrop-blur-sm border border-cream/10 rounded-3xl p-8">
              <div className="text-gold/60 text-[0.7rem] tracking-[2px] uppercase mb-6">Popular Hari Ini</div>
              <div className="grid grid-cols-2 gap-4">
                {FEATURED.map(item => (
                  <div key={item.name} className={`${item.bg} rounded-2xl p-5 border border-brown/10`}>
                    <div className="text-3xl mb-3">{item.emoji}</div>
                    <div className="font-fraunces font-semibold text-brown text-lg">{item.name}</div>
                    <div className="text-muted text-xs leading-relaxed mt-1">{item.desc}</div>
                    <div className="text-terra font-semibold text-sm mt-3">{item.price} / biji</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[0.7rem] font-semibold tracking-[3px] uppercase text-terra mb-4">Cerita Kami</div>
            <h2 className="font-fraunces font-black text-4xl md:text-5xl text-forest leading-tight mb-6">
              Rasa Kampung,<br />
              <span className="italic font-normal text-brown2">Terus ke Hati</span>
            </h2>
            <p className="text-muted leading-relaxed mb-4">
              DKAMPUNG bermula dari dapur kecil di Taman Putra Perdana dengan satu matlamat —
              menghidupkan semula rasa kuih tradisional yang semakin dilupakan.
            </p>
            <p className="text-muted leading-relaxed mb-8">
              Kini kami beroperasi di 3 cawangan, melayani tempahan kenduri dan majlis dari
              50 hingga 200 biji dengan penghantaran segar setiap hari.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-forest text-cream px-6 py-3 rounded-lg font-semibold text-sm hover:bg-brown transition-colors">
              Hubungi Kami →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-cream rounded-2xl p-5 border border-brown/8">
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="font-semibold text-brown mb-1">{f.title}</div>
                <div className="text-muted text-sm">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MENU PREVIEW ── */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-[0.7rem] font-semibold tracking-[3px] uppercase text-terra mb-3">Pilihan Kami</div>
            <h2 className="font-fraunces font-black text-4xl text-forest">Menu Pilihan</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {FEATURED.map(item => (
              <div key={item.name} className="bg-white rounded-2xl p-6 border border-brown/8 hover:-translate-y-1 hover:shadow-lg transition-all text-center">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <div className="font-fraunces font-semibold text-xl text-brown mb-2">{item.name}</div>
                <div className="text-muted text-xs leading-relaxed mb-4">{item.desc}</div>
                <div className="text-terra font-bold">{item.price} / biji</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/menu"
              className="inline-block bg-forest text-cream px-8 py-3.5 rounded-lg font-semibold hover:bg-brown transition-colors">
              Lihat Semua Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-forest2">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-fraunces font-black text-4xl text-cream mb-4">
            Tempah Kuih Untuk Majlis Anda
          </h2>
          <p className="text-cream/70 mb-8 leading-relaxed">
            Isi borang tempahan atau hubungi kami terus melalui WhatsApp.
            Kami sedia melayan dari 50 hingga 200 biji.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/reservations"
              className="bg-gold text-forest px-8 py-3.5 rounded-lg font-bold tracking-wide hover:bg-gold2 transition-colors">
              Buat Tempahan Online
            </Link>
            <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20membuat%20tempahan%20kuih."
              target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-8 py-3.5 rounded-lg font-bold tracking-wide hover:opacity-90 transition-opacity">
              💬 WhatsApp Terus
            </a>
          </div>
        </div>
      </section>

      {/* ── WhatsApp FAB ── */}
      <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20kuih%20DKAMPUNG."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp">
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}

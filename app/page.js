import Link from 'next/link'

const FEATURED = [
  { name: 'Apam Putih',    price: 'RM 1.50', tag: 'Popular',   emoji: '🫓' },
  { name: 'Kaswi Pandan',  price: 'RM 1.80', tag: 'Bestseller',emoji: '🍃' },
  { name: 'Tepung Pelita', price: 'RM 2.00', tag: 'Klasik',    emoji: '🍮' },
  { name: 'Kaswi Coklat',  price: 'RM 1.80', tag: 'Kegemaran', emoji: '🍫' },
  { name: 'Apam Pandan',   price: 'RM 1.50', tag: '',          emoji: '🌿' },
  { name: 'Kaswi Jagung',  price: 'RM 1.80', tag: '',          emoji: '🌽' },
]

const FEATURES = [
  { icon: '🌿', title: 'Bahan Semula Jadi',  desc: 'Tiada pewarna atau perisa tiruan' },
  { icon: '☀️', title: 'Segar Setiap Pagi',  desc: 'Dibuat pada hari yang sama' },
  { icon: '🎉', title: 'Untuk Majlis',        desc: 'Min. 50 biji per tempahan' },
  { icon: '✅', title: 'Halal & Bersih',      desc: 'Dapur bersih bertauliah' },
]

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="min-h-screen bg-forest relative overflow-hidden flex items-center">
        {/* Decorative rings */}
        <div className="absolute right-[-10vw] top-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[750px] max-h-[750px] rounded-full border border-gold/10 pointer-events-none" />
        <div className="absolute right-[-10vw] top-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full border border-gold/8 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pt-[110px] pb-20 grid md:grid-cols-2 gap-12 items-center w-full">

          {/* Left copy */}
          <div>
            <div className="inline-flex items-center gap-2 border border-gold/40 text-gold text-[0.68rem] tracking-[3px] uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              Kuih Tradisional · Segar Setiap Hari
            </div>

            <h1 className="font-fraunces font-black leading-[0.9] text-cream tracking-[-2px] mb-6"
              style={{ fontSize: 'clamp(3rem,7vw,6rem)' }}>
              Kuih
              <span className="block italic text-gold font-normal">Tradisional</span>
              <span className="block" style={{ WebkitTextStroke: '1.5px #F5E6C8', color: 'transparent' }}>
                Terbaik
              </span>
            </h1>

            <p className="text-[0.95rem] text-cream/70 leading-[1.85] max-w-[420px] mb-10">
              Dibuat dengan penuh kasih sayang menggunakan resipi turun-temurun.
              Segar setiap pagi — siap untuk majlis anda.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-12 pb-10 border-b border-cream/10">
              {[
                { num: '3',    label: 'Cawangan' },
                { num: '10+',  label: 'Jenis Kuih' },
                { num: '500+', label: 'Pelanggan/Bulan' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-fraunces font-black text-3xl text-gold leading-none">{s.num}</div>
                  <div className="text-[0.7rem] tracking-wide text-cream/45 uppercase mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/menu"
                className="inline-flex items-center gap-2 bg-gold text-forest px-7 py-3.5 rounded-lg font-bold text-sm tracking-wide uppercase hover:bg-gold2 hover:-translate-y-0.5 transition-all shadow-[0_8px_24px_rgba(201,168,76,0.35)]">
                Lihat Menu →
              </Link>
              <Link href="/reservations"
                className="inline-flex items-center gap-2 border border-cream/25 text-cream/90 px-7 py-3.5 rounded-lg font-semibold text-sm tracking-wide uppercase hover:border-cream/50 hover:text-white transition-all">
                Buat Tempahan
              </Link>
            </div>
          </div>

          {/* Right: compact menu list card */}
          <div className="hidden md:block">
            <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-gold/70 text-[0.7rem] tracking-[2px] uppercase font-semibold">Menu Hari Ini</span>
                <Link href="/menu" className="text-cream/50 text-xs hover:text-cream transition-colors">
                  Lihat semua →
                </Link>
              </div>
              <div className="divide-y divide-white/8">
                {FEATURED.map(item => (
                  <div key={item.name} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <div>
                        <span className="text-cream text-sm font-medium">{item.name}</span>
                        {item.tag && (
                          <span className="ml-2 text-[0.6rem] font-semibold uppercase tracking-wide bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gold font-semibold text-sm">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3.5 bg-white/5 border-t border-white/10">
                <p className="text-cream/40 text-xs">Min. 50 biji · Segar setiap hari</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          ABOUT
      ══════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[0.7rem] font-semibold tracking-[3px] uppercase text-terra mb-4">Cerita Kami</div>
            <h2 className="font-fraunces font-black text-4xl md:text-5xl text-forest leading-tight mb-5">
              Rasa Kampung,<br />
              <span className="italic font-normal text-brown2">Terus ke Hati</span>
            </h2>
            <p className="text-muted leading-relaxed mb-4 text-sm">
              DKAMPUNG bermula dari dapur kecil di Taman Putra Perdana dengan satu matlamat —
              menghidupkan semula rasa kuih tradisional yang semakin dilupakan.
            </p>
            <p className="text-muted leading-relaxed mb-8 text-sm">
              Kini kami beroperasi di 3 cawangan, melayani tempahan kenduri dan majlis
              dari 50 hingga 200 biji dengan penghantaran segar setiap hari.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-forest text-cream px-6 py-3 rounded-lg font-semibold text-sm hover:bg-brown transition-colors">
              Hubungi Kami →
            </Link>
          </div>

          {/* Feature pills — compact */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-cream rounded-xl p-4 border border-brown/8">
                <span className="text-2xl mt-0.5 shrink-0">{f.icon}</span>
                <div>
                  <div className="font-semibold text-brown text-sm mb-0.5">{f.title}</div>
                  <div className="text-muted text-xs leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          MENU PREVIEW — simple list
      ══════════════════════════════ */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[0.7rem] font-semibold tracking-[3px] uppercase text-terra mb-2">Pilihan Kami</div>
            <h2 className="font-fraunces font-black text-3xl text-forest">Menu Popular</h2>
          </div>

          {/* Simple clean list */}
          <div className="bg-white rounded-2xl border border-brown/8 overflow-hidden mb-8">
            {FEATURED.map((item, i) => (
              <div key={item.name}
                className={`flex items-center justify-between px-6 py-4 ${i < FEATURED.length - 1 ? 'border-b border-brown/6' : ''} hover:bg-cream/60 transition-colors`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">{item.emoji}</span>
                  <div>
                    <span className="font-medium text-brown">{item.name}</span>
                    {item.tag && (
                      <span className="ml-2 text-[0.6rem] font-semibold uppercase tracking-wide bg-forest/10 text-forest px-2 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-terra font-bold text-sm">{item.price} / biji</span>
                  <span className="text-muted text-xs hidden sm:block">Min. 50 biji</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/menu"
              className="inline-flex items-center gap-2 bg-forest text-cream px-7 py-3 rounded-lg font-semibold text-sm hover:bg-brown transition-colors">
              Lihat Semua Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA BANNER
      ══════════════════════════════ */}
      <section className="py-16 bg-forest2">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-fraunces font-black text-3xl text-cream mb-3">
            Tempah Kuih Untuk Majlis Anda
          </h2>
          <p className="text-cream/65 mb-8 text-sm leading-relaxed">
            Isi borang tempahan atau hubungi kami terus melalui WhatsApp.
            Sedia melayan dari 50 hingga 200 biji.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/reservations"
              className="bg-gold text-forest px-7 py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-gold2 transition-colors">
              Buat Tempahan Online
            </Link>
            <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20membuat%20tempahan%20kuih."
              target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-7 py-3 rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-opacity">
              💬 WhatsApp Terus
            </a>
          </div>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20kuih%20DKAMPUNG."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp">
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}

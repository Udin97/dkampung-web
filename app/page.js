import Link from 'next/link'

const FEATURED = [
  { name: 'Apam Putih',    price: 'RM 1.50', tag: 'Popular',    emoji: '🫓' },
  { name: 'Kaswi Pandan',  price: 'RM 1.80', tag: 'Bestseller', emoji: '🍃' },
  { name: 'Tepung Pelita', price: 'RM 2.00', tag: 'Klasik',     emoji: '🍮' },
  { name: 'Kaswi Coklat',  price: 'RM 1.80', tag: 'Kegemaran',  emoji: '🍫' },
  { name: 'Apam Pandan',   price: 'RM 1.50', tag: '',           emoji: '🌿' },
  { name: 'Kaswi Jagung',  price: 'RM 1.80', tag: '',           emoji: '🌽' },
]

const FEATURES = [
  { icon: '🌿', title: 'Bahan Semula Jadi',  desc: 'Tiada pewarna atau perisa tiruan. Semua dari alam.' },
  { icon: '☀️', title: 'Segar Setiap Pagi',  desc: 'Dibuat pada hari yang sama, dinikmati hari yang sama.' },
  { icon: '🎉', title: 'Untuk Majlis',        desc: 'Minimum 50 biji, sempurna untuk kenduri dan majlis.' },
  { icon: '✅', title: 'Halal & Bersih',      desc: 'Dapur bertauliah, proses higienik sepenuhnya.' },
]

const TICKER = ['Segar Setiap Pagi', 'Halal & Bersih', 'Min. 50 Biji', 'Tempahan Kenduri', 'Resipi Turun-Temurun', 'Tiga Cawangan']

export default function HomePage() {
  return (
    <>
      {/* ══════════ HERO ══════════════════════════════════════════ */}
      <section className="min-h-screen bg-charcoal relative overflow-hidden flex items-center">

        {/* Subtle dot-grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(201,168,76,0.10) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(27,67,50,0.55) 0%, transparent 65%)' }} />

        <div className="relative w-full max-w-6xl mx-auto px-6 pt-[100px] pb-28
          grid md:grid-cols-[1fr_400px] gap-10 lg:gap-20 items-center">

          {/* ─ Left copy ─ */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 border border-gold/20 text-gold/65
              text-[0.63rem] tracking-[3px] uppercase px-4 py-1.5 rounded-full mb-10">
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse" />
              Kuih Tradisional · Segar Setiap Hari
            </div>

            {/* Headline — 3 typographic lines */}
            <h1 className="font-fraunces leading-[0.85] mb-10 select-none"
              style={{ fontSize: 'clamp(4.5rem,8.5vw,8rem)' }}>
              <span className="block text-cream font-black tracking-[-2px]">Kuih</span>
              <span className="block text-gold font-normal italic tracking-[-1px]">Tradisional</span>
              <span className="block font-black tracking-[-2px]"
                style={{ WebkitTextStroke: '1.5px rgba(245,230,200,0.18)', color: 'transparent' }}>
                Terbaik
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-cream/40 text-[0.93rem] leading-[1.9] max-w-[390px] mb-12">
              Dibuat dengan penuh kasih sayang menggunakan resipi turun-temurun.
              Segar setiap pagi — siap untuk majlis anda.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-0 mb-14 pb-12 border-b border-white/6">
              {[{ num: '3', label: 'Cawangan' }, { num: '10+', label: 'Jenis Kuih' }, { num: '500+', label: 'Pelanggan/Bln' }].map((s, i) => (
                <div key={s.label} className={`pr-10 ${i > 0 ? 'pl-10 border-l border-white/10' : ''}`}>
                  <div className="font-fraunces font-black text-4xl text-gold leading-none">{s.num}</div>
                  <div className="text-[0.6rem] tracking-[2.5px] text-cream/28 uppercase mt-2">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/menu"
                className="inline-flex items-center gap-2 bg-gold text-charcoal px-7 py-3.5 rounded-full
                  font-bold text-[0.82rem] tracking-wide hover:bg-gold2 transition-colors
                  shadow-[0_8px_32px_rgba(201,168,76,0.28)]">
                Lihat Menu →
              </Link>
              <Link href="/reservations"
                className="inline-flex items-center gap-2 border border-white/14 text-cream/70 px-7 py-3.5
                  rounded-full font-semibold text-[0.82rem] tracking-wide
                  hover:border-white/30 hover:text-cream transition-all">
                Buat Tempahan
              </Link>
            </div>
          </div>

          {/* ─ Right: floating menu card ─ */}
          <div className="hidden md:block">
            <div className="bg-white/[0.045] backdrop-blur-sm border border-white/7 rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/7 flex items-center justify-between">
                <span className="text-gold/55 text-[0.62rem] tracking-[2.5px] uppercase font-semibold">Menu Hari Ini</span>
                <Link href="/menu" className="text-cream/28 text-[0.72rem] hover:text-cream/60 transition-colors">
                  Lihat semua →
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {FEATURED.map(item => (
                  <div key={item.name}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-center gap-3.5">
                      <span className="text-lg opacity-75">{item.emoji}</span>
                      <div>
                        <span className="text-cream/80 text-sm font-medium group-hover:text-cream transition-colors">
                          {item.name}
                        </span>
                        {item.tag && (
                          <span className="ml-2 text-[0.57rem] font-semibold uppercase tracking-wide
                            bg-gold/14 text-gold/75 px-1.5 py-0.5 rounded-full">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gold/65 font-semibold text-sm group-hover:text-gold transition-colors">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5">
                <p className="text-cream/22 text-[0.67rem]">Min. 50 biji · Segar setiap hari</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE TICKER ════════════════════════════════ */}
      <div className="bg-gold overflow-hidden py-3.5 select-none">
        <div className="marquee-track">
          {[...Array(2)].map((_, j) => (
            <span key={j} className="flex items-center">
              {TICKER.map(t => (
                <span key={t} className="flex items-center gap-5 text-forest font-semibold
                  text-[0.72rem] tracking-[3px] uppercase px-5">
                  {t}
                  <span className="text-forest/35 text-[0.55rem]">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ FEATURES ══════════════════════════════════════ */}
      <section className="py-24 bg-stone">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-3">Kelebihan Kami</div>
            <h2 className="font-fraunces font-black text-4xl text-charcoal">Kenapa DKAMPUNG?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title}
                className="group bg-white rounded-2xl p-6 border border-brown/6
                  hover:border-forest/18 hover:shadow-[0_8px_32px_rgba(27,67,50,0.07)]
                  transition-all duration-300 cursor-default">
                <div className="text-3xl mb-4">{f.icon}</div>
                <div className="font-semibold text-charcoal text-[0.88rem] mb-1.5 group-hover:text-forest transition-colors">
                  {f.title}
                </div>
                <div className="text-muted text-xs leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ═════════════════════════════════════════ */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-terra mb-5">Cerita Kami</div>
            <h2 className="font-fraunces font-black leading-[0.92] mb-6"
              style={{ fontSize: 'clamp(2.6rem,4.5vw,3.8rem)' }}>
              Rasa Kampung,
              <br />
              <span className="italic font-normal text-forest2">Terus ke Hati</span>
            </h2>
            <p className="text-muted leading-[1.9] mb-4 text-[0.92rem]">
              DKAMPUNG bermula dari dapur kecil di Taman Putra Perdana dengan satu matlamat —
              menghidupkan semula rasa kuih tradisional yang semakin dilupakan.
            </p>
            <p className="text-muted leading-[1.9] mb-10 text-[0.92rem]">
              Kini kami beroperasi di 3 cawangan, melayani tempahan kenduri dan majlis
              dari 50 hingga 200 biji dengan penghantaran segar setiap hari.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-charcoal text-cream px-6 py-3
                rounded-full font-semibold text-sm hover:bg-forest transition-colors">
              Hubungi Kami →
            </Link>
          </div>

          {/* Right — feature grid */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-brown/6">
                <span className="text-2xl mt-0.5 shrink-0">{f.icon}</span>
                <div>
                  <div className="font-semibold text-charcoal text-sm mb-0.5">{f.title}</div>
                  <div className="text-muted text-xs leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ MENU PREVIEW ══════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-3">Pilihan Kami</div>
              <h2 className="font-fraunces font-black text-4xl text-charcoal">Menu Popular</h2>
            </div>
            <Link href="/menu"
              className="hidden md:inline-flex items-center gap-1.5 text-forest text-sm font-semibold
                hover:text-terra transition-colors">
              Lihat semua <span>→</span>
            </Link>
          </div>

          <div className="rounded-3xl border border-brown/8 overflow-hidden">
            {FEATURED.map((item, i) => (
              <div key={item.name}
                className={`flex items-center justify-between px-6 py-4 hover:bg-stone/80
                  transition-colors group ${i < FEATURED.length - 1 ? 'border-b border-brown/6' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="text-xl w-8 text-center leading-none">{item.emoji}</span>
                  <div>
                    <span className="font-medium text-charcoal group-hover:text-forest transition-colors">
                      {item.name}
                    </span>
                    {item.tag && (
                      <span className="ml-2.5 text-[0.57rem] font-semibold uppercase tracking-wide
                        bg-forest/8 text-forest px-2 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-terra font-bold text-sm">
                    {item.price} <span className="text-muted font-normal text-xs">/ biji</span>
                  </span>
                  <span className="text-muted/50 text-xs hidden sm:block">Min. 50</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/menu" className="inline-flex items-center gap-1.5 text-forest font-semibold text-sm">
              Lihat Semua Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ════════════════════════════════════ */}
      <section className="py-28 bg-forest relative overflow-hidden">
        {/* Dot pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold/50 mb-5">
            Tempahan Terbuka
          </div>
          <h2 className="font-fraunces font-black text-cream leading-[0.9] mb-5"
            style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)' }}>
            Tempah Kuih Untuk<br />Majlis Anda
          </h2>
          <p className="text-cream/45 mb-10 text-[0.9rem] leading-relaxed max-w-md mx-auto">
            Isi borang tempahan atau hubungi kami terus melalui WhatsApp.
            Sedia melayan dari 50 hingga 200 biji.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/reservations"
              className="bg-gold text-charcoal px-8 py-3.5 rounded-full font-bold text-sm tracking-wide
                hover:bg-gold2 transition-colors shadow-[0_8px_30px_rgba(201,168,76,0.22)]">
              Buat Tempahan Online
            </Link>
            <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20membuat%20tempahan%20kuih."
              target="_blank" rel="noopener noreferrer"
              className="bg-white/8 text-cream border border-white/14 px-8 py-3.5 rounded-full
                font-semibold text-sm hover:bg-white/16 transition-colors">
              WhatsApp Terus
            </a>
          </div>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20kuih%20DKAMPUNG."
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-13 h-13 bg-[#25D366] rounded-full flex items-center justify-center
          shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)]
          transition-all duration-200"
        style={{ width: 52, height: 52 }}
        aria-label="WhatsApp">
        <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  )
}

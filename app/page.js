import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { Leaf, Sun, Users, ShieldCheck } from 'lucide-react'
import ScrollReveal from '@/components/ScrollReveal'

export const revalidate = 0

const FALLBACK_FEATURED = [
  { name: 'Apam Putih',    price: 'RM 1.50', tag: 'Popular',    emoji: '🫓', image: null },
  { name: 'Kaswi Pandan',  price: 'RM 1.80', tag: 'Bestseller', emoji: '🍃', image: null },
  { name: 'Tepung Pelita', price: 'RM 2.00', tag: 'Klasik',     emoji: '🍮', image: null },
  { name: 'Kaswi Coklat',  price: 'RM 1.80', tag: 'Kegemaran',  emoji: '🍫', image: null },
  { name: 'Apam Pandan',   price: 'RM 1.50', tag: '',           emoji: '🌿', image: null },
  { name: 'Kaswi Jagung',  price: 'RM 1.80', tag: '',           emoji: '🌽', image: null },
]

const TAG_BY_NAME = {
  'Apam Putih':    'Popular',
  'Kaswi Pandan':  'Bestseller',
  'Tepung Pelita': 'Klasik',
  'Kaswi Coklat':  'Kegemaran',
}

async function getFeatured() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase
      .from('menu_items').select('*').eq('is_available', true)
      .order('sort_order').limit(6)

    if (error || !data?.length) return FALLBACK_FEATURED

    return data.filter(d => d.name).map(item => ({
      name:  item.name,
      price: `RM ${parseFloat(item.price).toFixed(2)}`,
      tag:   TAG_BY_NAME[item.name] || '',
      emoji: item.category_emoji || '🍰',
      image: item.image_url || null,
    }))
  } catch {
    return FALLBACK_FEATURED
  }
}

const FEATURES = [
  {
    icon: <Leaf className="w-7 h-7 text-forest" strokeWidth={1.8} />,
    title: 'Bahan Semula Jadi',
    desc: 'Tiada pewarna atau perisa tiruan. Semua dari alam.',
  },
  {
    icon: <Sun className="w-7 h-7 text-gold" strokeWidth={1.8} />,
    title: 'Segar Setiap Pagi',
    desc: 'Dibuat pada hari yang sama, dinikmati hari yang sama.',
  },
  {
    icon: <Users className="w-7 h-7 text-terra" strokeWidth={1.8} />,
    title: 'Untuk Majlis',
    desc: 'Minimum 50 pax, sempurna untuk kenduri dan majlis.',
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-forest" strokeWidth={1.8} />,
    title: 'Halal & Bersih',
    desc: 'Dapur bertauliah, proses higienik sepenuhnya.',
  },
]

const TICKER = ['Segar Setiap Pagi', 'Halal & Bersih', 'Min. 50 Biji', 'Tempahan Kenduri', 'Resipi Turun-Temurun', 'Tiga Cawangan']

export default async function HomePage() {
  const FEATURED = await getFeatured()
  return (
    <>
      {/* ══════════ HERO ══════════════════════════════════════════ */}
      <section className="min-h-screen relative overflow-hidden flex items-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1696385793103-71f51f6fd3b7?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>

        {/* Dark overlay — base layer */}
        <div className="absolute inset-0 bg-charcoal/85" />

        {/* Left-side gradient so copy area is darkest, satay peeks through on the right */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, rgba(12,23,16,0.55) 0%, rgba(12,23,16,0) 100%)',
        }} />

        {/* Subtle dot-grid texture */}
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
            <div className="inline-flex items-center gap-2.5 border border-gold/45 bg-charcoal/40 backdrop-blur-sm text-gold
              text-[0.63rem] tracking-[3px] uppercase px-4 py-1.5 rounded-full mb-10">
              <span className="w-1 h-1 bg-gold rounded-full animate-pulse" />
              Kuih Tradisional · Segar Setiap Hari
            </div>

            {/* Headline — 3 typographic lines */}
            <h1 className="font-fraunces leading-[0.85] mb-10 select-none"
              style={{ fontSize: 'clamp(4.5rem,8.5vw,8rem)', textShadow: '0 4px 24px rgba(0,0,0,0.55)' }}>
              <span className="block text-cream font-black tracking-[-2px]">Kuih</span>
              <span className="block text-gold2 font-normal italic tracking-[-1px]">Tradisional</span>
              <span className="block font-black tracking-[-2px]"
                style={{ WebkitTextStroke: '2.5px rgba(254,249,240,0.95)', color: 'transparent' }}>
                Terbaik
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-cream/95 text-[0.93rem] leading-[1.9] max-w-[390px] mb-12"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.55)' }}>
              Dibuat dengan penuh kasih sayang menggunakan resipi turun-temurun.
              Segar setiap pagi — siap untuk majlis anda.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-0 mb-14 pb-12 border-b border-white/6">
              {[{ num: '3', label: 'Cawangan' }, { num: '10+', label: 'Jenis Kuih' }, { num: '500+', label: 'Pelanggan/Bln' }].map((s, i) => (
                <div key={s.label} className={`pr-10 ${i > 0 ? 'pl-10 border-l border-white/10' : ''}`}>
                  <div className="font-fraunces font-black text-4xl text-gold leading-none">{s.num}</div>
                  <div className="text-[0.65rem] tracking-[2.5px] text-cream/85 uppercase mt-2 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/menu"
                className="inline-flex items-center gap-2 bg-gold text-charcoal px-7 py-3.5 rounded-full
                  font-bold text-[0.82rem] tracking-wide hover:bg-gold2 transition-all duration-150
                  active:scale-[0.96] shadow-[0_8px_32px_rgba(201,168,76,0.28)]">
                Lihat Menu →
              </Link>
              <Link href="/reservations"
                className="inline-flex items-center gap-2 border border-cream/35 bg-charcoal/30 backdrop-blur-sm text-cream px-7 py-3.5
                  rounded-full font-semibold text-[0.82rem] tracking-wide
                  hover:border-cream/55 hover:bg-charcoal/50 transition-all duration-150 active:scale-[0.96]">
                Buat Tempahan
              </Link>
            </div>
          </div>

          {/* ─ Right: floating menu card ─ */}
          <div className="hidden md:block">
            <div className="bg-charcoal/75 backdrop-blur-md border border-white/15 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-gold text-[0.62rem] tracking-[2.5px] uppercase font-semibold">Menu Hari Ini</span>
                <Link href="/menu" className="text-cream/80 text-[0.72rem] hover:text-cream transition-colors">
                  Lihat semua →
                </Link>
              </div>
              <div className="divide-y divide-white/[0.08]">
                {FEATURED.map(item => (
                  <div key={item.name}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.06] transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 shrink-0 rounded-lg bg-white/[0.06] border border-white/[0.05]
                        flex items-center justify-center text-lg opacity-80 group-hover:opacity-100 transition-opacity
                        overflow-hidden relative">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        ) : item.emoji}
                      </span>
                      <div>
                        <span className="text-cream text-sm font-medium group-hover:text-cream transition-colors">
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
                    <span className="text-gold/90 font-semibold text-sm group-hover:text-gold transition-colors">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-charcoal/40 border-t border-white/10">
                <p className="text-cream/75 text-[0.67rem]">Min. 50 pax · Segar setiap hari</p>
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
          <ScrollReveal className="text-center mb-14">
            <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-3">Kelebihan Kami</div>
            <h2 className="font-fraunces font-black text-4xl text-charcoal">Kenapa DKAMPUNG?</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div className="group bg-white rounded-2xl p-6 border border-brown/6 h-full
                  hover:border-forest/18 hover:shadow-[0_8px_32px_rgba(27,67,50,0.07)]
                  transition-all duration-200 active:scale-[0.97] cursor-default">
                  <div className="mb-4">{f.icon}</div>
                  <div className="font-semibold text-charcoal text-[0.88rem] mb-1.5 group-hover:text-forest transition-colors">
                    {f.title}
                  </div>
                  <div className="text-muted text-xs leading-relaxed">{f.desc}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ═════════════════════════════════════════ */}
      <section className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <ScrollReveal>
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
              dari 50 hingga 200 pax dengan penghantaran segar setiap hari.
            </p>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-charcoal text-cream px-6 py-3
                rounded-full font-semibold text-sm hover:bg-forest transition-all duration-150 active:scale-[0.96]">
              Hubungi Kami →
            </Link>
          </div>
          </ScrollReveal>

          {/* Right — photo */}
          <ScrollReveal delay={150}>
          <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.15)]"
            style={{ minHeight: '460px' }}>
            <Image
              src="https://images.unsplash.com/photo-1569058242252-623df46b5025?w=800&q=80"
              alt="Penyediaan kuih tradisional DKAMPUNG"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="text-cream font-fraunces font-semibold text-xl leading-tight drop-shadow-md">
                Dibuat dengan kasih sayang, setiap hari
              </div>
              <div className="text-cream/85 text-sm mt-2 drop-shadow">Resipi turun-temurun, bahan semula jadi</div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ MENU PREVIEW ══════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal className="flex items-end justify-between mb-12">
            <div>
              <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold mb-3">Pilihan Kami</div>
              <h2 className="font-fraunces font-black text-4xl text-charcoal">Menu Popular</h2>
            </div>
            <Link href="/menu"
              className="hidden md:inline-flex items-center gap-1.5 text-forest text-sm font-semibold
                hover:text-terra transition-colors">
              Lihat semua <span>→</span>
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={120}>
          <div className="rounded-3xl border border-brown/8 overflow-hidden">
            {FEATURED.map((item, i) => (
              <div key={item.name}
                className={`flex items-center justify-between px-6 py-4 hover:bg-stone/80
                  transition-colors group ${i < FEATURED.length - 1 ? 'border-b border-brown/6' : ''}`}>
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-cream to-stone
                    border border-brown/8 flex items-center justify-center text-2xl select-none
                    overflow-hidden relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    ) : item.emoji}
                  </span>
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
                    {item.price} <span className="text-muted font-normal text-xs">/ pax</span>
                  </span>
                  <span className="text-muted/50 text-xs hidden sm:block">Min. 50</span>
                </div>
              </div>
            ))}
          </div>

          </ScrollReveal>

          <div className="text-center mt-8 md:hidden">
            <Link href="/menu" className="inline-flex items-center gap-1.5 text-forest font-semibold text-sm">
              Lihat Semua Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1677921755291-c39158477b8e?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        {/* Forest overlay */}
        <div className="absolute inset-0 bg-forest/90" />
        {/* Dot pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        <ScrollReveal className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="text-[0.62rem] font-semibold tracking-[4px] uppercase text-gold/50 mb-5">
            Tempahan Terbuka
          </div>
          <h2 className="font-fraunces font-black text-cream leading-[0.9] mb-5"
            style={{ fontSize: 'clamp(2.2rem,4vw,3.2rem)' }}>
            Tempah Kuih Untuk<br />Majlis Anda
          </h2>
          <p className="text-cream/45 mb-10 text-[0.9rem] leading-relaxed max-w-md mx-auto">
            Isi borang tempahan atau hubungi kami terus melalui WhatsApp.
            Sedia melayan dari 50 hingga 200 pax.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/reservations"
              className="bg-gold text-charcoal px-8 py-3.5 rounded-full font-bold text-sm tracking-wide
                hover:bg-gold2 transition-all duration-150 active:scale-[0.96] shadow-[0_8px_30px_rgba(201,168,76,0.22)]">
              Buat Tempahan Online
            </Link>
            <a href="https://wa.me/60143860742?text=Assalamualaikum%2C%20saya%20ingin%20membuat%20tempahan%20kuih."
              target="_blank" rel="noopener noreferrer"
              className="bg-white/8 text-cream border border-white/14 px-8 py-3.5 rounded-full
                font-semibold text-sm hover:bg-white/16 transition-all duration-150 active:scale-[0.96]">
              WhatsApp Terus
            </a>
          </div>
        </ScrollReveal>
      </section>

    </>
  )
}

import Link from 'next/link'

const LINKS = [
  { href: '/menu',         label: 'Menu Kuih' },
  { href: '/reservations', label: 'Buat Tempahan' },
  { href: '/contact',      label: 'Hubungi Kami' },
  { href: '/admin',        label: 'Admin' },
]

const BRANCHES = [
  'Dapur Kampung Putra Perdana',
  'Dapur Kampung Cyberjaya',
  'Nasi Lemak Che Dil Cyberjaya',
]

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,1fr] gap-12 pb-14 border-b border-white/8">

          {/* Brand */}
          <div>
            <div className="font-fraunces font-black text-2xl tracking-[3px] uppercase mb-4">
              DK<span className="text-gold">AMPUNG</span>
            </div>
            <p className="text-cream/40 text-sm leading-relaxed max-w-[260px] mb-7">
              Kuih tradisional buatan tangan, segar setiap pagi untuk momen istimewa anda.
            </p>
            <div className="flex flex-col gap-2.5">
              <a href="tel:+60143860742" className="text-sm text-cream/45 hover:text-gold transition-colors w-fit">
                +60 14-386 0742
              </a>
              <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
                className="text-sm text-cream/45 hover:text-gold transition-colors w-fit">
                WhatsApp Said Hashim
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="text-[0.62rem] font-semibold tracking-[3px] uppercase text-gold/60 mb-5">Navigasi</div>
            <nav className="flex flex-col gap-3">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="text-sm text-cream/40 hover:text-cream transition-colors w-fit">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Branches */}
          <div>
            <div className="text-[0.62rem] font-semibold tracking-[3px] uppercase text-gold/60 mb-5">Cawangan</div>
            <div className="flex flex-col gap-3">
              {BRANCHES.map(b => (
                <span key={b} className="text-sm text-cream/40">{b}</span>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className="text-[0.62rem] font-semibold tracking-[3px] uppercase text-gold/60 mb-5">Operasi</div>
            <div className="text-sm text-cream/40 leading-relaxed">
              <p>Isnin – Ahad</p>
              <p className="text-cream/70 font-semibold mt-1">8:00 pagi – Petang</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[0.7rem] text-cream/25 tracking-wide">
            © 2025 DKAMPUNG · Said Hashim · Semua hak terpelihara
          </p>
          <div className="flex items-center gap-2">
            {['Halal ✓', 'Segar Harian', 'Buatan Tangan'].map(b => (
              <span key={b} className="text-[0.6rem] font-semibold tracking-wide uppercase border border-white/10 text-cream/25 px-3 py-1 rounded-full">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

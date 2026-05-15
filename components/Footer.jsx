import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-forest text-cream">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="font-fraunces font-black text-2xl tracking-widest mb-3">
            DK<span className="text-terra">AMPUNG</span>
          </div>
          <p className="text-cream/60 text-sm leading-relaxed mb-5">
            Kuih tradisional buatan tangan, segar setiap hari untuk momen istimewa anda.
          </p>
          <div className="flex flex-col gap-2">
            <a href="tel:+60143860742" className="text-sm text-cream/70 hover:text-gold transition-colors">
              📞 +60 14-386 0742
            </a>
            <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
              className="text-sm text-cream/70 hover:text-gold transition-colors">
              💬 WhatsApp Said Hashim
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="text-[0.7rem] font-semibold tracking-[2px] uppercase text-gold mb-4">Navigasi</div>
          <nav className="flex flex-col gap-2.5">
            {[
              { href: '/menu',         label: 'Menu Kuih' },
              { href: '/reservations', label: 'Buat Tempahan' },
              { href: '/contact',      label: 'Hubungi Kami' },
              { href: '/admin',        label: 'Admin' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-sm text-cream/60 hover:text-cream transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Branches */}
        <div>
          <div className="text-[0.7rem] font-semibold tracking-[2px] uppercase text-gold mb-4">Cawangan</div>
          <div className="flex flex-col gap-2.5 text-sm text-cream/60">
            <span>Dapur Kampung Putra Perdana</span>
            <span>Dapur Kampung Cyberjaya</span>
            <span>Nasi Lemak Che Dil Cyberjaya</span>
          </div>
        </div>

        {/* Hours */}
        <div>
          <div className="text-[0.7rem] font-semibold tracking-[2px] uppercase text-gold mb-4">Waktu Operasi</div>
          <div className="text-sm text-cream/60 leading-relaxed">
            <p>Isnin – Ahad</p>
            <p className="text-cream font-semibold text-base mt-1">8:00 pagi – Petang</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10 py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-cream/40">
            © 2025 DKAMPUNG. Semua hak terpelihara · Said Hashim
          </p>
          <div className="flex gap-3">
            {['Halal ✓', 'Segar Harian', 'Buatan Tangan'].map(badge => (
              <span key={badge}
                className="text-[0.65rem] font-semibold tracking-wide uppercase bg-cream/10 text-cream/60 px-3 py-1 rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/menu',         label: 'Menu' },
  { href: '/reservations', label: 'Tempahan' },
  { href: '/contact',      label: 'Hubungi Kami' },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Colors flip depending on whether we're over the dark hero or a light section
  const logoText  = scrolled ? 'text-forest' : 'text-cream'
  const logoBox   = scrolled ? 'bg-forest text-gold' : 'bg-white/20 text-gold border border-white/20'
  const linkColor = scrolled ? 'text-brown2 hover:text-forest' : 'text-cream/85 hover:text-white'
  const ctaStyle  = scrolled
    ? 'bg-forest text-cream hover:bg-brown'
    : 'bg-gold text-forest hover:bg-gold2'
  const barColor  = scrolled ? 'bg-forest' : 'bg-cream'

  return (
    <>
      {/* Top gradient so nav text is readable over hero image edge */}
      {!scrolled && (
        <div className="fixed top-0 left-0 w-full h-28 bg-gradient-to-b from-black/30 to-transparent z-40 pointer-events-none" />
      )}

      <nav className={`
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-[5%] h-[70px]
        transition-all duration-300
        ${scrolled ? 'bg-cream/96 backdrop-blur-md shadow-sm border-b border-brown/8' : 'bg-transparent'}
      `}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-fraunces font-black text-xs tracking-tight transition-all duration-300 ${logoBox}`}>
            DK
          </div>
          <span className={`font-fraunces font-black text-xl tracking-widest transition-colors duration-300 ${logoText}`}>
            DK<span className={scrolled ? 'text-terra' : 'text-gold'}>AMPUNG</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 relative z-10">
          <ul className="flex gap-7 list-none m-0 p-0">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-[0.8rem] font-semibold tracking-[1.2px] uppercase transition-colors relative group ${linkColor}`}
                >
                  {link.label}
                  <span className="absolute -bottom-[3px] left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/reservations"
            className={`px-5 py-2.5 rounded-full text-[0.78rem] font-semibold tracking-wide transition-all duration-300 ${ctaStyle}`}
          >
            Buat Tempahan
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer bg-transparent border-none relative z-10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-6 h-[2px] rounded transition-all duration-300 origin-center ${barColor} ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-[2px] rounded transition-all duration-300 ${barColor} ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-6 h-[2px] rounded transition-all duration-300 origin-center ${barColor} ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-forest flex flex-col items-center justify-center gap-8">
          <Link href="/" onClick={() => setMenuOpen(false)}
            className="font-fraunces font-black text-2xl text-gold tracking-widest mb-4">
            DKAMPUNG
          </Link>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-fraunces text-3xl font-semibold text-cream hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://wa.me/60143860742"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 bg-[#25D366] text-white px-9 py-3.5 rounded-full text-base font-semibold"
          >
            💬 WhatsApp Kami
          </a>
        </div>
      )}
    </>
  )
}

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
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-[5%] h-[70px]
        transition-all duration-300
        ${scrolled ? 'bg-cream/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}
      `}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-forest rounded-lg flex items-center justify-center font-fraunces font-black text-gold text-xs tracking-tight">
            DK
          </div>
          <span className="font-fraunces font-black text-xl text-forest tracking-widest">
            DK<span className="text-terra">AMPUNG</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-7 list-none m-0 p-0">
            {NAV_LINKS.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.8rem] font-semibold tracking-[1.2px] uppercase text-brown2 hover:text-forest transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-[3px] left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/reservations"
            className="bg-forest text-cream px-5 py-2.5 rounded-full text-[0.78rem] font-semibold tracking-wide hover:bg-brown transition-colors"
          >
            Buat Tempahan
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer bg-transparent border-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-6 h-[2px] bg-forest rounded transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-6 h-[2px] bg-forest rounded transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-6 h-[2px] bg-forest rounded transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-cream flex flex-col items-center justify-center gap-10">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-fraunces text-4xl font-semibold text-forest hover:text-terra transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://wa.me/60143860742"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 bg-[#25D366] text-white px-9 py-3.5 rounded-full text-base font-semibold"
          >
            💬 WhatsApp Kami
          </a>
        </div>
      )}
    </>
  )
}

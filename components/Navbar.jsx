'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/menu',         label: 'Menu' },
  { href: '/reservations', label: 'Tempahan' },
  { href: '/contact',      label: 'Hubungi Kami' },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const pathname = usePathname() || ''

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (pathname.startsWith('/admin')) return null

  const isHome  = pathname === '/'
  const isLight = isHome && !scrolled

  return (
    <>
      <nav className={`
        fixed top-0 left-0 w-full z-50
        flex items-center justify-between
        px-6 md:px-[5%] h-[68px]
        transition-all duration-400
        ${isLight
          ? 'bg-transparent'
          : 'bg-stone/95 backdrop-blur-xl border-b border-brown/8 shadow-[0_1px_20px_rgba(0,0,0,0.04)]'
        }
      `}>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10 group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-fraunces font-black text-[0.7rem] tracking-tight transition-all duration-300
            ${isLight ? 'bg-white/12 text-gold border border-white/15' : 'bg-charcoal text-gold'}`}>
            DK
          </div>
          <span className={`font-fraunces font-black text-lg tracking-[3px] uppercase transition-colors duration-300
            ${isLight ? 'text-cream' : 'text-charcoal'}`}>
            DK<span className={`${isLight ? 'text-gold/80' : 'text-gold'}`}>AMPUNG</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 relative z-10">
          <ul className="flex gap-6 list-none m-0 p-0">
            {NAV_LINKS.map(link => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link href={link.href}
                    className={`text-[0.72rem] font-semibold tracking-[1.8px] uppercase transition-colors relative
                      ${isLight
                        ? active ? 'text-gold' : 'text-cream/65 hover:text-cream'
                        : active ? 'text-forest' : 'text-ink/50 hover:text-ink'
                      }`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-[3px] left-0 h-[1.5px] rounded-full transition-all duration-300 bg-gold
                      ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                </li>
              )
            })}
          </ul>
          <Link href="/reservations"
            className={`px-5 py-2 rounded-full text-[0.73rem] font-semibold tracking-wide transition-all duration-300
              ${isLight
                ? 'bg-gold text-charcoal hover:bg-gold2'
                : 'bg-charcoal text-cream hover:bg-forest'
              }`}>
            Buat Tempahan
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-8 h-8 cursor-pointer bg-transparent border-none relative z-10"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className={`block h-[1.5px] rounded-full transition-all duration-300 origin-center
            ${isLight ? 'bg-cream' : 'bg-charcoal'}
            ${menuOpen ? 'w-6 rotate-45 translate-y-[6.5px]' : 'w-6'}`} />
          <span className={`block h-[1.5px] rounded-full transition-all duration-300
            ${isLight ? 'bg-cream' : 'bg-charcoal'}
            ${menuOpen ? 'opacity-0 w-0' : 'w-4'}`} />
          <span className={`block h-[1.5px] rounded-full transition-all duration-300 origin-center
            ${isLight ? 'bg-cream' : 'bg-charcoal'}
            ${menuOpen ? 'w-6 -rotate-45 -translate-y-[6.5px]' : 'w-6'}`} />
        </button>
      </nav>

      {/* Mobile menu — full-screen overlay */}
      <div className={`fixed inset-0 z-40 bg-charcoal transition-all duration-500 flex flex-col items-center justify-center gap-2
        ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />

        <Link href="/" onClick={() => setMenuOpen(false)}
          className="relative font-fraunces font-black text-xl text-gold tracking-[4px] uppercase mb-10">
          DKAMPUNG
        </Link>

        {NAV_LINKS.map((link, i) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
            className={`relative font-fraunces text-4xl font-semibold transition-colors py-2
              ${pathname === link.href ? 'text-gold' : 'text-cream/60 hover:text-cream'}`}
            style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}>
            {link.label}
          </Link>
        ))}

        <a href="https://wa.me/60143860742" target="_blank" rel="noopener noreferrer"
          className="relative mt-10 bg-gold text-charcoal px-9 py-3.5 rounded-full text-sm font-bold tracking-wide">
          Buat Tempahan →
        </a>
      </div>
    </>
  )
}

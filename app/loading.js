export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-charcoal/75" />

      {/* Subtle gold vignette from centre */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">

        {/* Tagline above */}
        <p
          className="text-gold/60 text-[0.6rem] tracking-[5px] uppercase font-jost"
          style={{ opacity: 0, animation: 'letterFadeUp 0.5s ease forwards', animationDelay: '100ms' }}
        >
          Kuih Tradisional
        </p>

        {/* Wordmark */}
        <div className="relative">
          <h1
            className="font-playfair italic font-black text-cream leading-none select-none"
            style={{
              fontSize: 'clamp(3rem, 10vw, 5.5rem)',
              letterSpacing: '0.06em',
              opacity: 0,
              animation: 'letterFadeUp 0.6s ease forwards',
              animationDelay: '200ms',
            }}
          >
            DK<span className="text-gold not-italic">AMPUNG</span>
          </h1>

          {/* Gold underline */}
          <div
            className="h-[1.5px] bg-gold/70 rounded-full origin-left mt-2"
            style={{
              transform: 'scaleX(0)',
              animation: 'underlineDraw 0.6s ease forwards',
              animationDelay: '700ms',
            }}
          />
        </div>

        {/* Pulsing dots */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold/50"
              style={{
                animation: 'dotBlink 1.2s ease-in-out infinite',
                animationDelay: `${800 + i * 180}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

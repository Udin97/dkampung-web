const LETTERS = [
  { char: 'D', gold: false },
  { char: 'K', gold: false },
  { char: 'A', gold: true  },
  { char: 'M', gold: true  },
  { char: 'P', gold: true  },
  { char: 'U', gold: true  },
  { char: 'N', gold: true  },
  { char: 'G', gold: true  },
]

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center">
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
        backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div className="relative flex flex-col items-center gap-5">
        {/* Animated wordmark */}
        <div className="relative">
          <div className="font-fraunces font-black text-4xl tracking-[6px] select-none flex">
            {LETTERS.map((l, i) => (
              <span
                key={i}
                className={l.gold ? 'text-gold' : 'text-charcoal'}
                style={{
                  opacity: 0,
                  animation: 'letterFadeUp 0.4s ease forwards',
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {l.char}
              </span>
            ))}
          </div>
          {/* Underline draw */}
          <div
            className="h-[2px] bg-gold rounded-full origin-left mt-1.5"
            style={{
              transform: 'scaleX(0)',
              animation: 'underlineDraw 0.5s ease forwards',
              animationDelay: '520ms',
            }}
          />
        </div>

        {/* Pulsing dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gold/60"
              style={{
                animation: 'dotBlink 1.2s ease-in-out infinite',
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

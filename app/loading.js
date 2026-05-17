export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-stone flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
        backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      <div className="relative flex flex-col items-center gap-6">
        <div className="font-fraunces font-black text-charcoal text-3xl tracking-[5px] select-none">
          <span>DK</span><span className="text-gold">AMPUNG</span>
        </div>
        <div className="w-10 h-10 border-[3px] border-forest/15 border-t-forest rounded-full animate-spin" />
        <div className="text-muted/70 text-xs font-medium tracking-[3px] uppercase">Memuatkan...</div>
      </div>
    </div>
  )
}

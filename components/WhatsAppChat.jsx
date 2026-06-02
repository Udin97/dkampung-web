'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const WA_NUMBER = '60143860742'

const QUICK_REPLIES = [
  { label: '🛒 Tanya tentang menu', msg: 'Assalamualaikum, saya ingin tanya tentang menu kuih DKAMPUNG.' },
  { label: '📅 Buat tempahan majlis', msg: 'Assalamualaikum, saya ingin membuat tempahan kuih untuk majlis.' },
  { label: '📍 Lokasi & cawangan', msg: 'Assalamualaikum, boleh saya tahu lokasi cawangan DKAMPUNG?' },
  { label: '💬 Soalan lain', msg: 'Assalamualaikum, saya ingin bertanya tentang DKAMPUNG.' },
]

function TypingDots() {
  return (
    <div className="flex gap-[3px] items-center h-4 px-1">
      {[0, 1, 2].map(i => (
        <span key={i}
          className="w-[6px] h-[6px] rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  )
}

function Timestamp() {
  const now = new Date()
  return now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
}

export default function WhatsAppChat() {
  const pathname = usePathname() || ''
  const [open, setOpen]           = useState(false)
  const [typing, setTyping]       = useState(false)
  const [msgVisible, setMsgVisible] = useState(false)
  const [replied, setReplied]     = useState(null)
  const [pulse, setPulse]         = useState(true)

  // Hide pulse after first 4 s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000)
    return () => clearTimeout(t)
  }, [])

  // Typing → message animation when chat opens
  useEffect(() => {
    if (!open || msgVisible) return
    setTyping(true)
    const t = setTimeout(() => { setTyping(false); setMsgVisible(true) }, 1600)
    return () => clearTimeout(t)
  }, [open, msgVisible])

  const openChat = () => {
    setOpen(true)
    setReplied(null)
    setPulse(false)
  }

  const closeChat = () => setOpen(false)

  const handleReply = reply => {
    setReplied(reply.label)
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(reply.msg)}`, '_blank')
    }, 700)
  }

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat popup ── */}
      {open && (
        <div className="w-[310px] bg-white rounded-2xl overflow-hidden border border-black/5
          shadow-[0_12px_48px_rgba(0,0,0,0.22)] animate-popIn origin-bottom-right">

          {/* WhatsApp header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
            <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center
              font-black text-white text-sm shrink-0 font-fraunces shadow-inner">
              DK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm leading-tight">DKAMPUNG</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span className="text-[#a8d5a2] text-[0.62rem]">Biasanya balas dalam beberapa minit</span>
              </div>
            </div>
            <button onClick={closeChat}
              className="text-white/60 hover:text-white transition-colors p-1 -mr-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat body — WhatsApp wallpaper-tinted bg */}
          <div className="px-4 py-4 space-y-3 min-h-[120px]" style={{ background: '#ECE5DD' }}>

            {/* Typing bubble */}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center
                  text-white text-[0.5rem] font-black font-fraunces shrink-0 mb-0.5">DK</div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Bot message */}
            {msgVisible && (
              <div className="flex items-end gap-2 animate-fadeIn">
                <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center
                  text-white text-[0.5rem] font-black font-fraunces shrink-0 mb-0.5">DK</div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm max-w-[88%]">
                  <p className="text-[#111] text-xs leading-relaxed">
                    Assalamualaikum! 👋<br />
                    Saya bot DKAMPUNG. Boleh saya bantu anda dengan tempahan kuih atau pertanyaan lain? 😊
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[0.58rem] text-gray-400"><Timestamp /></span>
                    <svg className="w-3 h-3 text-[#4FC3F7]" viewBox="0 0 16 11" fill="currentColor">
                      <path d="M11.071.653a.75.75 0 0 1 .053 1.06l-6.5 7.1a.75.75 0 0 1-1.08.025L1.044 6.338a.75.75 0 1 1 1.062-1.06l1.95 1.952 5.954-6.524a.75.75 0 0 1 1.06-.053z"/>
                      <path d="M15.071.653a.75.75 0 0 1 .053 1.06l-6.5 7.1a.75.75 0 0 1-1.054.028L9.2 10.5l5.811-6.786.06-.061z" opacity=".5"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* User reply echo */}
            {replied && (
              <div className="flex justify-end animate-fadeIn">
                <div className="rounded-2xl rounded-br-sm px-3.5 py-2 shadow-sm max-w-[85%]"
                  style={{ background: '#DCF8C6' }}>
                  <p className="text-[#111] text-xs">{replied}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[0.58rem] text-gray-400"><Timestamp /></span>
                    <svg className="w-3 h-3 text-[#4FC3F7]" viewBox="0 0 16 11" fill="currentColor">
                      <path d="M11.071.653a.75.75 0 0 1 .053 1.06l-6.5 7.1a.75.75 0 0 1-1.08.025L1.044 6.338a.75.75 0 1 1 1.062-1.06l1.95 1.952 5.954-6.524a.75.75 0 0 1 1.06-.053z"/>
                      <path d="M15.071.653a.75.75 0 0 1 .053 1.06l-6.5 7.1a.75.75 0 0 1-1.054.028L9.2 10.5l5.811-6.786.06-.061z" opacity=".5"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Redirecting notice */}
            {replied && (
              <p className="text-center text-[0.6rem] text-gray-400 animate-fadeIn">
                Membuka WhatsApp…
              </p>
            )}
          </div>

          {/* Quick reply buttons */}
          {msgVisible && !replied && (
            <div className="px-3 py-3 bg-white border-t border-gray-100">
              <p className="text-[0.6rem] uppercase tracking-wider text-gray-400 font-semibold mb-2 px-1">
                Pilih topik
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_REPLIES.map(r => (
                  <button key={r.label} onClick={() => handleReply(r)}
                    className="text-left text-xs font-medium px-3 py-2 rounded-xl transition-colors
                      border border-[#075E54]/12 hover:bg-[#075E54]/8 active:scale-[0.97]"
                    style={{ color: '#075E54', background: 'rgba(7,94,84,0.04)' }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAB button ── */}
      <div className="relative">
        {/* Pulse ring (shown for 4 s on load) */}
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        )}
        <button
          onClick={open ? closeChat : openChat}
          className="relative w-[52px] h-[52px] bg-[#25D366] rounded-full flex items-center justify-center
            shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:scale-110
            hover:shadow-[0_6px_28px_rgba(37,211,102,0.55)]
            transition-all duration-150 active:scale-95"
          aria-label={open ? 'Tutup chat' : 'Buka WhatsApp chat'}>
          {open ? (
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

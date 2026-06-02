'use client'

import { useState } from 'react'

const MALAY_MONTHS = [
  'Januari','Februari','Mac','April','Mei','Jun',
  'Julai','Ogos','September','Oktober','November','Disember',
]
const DAY_HEADERS = ['Ah','Is','Se','Ra','Kh','Ju','Sa']

function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function DatePicker({ value, onChange, minDate }) {
  const today   = new Date()
  today.setHours(0, 0, 0, 0)

  const min = minDate ? new Date(minDate) : today
  min.setHours(0, 0, 0, 0)

  // Start the view on the month that contains minDate (or current)
  const initYear  = min.getFullYear()
  const initMonth = min.getMonth()

  const [viewYear,  setViewYear]  = useState(initYear)
  const [viewMonth, setViewMonth] = useState(initMonth)

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay() // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Can't go back before the min-date month
  const atMinMonth = viewYear === initYear && viewMonth === initMonth

  const prevMonth = () => {
    if (atMinMonth) return
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isDisabled = d => {
    const date = new Date(viewYear, viewMonth, d)
    date.setHours(0, 0, 0, 0)
    return date < min
  }

  const isToday = d => {
    return d === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear  === today.getFullYear()
  }

  const isSelected = d => value === toDateStr(viewYear, viewMonth, d)

  const handleClick = d => {
    if (!d || isDisabled(d)) return
    onChange(toDateStr(viewYear, viewMonth, d))
  }

  return (
    <div className="bg-white border border-brown/15 rounded-2xl p-4 shadow-sm select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={atMinMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full
            text-charcoal/50 hover:bg-stone hover:text-charcoal
            disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-fraunces font-bold text-charcoal text-sm">
          {MALAY_MONTHS[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full
            text-charcoal/50 hover:bg-stone hover:text-charcoal transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(h => (
          <div key={h} className="text-center text-[0.62rem] font-semibold text-muted/60 uppercase tracking-wide py-1">
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />

          const disabled = isDisabled(d)
          const selected = isSelected(d)
          const todayCell = isToday(d)

          return (
            <button
              key={d}
              type="button"
              onClick={() => handleClick(d)}
              disabled={disabled}
              className={`
                w-full aspect-square flex items-center justify-center rounded-full
                text-sm font-medium transition-all duration-100
                ${selected
                  ? 'bg-forest text-cream shadow-sm scale-105'
                  : disabled
                    ? 'text-charcoal/25 cursor-not-allowed'
                    : todayCell
                      ? 'ring-1 ring-gold text-charcoal hover:bg-forest/10'
                      : 'text-charcoal hover:bg-forest/10 active:bg-forest/20'
                }
              `}>
              {d}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-brown/8">
        <span className="flex items-center gap-1.5 text-[0.65rem] text-muted">
          <span className="w-3 h-3 rounded-full bg-forest/80" />
          Dipilih
        </span>
        <span className="flex items-center gap-1.5 text-[0.65rem] text-muted">
          <span className="w-3 h-3 rounded-full ring-1 ring-gold" />
          Hari ini
        </span>
        <span className="flex items-center gap-1.5 text-[0.65rem] text-muted">
          <span className="w-3 h-3 rounded-full bg-charcoal/10" />
          Tidak tersedia
        </span>
      </div>
    </div>
  )
}

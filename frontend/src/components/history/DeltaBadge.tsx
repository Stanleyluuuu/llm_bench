import React from 'react'

interface DeltaBadgeProps {
  currentScore: number
  previousScore: number
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({ currentScore, previousScore }) => {
  const delta = currentScore - previousScore
  const isPositive = delta >= 0

  if (delta === 0) return null

  const percentageStr = `${isPositive ? '+' : ''}${(delta * 100).toFixed(1)}%`

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-mono border tracking-tight transition-all duration-300
        ${isPositive
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/5'
        }`}
    >
      <svg
        className={`w-3 h-3 transform transition-transform ${isPositive ? '' : 'rotate-180'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      {percentageStr}
    </span>
  )
}

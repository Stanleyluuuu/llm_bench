import React from 'react'

/**
 * Animated horizontal progress bar with semantic color variants.
 */
export function Progress({ value = 0, max = 100, variant = 'default', height = 6, animated = true }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  const FILL_COLORS = {
    default:     'hsl(var(--primary))',
    success:     'hsl(var(--success))',
    warning:     'hsl(var(--warning))',
    destructive: 'hsl(var(--destructive))',
    'score-high':'hsl(var(--score-high))',
    'score-mid': 'hsl(var(--score-mid))',
    'score-low': 'hsl(var(--score-low))',
  }

  return React.createElement('div', {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    style: {
      width: '100%',
      height: `${height}px`,
      background: 'hsl(var(--secondary))',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
    },
  },
    React.createElement('div', {
      className: animated ? 'animate-bar-grow' : '',
      style: {
        width: `${pct}%`,
        height: '100%',
        background: FILL_COLORS[variant] || FILL_COLORS.default,
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.5s var(--ease-spring)',
      },
    })
  )
}

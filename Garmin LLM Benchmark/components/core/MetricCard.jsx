import React from 'react'

/**
 * Metric display card with three states: loading (skeleton), empty (dash), data.
 * Mirrors the MetricCard pattern established in the benchmark frontend notes.
 */
export function MetricCard({ label, value, unit, status = 'normal', loading = false, trend }) {
  const base = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    boxShadow: 'var(--shadow-sm)',
    transition: 'background var(--duration-base) var(--ease-smooth)',
    position: 'relative',
    overflow: 'hidden',
  }

  const statusLeftBorder = {
    normal:  undefined,
    warning: '3px solid hsl(var(--warning))',
    error:   '3px solid hsl(var(--destructive))',
    active:  '3px solid hsl(var(--primary))',
  }

  /* ── Loading state ── */
  if (loading) {
    return React.createElement('div', { style: base },
      React.createElement('div', { className: 'skeleton-shimmer', style: { width: '60%', height: '10px', marginBottom: '8px' } }),
      React.createElement('div', { className: 'skeleton-shimmer', style: { width: '40%', height: '22px' } })
    )
  }

  /* ── Empty / error state ── */
  if (value === undefined || value === null) {
    return React.createElement('div', { style: base },
      React.createElement('span', {
        style: { color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' },
      }, '—')
    )
  }

  /* ── Data state ── */
  const leftBorderStyle = statusLeftBorder[status]
    ? { borderLeft: statusLeftBorder[status], paddingLeft: '9px' }
    : {}

  return React.createElement('div', {
    style: { ...base, ...leftBorderStyle, cursor: 'default' },
    className: 'hover-lift',
  },
    React.createElement('p', {
      style: { color: 'hsl(var(--muted-foreground))', fontSize: 'var(--text-xs)', marginBottom: '4px', fontFamily: 'var(--font-sans)' },
    }, label),
    React.createElement('p', {
      style: {
        color: 'hsl(var(--foreground))',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-lg)',
        fontWeight: '700',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
        display: 'flex',
        alignItems: 'baseline',
        gap: '3px',
      },
    },
      String(value),
      unit && React.createElement('span', {
        style: { fontSize: 'var(--text-xs)', fontWeight: '400', color: 'hsl(var(--muted-foreground))' },
      }, unit)
    ),
    /* Mini sparkline */
    trend && trend.length >= 2 && React.createElement('svg', {
      width: '48',
      height: '16',
      viewBox: `0 0 48 16`,
      style: { position: 'absolute', bottom: '10px', right: '12px', opacity: 0.5 },
    },
      React.createElement('polyline', {
        points: trend.map((v, i) => {
          const max = Math.max(...trend)
          const min = Math.min(...trend)
          const range = max - min || 1
          const x = (i / (trend.length - 1)) * 48
          const y = 16 - ((v - min) / range) * 14
          return `${x},${y}`
        }).join(' '),
        fill: 'none',
        stroke: 'hsl(var(--primary))',
        strokeWidth: '1.5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })
    )
  )
}

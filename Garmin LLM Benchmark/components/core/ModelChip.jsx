import React from 'react'

/**
 * Model selector chip — matches the BenchmarkModelsCard chip from the app.
 * Left toggle zone enables/disables. Clicking the right info zone expands a
 * detail panel (API endpoint, size, context length, provider, doc link).
 * Custom models show a color accent on the left border.
 */
export function ModelChip({ label, name, kind = 'builtin', enabled = false, modelType = 'LLM', onToggle, accentColor, details }) {
  const [hovered, setHovered] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const hasDetails = Array.isArray(details) && details.length > 0

  const outer = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    overflow: 'hidden',
    minWidth: '170px',
    maxWidth: open ? '300px' : '280px',
    transition: 'transform 0.18s var(--ease-spring), box-shadow 0.18s var(--ease-smooth)',
    transform: hovered && !open ? 'translateY(-2px)' : 'none',
    boxShadow: open ? 'var(--shadow-md)' : hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
    border: enabled ? `2px solid hsl(var(--primary))` : `2px solid hsl(var(--border))`,
    background: enabled ? 'hsl(var(--primary) / 0.05)' : 'hsl(var(--card))',
    opacity: enabled ? 1 : 0.78,
    alignSelf: 'flex-start',
    ...(kind === 'custom' && accentColor ? { borderLeftColor: accentColor, borderLeftWidth: '3px' } : {}),
  }

  const row = { display: 'flex', alignItems: 'stretch', height: '72px' }

  const toggleZone = {
    width: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRight: `1px solid ${enabled ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border))'}`,
    background: enabled ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--secondary))',
    flexShrink: 0,
    transition: 'background var(--duration-fast) var(--ease-smooth)',
  }

  const checkBox = {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: `2px solid ${enabled ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}`,
    background: enabled ? 'hsl(var(--primary))' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--duration-fast) var(--ease-smooth)',
  }

  return React.createElement('div', {
    style: outer,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  },
    React.createElement('div', { style: row },
      /* Toggle zone */
      React.createElement('div', {
        onClick: onToggle, style: toggleZone, role: 'checkbox', 'aria-checked': enabled, tabIndex: 0,
      },
        React.createElement('div', { style: checkBox },
          enabled && React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none' },
            React.createElement('path', { d: 'M2 6l3 3 5-5', stroke: 'hsl(var(--primary-foreground))', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' })
          )
        )
      ),
      /* Info zone — click to expand */
      React.createElement('div', {
        onClick: hasDetails ? () => setOpen(o => !o) : undefined,
        title: hasDetails ? '點擊查看模型細節' : undefined,
        style: {
          flex: 1, padding: '8px 10px 8px 12px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: '2px', minWidth: 0,
          cursor: hasDetails ? 'pointer' : 'default',
          background: open ? 'hsl(var(--accent) / 0.4)' : 'transparent',
          transition: 'background var(--duration-fast) var(--ease-smooth)',
        },
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' } },
          React.createElement('span', {
            style: { fontSize: '0.875rem', fontWeight: '600', color: enabled ? 'hsl(var(--primary))' : 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
          }, label),
          React.createElement('span', {
            style: {
              display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 6px', borderRadius: '4px',
              fontSize: '0.625rem', fontWeight: '500', fontFamily: 'var(--font-mono)',
              background: kind === 'builtin' ? 'hsl(var(--model-builtin-soft))' : 'hsl(var(--model-custom-soft))',
              color: kind === 'builtin' ? 'hsl(var(--model-builtin))' : 'hsl(var(--model-custom))', flexShrink: 0,
            },
          },
            React.createElement('span', { style: { width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', opacity: 0.7 } }),
            kind === 'builtin' ? 'Builtin' : 'Custom'
          )
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 } },
          React.createElement('span', {
            style: { fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
          }, name || modelType),
          hasDetails && React.createElement('svg', {
            width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2,
            style: { flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration-base) var(--ease-smooth)' },
          }, React.createElement('polyline', { points: '6 9 12 15 18 9' }))
        )
      )
    ),
    /* Detail panel */
    hasDetails && open && React.createElement('div', {
      className: 'animate-fade-in',
      style: {
        borderTop: '1px solid hsl(var(--border))', padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: '5px',
        background: 'hsl(var(--secondary) / 0.5)',
      },
    },
      details.map((d, i) => React.createElement('div', {
        key: i, style: { display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' },
      },
        React.createElement('span', { style: { color: 'hsl(var(--muted-foreground))', flexShrink: 0, minWidth: '54px' } }, d.label),
        d.href
          ? React.createElement('a', { href: d.href, target: '_blank', rel: 'noreferrer', onClick: e => e.stopPropagation(),
              style: { color: 'hsl(var(--primary))', textDecoration: 'none', wordBreak: 'break-all', borderBottom: '1px solid hsl(var(--primary) / 0.3)' } }, d.value)
          : React.createElement('span', { style: { color: 'hsl(var(--foreground))', wordBreak: 'break-all', fontWeight: 500 } }, d.value)
      ))
    )
  )
}

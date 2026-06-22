import React from 'react'

/* Variant → style map */
const BADGE_STYLES = {
  /* Semantic status */
  success:     { bg: 'hsl(160 84% 39% / 0.12)', color: 'hsl(160 70% 28%)',             border: '1px solid hsl(160 84% 39% / 0.3)' },
  warning:     { bg: 'hsl(38 92% 50% / 0.12)',  color: 'hsl(38 80% 32%)',              border: '1px solid hsl(38 92% 50% / 0.3)'  },
  error:       { bg: 'hsl(0 84% 60% / 0.12)',   color: 'hsl(0 72% 42%)',               border: '1px solid hsl(0 84% 60% / 0.3)'   },
  pending:     { bg: 'hsl(var(--primary) / 0.1)',color: 'hsl(var(--primary))',          border: '1px solid hsl(var(--primary) / 0.3)' },
  /* Model source */
  builtin:     { bg: 'hsl(var(--model-builtin-soft))', color: 'hsl(var(--model-builtin))', border: 'none' },
  custom:      { bg: 'hsl(var(--model-custom-soft))',  color: 'hsl(var(--model-custom))',  border: 'none' },
  /* Score bands */
  'score-high':{ bg: 'hsl(160 84% 39% / 0.1)',  color: 'hsl(160 70% 30%)',             border: 'none' },
  'score-mid': { bg: 'hsl(38 92% 50% / 0.1)',   color: 'hsl(38 80% 32%)',              border: 'none' },
  'score-low': { bg: 'hsl(0 84% 60% / 0.1)',    color: 'hsl(0 72% 42%)',               border: 'none' },
  /* Capability chips */
  grounding:   { bg: 'hsl(243 80% 60% / 0.1)',  color: 'hsl(243 75% 45%)',             border: 'none' },
  ocr:         { bg: 'hsl(195 80% 50% / 0.1)',  color: 'hsl(195 80% 30%)',             border: 'none' },
  detection:   { bg: 'hsl(160 60% 40% / 0.1)',  color: 'hsl(160 60% 28%)',             border: 'none' },
  vlm:         { bg: 'hsl(270 60% 55% / 0.1)',  color: 'hsl(270 60% 38%)',             border: 'none' },
  /* Default */
  default:     { bg: 'hsl(var(--secondary))',    color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' },
}

/**
 * Inline label for status, model source, capabilities, and score bands.
 */
export function Badge({ children, variant = 'default', dot = false, pill = true }) {
  const styles = BADGE_STYLES[variant] || BADGE_STYLES.default

  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: pill ? '2px 8px' : '1px 6px',
      borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-sm)',
      fontSize: '0.6875rem',
      fontWeight: '500',
      fontFamily: 'var(--font-mono)',
      lineHeight: '1.4',
      background: styles.bg,
      color: styles.color,
      border: styles.border,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
  },
    dot && React.createElement('span', {
      style: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'currentColor',
        opacity: 0.7,
        flexShrink: 0,
      },
    }),
    children
  )
}

import React from 'react'

const VARIANTS = {
  primary:     { bg: 'hsl(var(--primary))',     color: 'hsl(var(--primary-foreground))', border: 'none' },
  secondary:   { bg: 'hsl(var(--secondary))',   color: 'hsl(var(--foreground))',         border: '1px solid hsl(var(--border))' },
  outline:     { bg: 'transparent',             color: 'hsl(var(--primary))',            border: '1px solid hsl(var(--primary))' },
  ghost:       { bg: 'transparent',             color: 'hsl(var(--foreground))',         border: 'none' },
  destructive: { bg: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))', border: 'none' },
}

const SIZES = {
  sm: { padding: '5px 12px',  fontSize: '0.75rem',  height: '30px' },
  md: { padding: '7px 16px',  fontSize: '0.875rem', height: '36px' },
  lg: { padding: '9px 24px',  fontSize: '0.875rem', height: '42px', fontWeight: '600' },
}

/**
 * Primary interaction element. Uses font-mono like the app's action buttons.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  style: extraStyle = {},
}) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size] || SIZES.md
  const isDisabled = disabled || loading

  return React.createElement('button', {
    type,
    onClick,
    disabled: isDisabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontFamily: 'var(--font-mono)',
      fontWeight: s.fontWeight || '500',
      borderRadius: 'var(--radius-md)',
      border: v.border,
      background: v.bg,
      color: v.color,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.4 : 1,
      transition: 'all var(--duration-base) var(--ease-smooth)',
      outline: 'none',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      ...s,
      height: undefined,
      minHeight: s.height,
      ...extraStyle,
    },
  }, loading
    ? React.createElement(React.Fragment, null,
        React.createElement('span', { style: { width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' } }),
        children
      )
    : children
  )
}

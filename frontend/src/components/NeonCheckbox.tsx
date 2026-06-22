import type React from 'react'

// Styles live in index.css — no runtime injection needed.

// ── Particle directions (12-point uniform circle) ────────────────────────────
const PARTICLE_DIRS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0,     y: -1    },
  { x: 0.5,   y: -0.87 },
  { x: 0.87,  y: -0.5  },
  { x: 1,     y: 0     },
  { x: 0.87,  y: 0.5   },
  { x: 0.5,   y: 0.87  },
  { x: 0,     y: 1     },
  { x: -0.5,  y: 0.87  },
  { x: -0.87, y: 0.5   },
  { x: -1,    y: 0     },
  { x: -0.87, y: -0.5  },
  { x: -0.5,  y: -0.87 },
]

const SPARK_ANGLES: ReadonlyArray<number> = [0, 90, 180, 270]

interface NeonCheckboxProps {
  checked: boolean
  onChange: () => void
  'aria-label'?: string
}

export function NeonCheckbox({ checked, onChange, 'aria-label': ariaLabel }: NeonCheckboxProps) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onChange()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange()
    }
  }

  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`nc-checkbox${checked ? ' nc-checked' : ''}`}
    >
      <div className="nc-frame">
        <div className="nc-box" />
        <div className="nc-glow" />

        <div className="nc-borders">
          <span /><span /><span /><span />
        </div>

        <div className="nc-check-container">
          <svg className="nc-check" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8l4 4 6-7" />
          </svg>
        </div>

        <div className="nc-particles">
          {PARTICLE_DIRS.map((d, i) => (
            <span
              key={i}
              style={{ '--x': d.x, '--y': d.y } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="nc-rings">
          <div className="nc-ring" />
          <div className="nc-ring" />
          <div className="nc-ring" />
        </div>

        <div className="nc-sparks">
          {SPARK_ANGLES.map((r, i) => (
            <span
              key={i}
              style={{ '--r': r } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </span>
  )
}


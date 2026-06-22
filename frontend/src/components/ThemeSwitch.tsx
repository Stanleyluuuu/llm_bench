import type { ThemePreference } from '@/hooks/useTheme'

interface ThemeSwitchProps {
  preference: ThemePreference
  onSetTheme: (pref: ThemePreference) => void
}

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: '淺色', icon: '☀️' },
  { value: 'system', label: '系統', icon: '💻' },
  { value: 'dark', label: '深色', icon: '🌙' },
]

export function ThemeSwitch({ preference, onSetTheme }: ThemeSwitchProps) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-secondary p-0.5 gap-0.5"
      role="radiogroup"
      aria-label="主題模式切換"
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={preference === value}
          aria-label={`${label}模式`}
          onClick={() => onSetTheme(value)}
          className={[
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            preference === value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          ].join(' ')}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

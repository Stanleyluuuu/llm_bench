import { Check } from 'lucide-react'

interface ModelChipsProps {
  models: string[]
  visible: Set<string>
  colors: Map<string, string>
  onToggle: (modelId: string) => void
}

export function ModelChips({ models, visible, colors, onToggle }: ModelChipsProps) {
  if (models.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {models.map((m) => {
        const isOn = visible.has(m)
        const color = colors.get(m) ?? '#3b82f6'
        return (
          <button
            key={m}
            type="button"
            onClick={() => onToggle(m)}
            className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-colors ${
              isOn
                ? 'border-transparent bg-muted/60 text-foreground'
                : 'border-border text-muted-foreground opacity-50 line-through hover:opacity-70 hover:bg-muted/30'
            }`}
            aria-pressed={isOn}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: color, opacity: isOn ? 1 : 0.3 }}
            />
            <span>{m}</span>
            {isOn && <Check className="w-3 h-3 opacity-60" />}
          </button>
        )
      })}
    </div>
  )
}

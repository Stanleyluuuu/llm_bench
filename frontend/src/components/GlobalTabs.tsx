import { Terminal, Eye } from 'lucide-react'
import type { ModelTab } from '@/types/benchmark'

interface GlobalTabsProps {
  activeTab: ModelTab
  llmCount: number
  vlmCount: number
  onChange: (tab: ModelTab) => void
}

export function GlobalTabs({ activeTab, llmCount, vlmCount, onChange }: GlobalTabsProps) {
  const tabs: { id: ModelTab; label: string; icon: typeof Terminal; count: number }[] = [
    { id: 'LLM', label: 'LLM', icon: Terminal, count: llmCount },
    { id: 'VLM', label: 'VLM / Locate', icon: Eye, count: vlmCount },
  ]

  return (
    <div className="flex gap-2">
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            activeTab === id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:bg-accent hover:scale-[1.02]',
          ].join(' ')}
        >
          <Icon className="w-4 h-4" />
          {label}
          <span className={[
            'text-xs px-1.5 py-0.5 rounded font-mono',
            activeTab === id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-accent text-muted-foreground',
          ].join(' ')}>
            {count}
          </span>
        </button>
      ))}
    </div>
  )
}

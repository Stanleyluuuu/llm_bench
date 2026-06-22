import type { RunMetadata } from '@/types/history'

interface RunSelectorProps {
  runs: RunMetadata[]
  selectedRunId: string | null
  onSelect: (runId: string) => void
}

function formatTs(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RunSelector({ runs, selectedRunId, onSelect }: RunSelectorProps) {
  if (runs.length === 0) return null
  // Show newest first in the dropdown for user convenience.
  const ordered = [...runs].reverse()
  return (
    <label className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
      <span>Run</span>
      <select
        value={selectedRunId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {ordered.map((r) => (
          <option key={r.run_id} value={r.run_id}>
            {formatTs(r.timestamp)} · {r.models.length} models
          </option>
        ))}
      </select>
    </label>
  )
}

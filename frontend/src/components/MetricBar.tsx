import { Progress } from '@/components/ui/progress'
import type { MetricDisplayInfo } from '@/types/ui'

interface MetricBarProps {
  info: MetricDisplayInfo
}

export function MetricBar({ info }: MetricBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{info.displayName}</span>
        <span className={`text-xs font-mono ${info.colorClass}`}>{info.displayValue}</span>
      </div>
      <Progress
        value={Math.min(info.barWidth, 100)}
        indicatorClassName={info.colorClass.replace('text-', 'bg-')}
        aria-label={info.displayName}
      />
    </div>
  )
}

import { useMemo } from 'react'
import type { RunMetadata, TrendMetric } from '@/types/history'

interface TrendChartProps {
  runs: RunMetadata[]
  visibleModels: Set<string>
  metric: TrendMetric
  modelColors: Map<string, string>
  modelDashes?: Map<string, string>
  selectedRunId: string | null
  onSelectRun?: (runId: string) => void
}

interface Point {
  x: number
  y: number | null
  runId: string
}

interface Series {
  modelId: string
  color: string
  dash: string
  points: Point[]
}

const METRIC_LABEL: Record<TrendMetric, string> = {
  avg_score: '平均評審分數',
  pass_rate: '通過率 (Pass Rate)',
  mean_iou: '平均 IoU',
}

const METRIC_RANGE: Record<TrendMetric, [number, number]> = {
  avg_score: [0, 5],
  pass_rate: [0, 1],
  mean_iou: [0, 1],
}

const DASH_PATTERNS = ['', '6 4', '2 3', '8 2 2 2', '4 2 4 2'] as const

const CHART_WIDTH = 720
const CHART_HEIGHT = 200
const MARGIN = { top: 12, right: 32, bottom: 24, left: 40 }
const INNER_H = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

function computeInnerW(chartWidth: number): number {
  return chartWidth - MARGIN.left - MARGIN.right
}

function getMetricValue(summary: Record<string, { avg_score: number | null; pass_rate: number | null; mean_iou: number | null }> , modelId: string, metric: TrendMetric): number | null {
  const entry = summary[modelId]
  if (!entry) return null
  const v = entry[metric]
  return typeof v === 'number' ? v : null
}

export function TrendChart({
  runs,
  visibleModels,
  metric,
  modelColors,
  modelDashes,
  selectedRunId,
  onSelectRun,
}: TrendChartProps) {
  const [yMin, yMax] = METRIC_RANGE[metric]

  // Responsive: constrain chart width when data points are few
  const effectiveWidth = runs.length <= 2 ? Math.min(CHART_WIDTH, 400) : CHART_WIDTH
  const INNER_W = computeInnerW(effectiveWidth)

  const allModels = useMemo(() => {
    const seen: string[] = []
    for (const run of runs) {
      for (const m of run.models) {
        if (!seen.includes(m)) seen.push(m)
      }
    }
    return seen
  }, [runs])

  const series: Series[] = useMemo(() => {
    return allModels
      .filter((m) => visibleModels.has(m))
      .map((modelId, idx) => {
        const points: Point[] = runs.map((run, i) => {
          const x = runs.length === 1 ? INNER_W / 2 : (i / (runs.length - 1)) * INNER_W
          if (!run.models.includes(modelId)) return { x, y: null, runId: run.run_id }
          const val = getMetricValue(run.summary, modelId, metric)
          return { x, y: val, runId: run.run_id }
        })
        return {
          modelId,
          color: modelColors.get(modelId) ?? `hsl(${(idx * 67) % 360} 70% 55%)`,
          dash: modelDashes?.get(modelId) ?? DASH_PATTERNS[idx % DASH_PATTERNS.length]!,
          points,
        }
      })
  }, [allModels, visibleModels, runs, metric, modelColors, modelDashes, INNER_W])

  function projectY(val: number): number {
    const ratio = (val - yMin) / (yMax - yMin || 1)
    return INNER_H - ratio * INNER_H
  }

  function buildPath(points: Point[]): string {
    // spanGaps:false equivalent — start new sub-path after each null.
    const parts: string[] = []
    let pendingMove = true
    for (const p of points) {
      if (p.y === null) {
        pendingMove = true
        continue
      }
      const y = projectY(p.y)
      parts.push(`${pendingMove ? 'M' : 'L'}${p.x.toFixed(1)},${y.toFixed(1)}`)
      pendingMove = false
    }
    return parts.join(' ')
  }

  // Check if all visible data is zero — show empty state
  const allZero = series.every(s => s.points.every(p => p.y === null || p.y === 0))

  if (runs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        尚無歷史紀錄,跑一次 benchmark 後會出現
      </div>
    )
  }

  if (allZero && runs.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[180px] text-center gap-2">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <p className="text-sm text-foreground font-medium">所有分數為 0.0</p>
        <p className="text-xs text-muted-foreground max-w-[300px]">
          可能原因：模型回傳格式不符預期、評測尚未完成、或 API 連線失敗。請確認 Run 的狀態標籤。
        </p>
      </div>
    )
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => yMin + t * (yMax - yMin))

  const containerMaxW = runs.length <= 2 ? 'max-w-[420px] mx-auto' : ''

  return (
    <div className={`overflow-x-auto ${containerMaxW}`}>
      <svg
        viewBox={`0 0 ${effectiveWidth} ${CHART_HEIGHT}`}
        className={`w-full h-auto ${runs.length <= 2 ? 'min-w-[280px]' : 'min-w-[480px]'}`}
        role="img"
        aria-label={`${METRIC_LABEL[metric]} 趨勢圖,共 ${runs.length} 個 run`}
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* Grid + Y axis */}
          {yTicks.map((v) => (
            <g key={v}>
              <line
                x1={0}
                x2={INNER_W}
                y1={projectY(v)}
                y2={projectY(v)}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="5 4"
                opacity={0.5}
              />
              <text
                x={-6}
                y={projectY(v)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize={10}
                fontFamily="ui-monospace, SFMono-Regular, monospace"
              >
                {metric === 'avg_score' ? v.toFixed(1) : v.toFixed(2)}
              </text>
            </g>
          ))}

          {/* X axis labels (run timestamps, sparse) */}
          {runs.map((run, i) => {
            const showLabel = i === 0 || i === runs.length - 1 || i % Math.max(1, Math.ceil(runs.length / 6)) === 0
            const x = runs.length === 1 ? INNER_W / 2 : (i / (runs.length - 1)) * INNER_W
            const label = new Date(run.timestamp).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
            const isSelected = run.run_id === selectedRunId
            return (
              <g key={run.run_id}>
                <line
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={INNER_H}
                  className={isSelected ? 'stroke-primary/70' : 'stroke-transparent'}
                  strokeWidth={isSelected ? 1.5 : 0}
                  strokeDasharray={isSelected ? '4 3' : undefined}
                />
                <rect
                  x={x - 8}
                  y={0}
                  width={16}
                  height={INNER_H}
                  fill="transparent"
                  style={{ cursor: onSelectRun ? 'pointer' : 'default' }}
                  onClick={() => onSelectRun?.(run.run_id)}
                >
                  <title>{`${new Date(run.timestamp).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}\nmodels: ${run.models.join(', ')}`}</title>
                </rect>
                {showLabel && (
                  <text
                    x={x}
                    y={INNER_H + 14}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize={9}
                    fontFamily="ui-monospace, SFMono-Regular, monospace"
                  >
                    {label}
                  </text>
                )}
              </g>
            )
          })}

          {/* Lines */}
          {series.map((s) => {
            const isAllZeroSeries = s.points.every(p => p.y === null || p.y === 0)
            return (
              <g key={s.modelId}>
                <path
                  d={buildPath(s.points)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isAllZeroSeries ? 1 : 1.75}
                  strokeDasharray={isAllZeroSeries ? '4 4' : (s.dash || undefined)}
                  strokeOpacity={isAllZeroSeries ? 0.25 : 1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {s.points.map((p, i) => {
                  if (p.y === null) return null
                  const isSel = p.runId === selectedRunId
                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={projectY(p.y)}
                      r={isSel ? 4 : 2}
                      fill={s.color}
                      stroke={isSel ? 'var(--background)' : s.color}
                      strokeWidth={isSel ? 1.5 : 0}
                    >
                      <title>{`${s.modelId} @ ${p.runId}\n${METRIC_LABEL[metric]}: ${p.y.toFixed(3)}`}</title>
                    </circle>
                  )
                })}
              </g>
            )
          })}
        </g>
      </svg>
      <div className="mt-1 text-[11px] font-mono text-muted-foreground text-center">
        {METRIC_LABEL[metric]} · {runs.length} runs
      </div>
    </div>
  )
}

export { DASH_PATTERNS }

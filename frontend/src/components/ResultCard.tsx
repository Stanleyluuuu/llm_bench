import { memo, useState } from 'react'
import { CheckCircle, XCircle, MinusCircle, AlertTriangle, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MetricBar } from './MetricBar'
import { DetailSection } from './DetailSection'
import { PromptBlock } from './PromptBlock'
import { cn, formatProjectName } from '@/lib/utils'
import { fmtPct } from '@/lib/format'
import { modelColor } from '@/lib/model-colors'
import type { ModelOutcome, ProjectRun } from '@/types/benchmark'
import type { MetricDisplayInfo } from '@/types/ui'
import { scoreColor } from '@/lib/score-color'

function colorForScore(score: number): string {
  if (score >= 0.85) return 'text-emerald-700 dark:text-emerald-400'
  if (score >= 0.4) return 'text-amber-700 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function barColorForScore(score: number): string {
  if (score >= 0.85) return 'bg-emerald-500'
  if (score >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

function cardBgForScore(score: number | null): string {
  if (score === null) return ''
  if (score >= 0.85) return 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
  if (score >= 0.4) return 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
  return 'bg-red-50/50 dark:bg-red-950/15 border-red-200 dark:border-red-900/45'
}

function formatMetricName(metric: string): string {
  const map: Record<string, string> = {
    answer_correctness: '答案正確性', answer_similarity: '答案相似度',
    answer_relevancy: '答案相關性', faithfulness: '忠實度',
    context_precision: '上下文精確度', context_recall: '上下文召回率',
    avg_score: 'Avg Score', wins: 'Wins', ties: '平手', accuracy: '準確率',
  }
  const parts = metric.split('_')
  if (parts.length > 1) {
    const suffix = parts.slice(1).join('_').toLowerCase()
    for (const [k, v] of Object.entries(map)) {
      if (suffix === k || suffix.includes(k)) return `${parts[0]} ${v}`
    }
    return `${parts[0]} ${parts.slice(1).join(' ')}`
  }
  return map[metric.toLowerCase()] ?? metric.replace(/_/g, ' ')
}

function getMetricInfo(metric: string, value: number, totalSamples: number): MetricDisplayInfo {
  const lower = metric.toLowerCase()
  const displayName = formatMetricName(metric)
  if (lower.includes('avg_score')) {
    return { displayName, displayValue: `${value.toFixed(1)}/10`, barWidth: (value / 10) * 100, colorClass: colorForScore(value / 10) }
  }
  if (lower.includes('wins')) {
    const barWidth = totalSamples > 0 ? (value / totalSamples) * 100 : Math.min(value * 50, 100)
    const winRateSuffix = totalSamples > 0 ? ` (${Math.round((value / totalSamples) * 100)}%)` : ''
    const displayValue = totalSamples > 0 ? `${value}/${totalSamples}${winRateSuffix}` : `${value} 次`
    return { displayName, displayValue, barWidth, colorClass: value > 0 ? 'text-emerald-500' : 'text-muted-foreground' }
  }
  if (lower === 'ties') {
    const barWidth = totalSamples > 0 ? (value / totalSamples) * 100 : Math.min(value * 50, 100)
    const displayValue = totalSamples > 0 ? `${value}/${totalSamples}` : `${value} 次`
    return { displayName, displayValue, barWidth, colorClass: value > 0 ? 'text-sky-500' : 'text-muted-foreground' }
  }
  return { displayName, displayValue: fmtPct(value), barWidth: value * 100, colorClass: colorForScore(value) }
}

function getPrimaryAccuracy(scores: Record<string, number | number[]>): { value: number; key: string } | null {
  if (typeof scores['mean_iou'] === 'number') return { value: scores['mean_iou'], key: 'mean_iou' }
  if (typeof scores['accuracy'] === 'number') return { value: scores['accuracy'], key: 'accuracy' }
  if (typeof scores['avg_score'] === 'number') return { value: scores['avg_score'] / 10, key: 'avg_score' }
  const entry = Object.entries(scores).find(([, v]) => typeof v === 'number' && (v as number) >= 0 && (v as number) <= 1)
  if (entry) return { value: entry[1] as number, key: entry[0] }
  return null
}

const RUBRIC_DIMS = [
  { key: 'accuracy' as const, dimLabel: '準確' },
  { key: 'completeness' as const, dimLabel: '完整' },
  { key: 'relevance_clarity' as const, dimLabel: '流暢' },
] as const

const ModelColumn = memo(function ModelColumn({
  label, run, color, onToggleVisibility, isHidden, isChampion, rubricData,
}: {
  label: string; run: ProjectRun; color: string; onToggleVisibility?: () => void; isHidden?: boolean; isChampion?: boolean
  rubricData?: { avg: number; accuracy: number; completeness: number; relevance_clarity: number; count: number } | null
}) {
  if (run.status === 'running') {
    return (
      <div className="bg-card rounded-md p-4 border border-border space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 skeleton-shimmer" />
          <div className="h-3.5 w-24 rounded skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-20 rounded skeleton-shimmer" />
              <div className="h-1.5 rounded-full skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (run.status === 'skipped') {
    return (
      <div className={cn('relative bg-card rounded-md p-4 border border-border space-y-2', isHidden && 'opacity-50 grayscale')}>
        {onToggleVisibility && (
          <button type="button" onClick={onToggleVisibility} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-sm" title={isHidden ? '顯示此模型' : '隱藏此模型'} aria-label={isHidden ? '顯示此模型' : '隱藏此模型'}>{isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
        )}
        <div className="flex items-center gap-2">
          <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate">{label}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {run.reason === 'customapi_unsupported'
            ? 'Custom API 不支援此類型的 VLM 任務'
            : run.reason
              ? `跳過 — ${run.reason}`
              : '此模型不支援此任務'}
        </p>
      </div>
    )
  }

  if (run.status === 'error') {
    return (
      <div className={cn('relative bg-card rounded-md p-4 border border-destructive/30 space-y-2', isHidden && 'opacity-50 grayscale')}>
        {onToggleVisibility && (
          <button type="button" onClick={onToggleVisibility} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-sm" title={isHidden ? '顯示此模型' : '隱藏此模型'} aria-label={isHidden ? '顯示此模型' : '隱藏此模型'}>{isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
        )}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md bg-destructive/60" />
        <div className="flex items-center gap-2 pl-1">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{label}</span>
        </div>
        <p className="text-xs text-destructive/80 font-mono pl-1">{run.error ?? '評估失敗'}</p>
      </div>
    )
  }

  const scores = run.scores ?? {}
  const perf = run.performance
  const totalSamples = run.results?.question?.length ?? 0
  const parseErrorCount = typeof scores['parse_error_count'] === 'number' ? scores['parse_error_count'] as number : 0
  const perfText = run.performance_display
    ?? (perf?.avg_response_time != null ? `${perf.avg_response_time.toFixed(2)}s avg` : null)

  const isRubric = rubricData != null
  const rubricColors = isRubric ? scoreColor(rubricData!.avg) : null

  const primary = !isRubric ? getPrimaryAccuracy(scores) : null
  const METRIC_LABEL: Record<string, string> = {
    mean_iou: 'mean IoU',
    accuracy: '準確率',
    wins: '勝率',
    avg_score: '/ 10',
  }
  const metricLabel = primary != null ? (METRIC_LABEL[primary.key] ?? primary.key.replace(/_/g, ' ')) : ''
  // avg_score is stored as value/10 for bar scaling; display the original 0-10 scale
  const displayScore = primary != null
    ? (primary.key === 'avg_score' ? `${(primary.value * 10).toFixed(1)}` : fmtPct(primary.value))
    : null
  const colorClass = primary != null ? colorForScore(primary.value) : 'text-muted-foreground'
  const barColorClass = primary != null ? barColorForScore(primary.value) : 'bg-muted'

  const statusBarColor = isRubric
    ? (rubricData!.avg >= 4.25 ? 'hsl(var(--success))'
      : rubricData!.avg >= 2.0 ? 'hsl(var(--warning))'
      : 'hsl(var(--destructive))')
    : (primary == null ? 'hsl(var(--muted-foreground))'
      : primary.value >= 0.85 ? 'hsl(var(--success))'
      : primary.value >= 0.4 ? 'hsl(var(--warning))'
      : 'hsl(var(--destructive))')

  const cardClass = cn(
    'relative rounded-md p-3 pl-4 space-y-2.5 border',
    'shadow-sm hover:shadow-md transition-shadow overflow-hidden hover-lift',
    primary != null ? cardBgForScore(primary.value) : 'bg-card border-border',
    isHidden && 'opacity-50 grayscale',
    isChampion && 'ring-2 ring-emerald-400/70 dark:ring-emerald-600/70',
  )

  const secondaryEntries = Object.entries(scores).filter(
    ([k, v]) => k !== primary?.key
      && typeof v === 'number'
      && k !== 'iou_threshold'
      && !k.startsWith('per_sample_'),
  )

  return (
    <div className={cardClass}>
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: statusBarColor }} />
      {onToggleVisibility && (
        <button type="button" onClick={onToggleVisibility} className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-sm z-10" title={isHidden ? '顯示此模型' : '隱藏此模型'} aria-label={isHidden ? '顯示此模型' : '隱藏此模型'}>{isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
      )}
      {/* Task 2: 🏆 WINNER badge for project champion */}
      {isChampion && (
        <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm z-20 select-none">
          🏆 WINNER
        </span>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold font-mono text-foreground truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          {perfText && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">{perfText}</span>
          )}
          {!isRubric && primary != null && (
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-1">
                <span className={cn('text-2xl font-black tabular-nums', colorClass)}>{displayScore}</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">{metricLabel}</span>
            </div>
          )}
          {isRubric && (
            <div className="flex items-baseline gap-1">
              <span className={cn('text-2xl font-black tabular-nums', rubricColors!.fg)}>{rubricData!.avg.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">/ 5</span>
            </div>
          )}
        </div>
      </div>
      {!isRubric && primary != null && (
        <div className="relative w-full bg-secondary h-1.5 rounded-full overflow-visible">
          <div
            className={cn('h-full rounded-full transition-all duration-500 animate-progress-fill', barColorClass)}
            style={{ width: `${primary.value * 100}%` }}
          />
          {primary?.key === 'mean_iou' && typeof scores['iou_threshold'] === 'number' && (() => {
            const threshPct = (scores['iou_threshold'] as number) * 100
            return (
              <div
                className="absolute top-[-3px] h-[14px] w-px bg-slate-400 dark:bg-slate-500"
                style={{ left: `${threshPct}%` }}
                title={`門檻 ${Math.round(threshPct)}%`}
              >
                <span className="absolute -top-4 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground pointer-events-none select-none">
                  {Math.round(threshPct)}%
                </span>
              </div>
            )
          })()}
        </div>
      )}
      {isRubric && (
        <div className="space-y-1.5">
          {RUBRIC_DIMS.map(({ key, dimLabel }) => {
            const v = rubricData![key]
            const dc = scoreColor(v)
            return (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-muted-foreground">{dimLabel}</span>
                <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                  <div className={cn('h-full rounded-full', dc.bar)} style={{ width: `${(v / 5) * 100}%` }} />
                </div>
                <span className="w-5 text-right tabular-nums text-foreground">{v.toFixed(1)}</span>
              </div>
            )
          })}
          <div className="text-xs text-muted-foreground text-right tabular-nums">{rubricData!.count} 筆平均</div>
        </div>
      )}
      {!isRubric && secondaryEntries.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {/* Task 6: W/T/L combined row when both wins and ties are present */}
          {typeof scores['wins'] === 'number' && typeof scores['ties'] === 'number' && (() => {
            const w = scores['wins'] as number
            const t = scores['ties'] as number
            const l = totalSamples > 0 ? totalSamples - w - t : null
            return (
              <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wide w-8">W/T/L</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{w}W</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sky-600 dark:text-sky-400">{t}T</span>
                <span className="text-muted-foreground">/</span>
                <span className={l != null && l > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                  {l != null ? l : '?'}L
                </span>
                {totalSamples > 0 && (
                  <span className="ml-auto text-muted-foreground text-[10px]">
                    {Math.round((w / totalSamples) * 100)}% \u52dd\u7387
                  </span>
                )}
              </div>
            )
          })()}
          {secondaryEntries
            .filter(([k, v]) => typeof v === 'number' && k !== 'parse_error_count'
              // hide wins/ties when W/T/L combined row is shown
              && !(typeof scores['wins'] === 'number' && typeof scores['ties'] === 'number' && (k === 'wins' || k === 'ties'))
            )
            .map(([metric, value]) => (
              <MetricBar key={metric} info={getMetricInfo(metric, value as number, totalSamples)} />
            ))}
        </div>
      )}
      {parseErrorCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          {parseErrorCount} 筆解析失敗，已從分數排除
        </div>
      )}
      {Object.keys(scores).length === 0 && (
        <span className="text-muted-foreground text-xs font-mono">—</span>
      )}
    </div>
  )
})

interface ResultCardProps {
  projectName: string
  modelRuns: Array<{ modelId: string; outcome: ModelOutcome; colorIndex: number }>
  modelOrder: string[]
  hiddenModelIds: Set<string>
  onToggleVisibility: (projectName: string, modelId: string) => void
  onReorder: (newOrder: string[]) => void
}

/** Wrapper that makes a single model column sortable via @dnd-kit. */
function SortableModelItem({
  modelId, idx, children,
}: { modelId: string; idx: number; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: modelId,
    animateLayoutChanges: (args) =>
      defaultAnimateLayoutChanges({ ...args, wasDragging: true }),
  })

  // Only sortable-related properties on the outer node; keep animation separate
  // to avoid CSS @keyframes transform conflicting with dnd-kit's inline transform.
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms ease',
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.4 : 1,
  }

  const innerStyle: React.CSSProperties = {
    animationDelay: `${Math.min(idx * 60, 300)}ms`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'min-w-[240px] flex-1 max-w-[340px]',
        isDragging && 'ring-2 ring-primary/20 rounded-md',
      )}
      {...attributes}
    >
      {/* animate-slide-up lives on the inner wrapper so its @keyframes transform
          never conflicts with dnd-kit's inline transform on the outer node. */}
      <div className="animate-slide-up flex flex-col gap-1 relative group" style={innerStyle}>
        <div
          {...listeners}
          className="absolute top-1.5 left-1.5 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity py-0.5 z-10"
          title="拖曳重排"
          aria-label="拖曳重排模型順序"
        >
          <span className="text-sm select-none">⠿</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ResultCard({ projectName, modelRuns, modelOrder, hiddenModelIds, onToggleVisibility, onReorder }: ResultCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Derive prompt info from result payload (16.3 — no separate API call)
  const firstOkResults = modelRuns
    .find(mr => mr.outcome.projects[projectName]?.status === 'ok')
    ?.outcome.projects[projectName]?.results
  const systemPrompt = firstOkResults?.system_prompt ?? null
  const userPromptTemplate = firstOkResults?.user_prompt_template ?? null
  const filledUserPrompts = firstOkResults?.filled_user_prompts

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const visibleIds = modelRuns.map((mr) => mr.modelId)
    const oldIndex = visibleIds.indexOf(active.id as string)
    const newIndex = visibleIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const newVisibleIds = arrayMove(visibleIds, oldIndex, newIndex)

    // Apply new visible order to global modelOrder
    const visibleSet = new Set(visibleIds)
    const finalOrder = [...modelOrder]
    let vi = 0
    for (let i = 0; i < finalOrder.length; i++) {
      if (visibleSet.has(finalOrder[i]!)) {
        finalOrder[i] = newVisibleIds[vi++]!
      }
    }
    onReorder(finalOrder)
  }

  const allOk = modelRuns.some((mr) => mr.outcome.projects[projectName]?.status === 'ok')

  // Find llm_judgement from any ok model run for this project.
  const llmJudgement = modelRuns
    .map((mr) => mr.outcome.projects[projectName]?.results?.llm_judgement)
    .find(Boolean)

  // Single-model rubric mode: n=1 and judge returned per-dimension scores (not winner)
  const isRubricMode = llmJudgement?.some(j => j?.scores != null && j?.winner === null) ?? false
  const rubricSummary = isRubricMode && llmJudgement ? (() => {
    const valid = llmJudgement.filter(j => j?.scores != null)
    if (!valid.length) return null
    const n = valid.length
    const sum = valid.reduce(
      (acc, j) => ({
        accuracy: acc.accuracy + j!.scores!.accuracy,
        completeness: acc.completeness + j!.scores!.completeness,
        relevance_clarity: acc.relevance_clarity + j!.scores!.relevance_clarity,
        average: acc.average + (j!.average_score ?? 0),
      }),
      { accuracy: 0, completeness: 0, relevance_clarity: 0, average: 0 },
    )
    return {
      avg: Math.round((sum.average / n) * 10) / 10,
      accuracy: Math.round((sum.accuracy / n) * 10) / 10,
      completeness: Math.round((sum.completeness / n) * 10) / 10,
      relevance_clarity: Math.round((sum.relevance_clarity / n) * 10) / 10,
      count: n,
    }
  })() : null

  // Champion: model with highest primary accuracy — only meaningful with 2+ models
  const championModelId = modelRuns.length >= 2 ? (() => {
    let best = -1
    let bestId: string | null = null
    for (const { modelId, outcome } of modelRuns) {
      const run = outcome.projects[projectName]
      if (!run || run.status !== 'ok') continue
      const primary = getPrimaryAccuracy(run.scores ?? {})
      if (primary && primary.value > best) {
        best = primary.value
        bestId = modelId
      }
    }
    return bestId
  })() : null

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden animate-scale-in shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Clickable header — toggles per-question detail section */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border cursor-pointer hover:bg-accent/30 transition-colors select-none"
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-expanded={isOpen}
        aria-label={`${projectName} — ${isOpen ? '收起' : '展開'}詳細資訊`}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-md',
            allOk
              ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-muted text-muted-foreground',
          )}>
            {allOk
              ? <CheckCircle className="w-[18px] h-[18px]" />
              : <XCircle className="w-[18px] h-[18px]" />}
          </div>
          <h3 className="font-semibold text-foreground">{formatProjectName(projectName)}</h3>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0',
          )}
        />
      </div>

      {/* Always-visible model summary cards with drag-to-reorder */}
      <div className="p-4 sm:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext
            items={modelRuns.map((mr) => mr.modelId)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {modelRuns.map(({ modelId, outcome, colorIndex }, idx) => {
                const run = outcome.projects[projectName]
                if (!run) return null
                const label = outcome.spec.display_name || outcome.spec.name || modelId
                const color = modelColor(modelId, colorIndex)
                const isHidden = hiddenModelIds.has(modelId)
                return (
                  <SortableModelItem key={modelId} modelId={modelId} idx={idx}>
                    <ModelColumn
                      label={label}
                      run={run}
                      color={color}
                      isHidden={isHidden}
                      isChampion={modelId === championModelId}
                      onToggleVisibility={() => onToggleVisibility(projectName, modelId)}
                      rubricData={isRubricMode ? rubricSummary : null}
                    />
                  </SortableModelItem>
                )
              })}
            </div>
          </SortableContext>

          {/* DragOverlay: floating card that follows the cursor */}
          <DragOverlay>
            {activeId ? (() => {
              const activeRun = modelRuns.find((mr) => mr.modelId === activeId)
              if (!activeRun) return null
              const run = activeRun.outcome.projects[projectName]
              if (!run) return null
              const label = activeRun.outcome.spec.display_name || activeRun.outcome.spec.name || activeId
              const color = modelColor(activeId, activeRun.colorIndex)
              return (
                <div className="min-w-[240px] max-w-[340px] scale-105 shadow-2xl rounded-md border border-primary/30 bg-card">
                  <ModelColumn label={label} run={run} color={color} />
                </div>
              )
            })() : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* System Prompt — shown once at task level */}
      {systemPrompt && (
        <div className="mt-3 px-4 pb-1">
          <PromptBlock
            label="SYSTEM PROMPT"
            subLabel="此任務共用的系統提示"
            content={systemPrompt}
            variant="system"
            defaultOpen={false}
          />
        </div>
      )}

      {/* Collapsible per-question detail section — only visible (non-hidden) models */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <DetailSection
              modelRuns={modelRuns.filter((mr) => !hiddenModelIds.has(mr.modelId))}
              projectName={projectName}
              llmJudgement={llmJudgement}
              userPromptTemplate={userPromptTemplate}
              filledUserPrompts={filledUserPrompts}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { Trophy, Minus, Filter, Image as ImageIcon, AlertCircle, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CaseResult, RunFile } from '@/types/history'
import { IoUBars } from './IoUBars'
import { useCaseFilter, type CaseFilterType } from '@/hooks/useCaseFilter'

interface CaseInspectorProps {
  run: RunFile
  visibleModels: Set<string>
  modelColors: Map<string, string>
}

function ImageHoverPreview({ src, filename }: { src: string; filename: string }) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-pointer group"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <ImageIcon size={10} className="text-brand-primary" />
      <span className="truncate max-w-[200px] text-brand-primary hover:text-brand-primary/80 transition-colors">
        {filename}
      </span>
      {showPreview && (
        <div className="absolute z-50 bottom-full left-0 mb-2 p-1.5 rounded-md border border-platform-border/60 bg-platform-card/95 backdrop-blur-md shadow-xl shadow-black/30 animate-fade-in">
          <img
            src={src}
            alt={filename}
            className="max-w-[240px] max-h-[180px] rounded object-contain"
            loading="lazy"
          />
          <p className="text-[10px] text-platform-muted mt-1 text-center font-mono truncate">{filename}</p>
        </div>
      )}
    </span>
  )
}

const FILTER_LABELS: Record<CaseFilterType, string> = {
  all: '全部',
  pass: '通過',
  fail: '未通過',
  diff: '模型分歧',
}

function CaseFilterTabs({
  filter,
  setFilter,
  counts,
}: {
  filter: CaseFilterType
  setFilter: (f: CaseFilterType) => void
  counts: { all: number; pass: number; fail: number; diff: number }
}) {
  const tabs: CaseFilterType[] = ['all', 'pass', 'fail', 'diff']
  return (
    <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-platform-secondary border border-platform-border/50">
      <Filter size={12} className="text-platform-muted ml-2 mr-1 shrink-0" />
      {tabs.map((t) => {
        const isEmpty = counts[t] === 0
        return (
          <button
            key={t}
            type="button"
            onClick={() => !isEmpty && setFilter(t)}
            disabled={isEmpty}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200
              ${isEmpty
                ? 'opacity-40 cursor-not-allowed text-platform-muted'
                : filter === t
                  ? 'bg-platform-accent text-platform-whiteFg border border-indigo-500/30'
                  : 'text-platform-muted hover:text-platform-fg hover:bg-platform-accent/50 border border-transparent'
              }`}
          >
            {FILTER_LABELS[t]}
            <span className="ml-1 text-[10px] opacity-60">({counts[t]})</span>
          </button>
        )
      })}
    </div>
  )
}

function TextDiffCase({
  caseResult,
  visibleModels,
  modelColors,
}: {
  caseResult: CaseResult
  visibleModels: Set<string>
  modelColors: Map<string, string>
}) {
  const visibleList = Array.from(visibleModels)
  const winners = new Set(caseResult.verdict.winner_model_ids)
  const hasImages = caseResult.input.images.length > 0
  const isAllPass = caseResult.verdict.outcome === 'all_pass'
  const [isOpen, setIsOpen] = useState(!isAllPass)

  return (
    <div className="rounded-md border border-platform-border bg-platform-card p-5 shadow-sm transition-all duration-300 hover:border-platform-accent hover:shadow-md hover:-translate-y-0.5">
      {/* Clickable Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 text-[11px] font-mono text-muted-foreground cursor-pointer select-none"
      >
        <span className="text-platform-fg font-bold">{caseResult.case_id}</span>
        <VerdictBadge outcome={caseResult.verdict.outcome} />
        {hasImages && (
          <span onClick={(e) => e.stopPropagation()}>
            <ImageHoverPreview
              src={caseResult.input.images[0]!}
              filename={caseResult.input.images[0]?.split('/').pop() ?? ''}
            />
          </span>
        )}
        {caseResult.verdict.rationale && (
          <span className="flex items-center gap-1 truncate ml-auto text-platform-muted" title={caseResult.verdict.rationale}>
            <AlertCircle size={11} className="text-platform-muted/60 shrink-0" />
            <span className="italic">{caseResult.verdict.rationale}</span>
          </span>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 ml-2 text-platform-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2.5 border-t border-platform-border/40 pt-3">
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-platform-muted uppercase tracking-wider font-bold">prompt</div>
                <div className="text-xs whitespace-pre-wrap text-platform-fg/90 bg-platform-secondary rounded-md p-2.5 border border-platform-border/40">{caseResult.input.prompt}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-platform-muted uppercase tracking-wider font-bold">ground truth</div>
                <div className="text-xs whitespace-pre-wrap text-platform-whiteFg font-mono font-semibold bg-platform-bg rounded-md px-2.5 py-1.5 border border-platform-border w-fit overflow-x-auto">{caseResult.ground_truth}</div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, visibleList.length)}, minmax(0, 1fr))` }}>
                {visibleList.map((mid, idx) => {
                  const out = caseResult.model_outputs[mid]
                  const isWinner = winners.has(mid) && caseResult.verdict.outcome !== 'all_pass'
                  const safeAnswer = out?.answer ? out.answer.trim() : ''
                  const indicatorColor = modelColors.get(mid) ?? (idx === 0 ? '#3b82f6' : '#0ea5e9')
                  return (
                    <div
                      key={mid}
                      className={`rounded-md border p-3 space-y-1.5 transition-colors ${
                        isWinner ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-platform-border bg-platform-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground sticky top-0 bg-card z-10">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ background: indicatorColor }} />
                          <span className="font-bold text-platform-fg">{mid}</span>
                          {isWinner && <Trophy className="w-3 h-3 text-emerald-500" />}
                        </span>
                        {out?.score !== undefined && out?.score !== null && (
                          <span className="tabular-nums">{out.score.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="text-xs whitespace-pre-wrap text-platform-fg/90 bg-platform-bg rounded-md p-2.5 border border-platform-border/60 font-mono overflow-x-auto">{safeAnswer || <span className="text-platform-muted/40 italic">Empty response</span>}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function VerdictBadge({ outcome }: { outcome: CaseResult['verdict']['outcome'] }) {
  const map = {
    single_winner: { label: 'winner', cls: 'bg-emerald-500/20 text-emerald-400' },
    tie: { label: 'tie', cls: 'bg-amber-500/20 text-amber-400' },
    all_pass: { label: 'all-pass', cls: 'bg-sky-500/20 text-sky-400' },
  } as const
  const item = map[outcome]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${item.cls}`}>
      {outcome === 'tie' ? <Minus className="w-2.5 h-2.5" /> : null}
      {item.label}
    </span>
  )
}

export function CaseInspector({ run, visibleModels, modelColors }: CaseInspectorProps) {
  const iouThreshold = run.task_type === 'vlm_detection'
    ? (run.summary[Object.keys(run.summary)[0] ?? '']?.threshold ?? 0.5)
    : null
  const { filter, setFilter, filteredCases, counts } = useCaseFilter(run.cases, visibleModels, iouThreshold)

  if (run.task_type === 'vlm_detection') {
    const threshold = iouThreshold ?? 0.5
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <CaseFilterTabs filter={filter} setFilter={setFilter} counts={counts} />
        </div>
        <IoUBars
          cases={filteredCases}
          visibleModels={visibleModels}
          threshold={threshold ?? 0.5}
          modelColors={modelColors}
        />
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CaseFilterTabs filter={filter} setFilter={setFilter} counts={counts} />
      </div>
      {filteredCases.length === 0 && (
        <div className="text-center py-6 text-sm text-platform-muted">
          此篩選條件下無符合的 Case
        </div>
      )}
      <AnimatePresence mode="popLayout">
        {filteredCases.map((c) => (
          <motion.div
            key={c.case_id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <TextDiffCase
              caseResult={c}
              visibleModels={visibleModels}
              modelColors={modelColors}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

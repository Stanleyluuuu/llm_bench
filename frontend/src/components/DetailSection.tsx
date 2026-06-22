import { useState, useTransition, useMemo, memo } from 'react'
import { CheckCircle, XCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { modelColor } from '@/lib/model-colors'
import { scoreColor } from '@/lib/score-color'
import { AnswerRenderer } from '@/components/AnswerRenderer'
import { JsonDiff } from '@/components/JsonDiff'
import { PromptBlock } from '@/components/PromptBlock'
import { fmtScore, fmtPct } from '@/lib/format'
import type { ModelOutcome, ProjectRun } from '@/types/benchmark'

type IouBoxEntry = { iou: number; gt_bbox: number[]; pred_bbox: number[]; matched: boolean }
type IouDetailRecord = Record<string, IouBoxEntry | { _parse_error: string }>

function isParseError(v: IouBoxEntry | { _parse_error: string }): v is { _parse_error: string } {
  return '_parse_error' in v
}

function BoxComparison({ boxes, coordLabel }: { boxes: IouDetailRecord; coordLabel?: string }) {
  const entries = Object.entries(boxes).filter(([, v]) => !isParseError(v)) as [string, IouBoxEntry][]
  const errorEntries = Object.entries(boxes).filter(([, v]) => isParseError(v))
  if (!entries.length && !errorEntries.length) return null
  return (
    <div>
      {coordLabel && (
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-border/60">
            座標系：{coordLabel}
          </span>
        </div>
      )}
      {errorEntries.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorEntries.length} 筆座標解析失敗，已從分數計算中排除</span>
        </div>
      )}
      {entries.length > 0 && (
        <table className="w-full text-xs mt-1">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-normal py-1 pr-2">區域</th>
              <th className="text-left font-normal pr-2">標準答案</th>
              <th className="text-left font-normal pr-2">模型預測</th>
              <th className="text-right font-normal">IoU</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {entries.map(([key, b]) => (
              <tr key={key} className="border-t border-border/50">
                <td className="py-1.5 pr-2 text-muted-foreground">{key}</td>
                <td className="pr-2 text-foreground/80">[{b.gt_bbox.join(', ')}]</td>
                <td className="pr-2 text-foreground/80">[{b.pred_bbox.map(n => Math.round(n)).join(', ')}]</td>
                <td className="text-right">
                  <span className={cn(
                    'font-semibold tabular-nums font-mono text-xs',
                    b.matched ? 'text-emerald-600 dark:text-emerald-400'
                      : b.iou >= 0.3 ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-500 dark:text-red-400'
                  )}>
                    {(b.iou * 100).toFixed(0)}%
                  </span>
                  <div className="w-10 h-1 rounded-full bg-secondary overflow-hidden inline-block ml-1.5 align-middle">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        b.matched ? 'bg-emerald-500'
                          : b.iou >= 0.3 ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${Math.round(b.iou * 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function BoxOverlay({ imageUrl, boxes, question, coordLabel }: {
  imageUrl: string
  boxes: IouDetailRecord
  question: string
  coordLabel?: string
}) {
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const validEntries = Object.entries(boxes).filter(([, v]) => !isParseError(v)) as [string, IouBoxEntry][]

  return (
    <div className="mt-2">
      <div
        className="relative inline-block max-w-full cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
        title="點擊放大"
      >
        <img
          src={imageUrl}
          alt={question}
          className="block max-w-full rounded-md"
          style={{ width: '100%' }}
          onLoad={(e) => {
            const img = e.currentTarget
            setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
          }}
        />
        {imgSize && (
          <svg
            viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
            className="absolute inset-0 h-full w-full pointer-events-none"
          >
            {validEntries.map(([key, b]) => {
              const gtX = b.gt_bbox[0] ?? 0, gtY = b.gt_bbox[1] ?? 0
              const predX = b.pred_bbox[0] ?? 0, predY = b.pred_bbox[1] ?? 0
              const chipW = Math.max(key.length * 7 + 12, 32)
              const gtChipY = gtY >= 20 ? gtY - 18 : gtY + 4
              const predChipY = predY >= 20 ? predY - 18 : predY + 4
              return (
                <g key={key}>
                  {/* Ground truth — #00E676 螢光綠實線，外層黑色光暈 */}
                  <rect
                    x={b.gt_bbox[0]} y={b.gt_bbox[1]}
                    width={b.gt_bbox[2] - b.gt_bbox[0]} height={b.gt_bbox[3] - b.gt_bbox[1]}
                    fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="5"
                  />
                  <rect
                    x={b.gt_bbox[0]} y={b.gt_bbox[1]}
                    width={b.gt_bbox[2] - b.gt_bbox[0]} height={b.gt_bbox[3] - b.gt_bbox[1]}
                    fill="none" stroke="#00E676" strokeWidth="2.5"
                  />
                  {/* GT space label chip */}
                  <rect x={gtX} y={gtChipY} width={chipW} height={15} rx={3} fill="rgba(0,0,0,0.55)" />
                  <rect x={gtX} y={gtChipY} width={chipW} height={15} rx={3} fill="#00E676" opacity="0.92" />
                  <text x={gtX + 5} y={gtChipY + 11} fontSize="10" fontWeight="700" fill="#06281a" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {key}
                  </text>
                  {/* Prediction — #FF3D7F 粉紅虛線，外層黑色光暈 */}
                  <rect
                    x={b.pred_bbox[0]} y={b.pred_bbox[1]}
                    width={b.pred_bbox[2] - b.pred_bbox[0]} height={b.pred_bbox[3] - b.pred_bbox[1]}
                    fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="5"
                  />
                  <rect
                    x={b.pred_bbox[0]} y={b.pred_bbox[1]}
                    width={b.pred_bbox[2] - b.pred_bbox[0]} height={b.pred_bbox[3] - b.pred_bbox[1]}
                    fill="none" stroke="#FF3D7F" strokeWidth="2.5" strokeDasharray="8 5"
                  />
                  {/* Pred space label chip */}
                  <rect x={predX} y={predChipY} width={chipW} height={15} rx={3} fill="rgba(0,0,0,0.55)" />
                  <rect x={predX} y={predChipY} width={chipW} height={15} rx={3} fill="#FF3D7F" opacity="0.92" />
                  <text x={predX + 5} y={predChipY + 11} fontSize="10" fontWeight="700" fill="#fff" style={{ fontFamily: 'ui-monospace, monospace' }}>
                    {key}
                  </text>
                  {b.iou != null && (
                    <>
                      <text
                        x={b.pred_bbox[2]}
                        y={b.pred_bbox[1] > 16 ? b.pred_bbox[1] - 4 : b.pred_bbox[1] + 15}
                        fontSize="13"
                        fill="rgba(0,0,0,0.7)"
                        textAnchor="end"
                        fontWeight="800"
                        style={{ fontFamily: 'monospace' }}
                        strokeWidth="3"
                        stroke="rgba(0,0,0,0.55)"
                        paintOrder="stroke"
                      >
                        {Math.round(b.iou * 100)}%
                      </text>
                      <text
                        x={b.pred_bbox[2]}
                        y={b.pred_bbox[1] > 16 ? b.pred_bbox[1] - 4 : b.pred_bbox[1] + 15}
                        fontSize="13"
                        fill="#FF3D7F"
                        textAnchor="end"
                        fontWeight="800"
                        style={{ fontFamily: 'monospace' }}
                      >
                        {Math.round(b.iou * 100)}%
                      </text>
                    </>
                  )}
                </g>
              )
            })}
            {/* coord_label caption — bottom-right overlay with dark background */}
            {coordLabel && (() => {
              const text = coordLabel
              const fontSize = 13
              const padX = 10
              const approxTw = text.length * 7.8
              const bw = approxTw + padX * 2
              const bh = 24
              const bx = imgSize.w - bw - 8
              const by = imgSize.h - bh - 8
              return (
                <g>
                  <rect x={bx} y={by} width={bw} height={bh} rx={6} fill="rgba(0,0,0,0.6)" />
                  <text
                    x={imgSize.w - 8 - padX}
                    y={by + bh / 2 + 1}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontWeight="600"
                    fill="#fff"
                    style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' } as React.CSSProperties}
                  >
                    {text}
                  </text>
                </g>
              )
            })()}
          </svg>
        )}
      </div>
      <div className="flex gap-4 mt-1.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0 border-t-2 border-solid" style={{ borderColor: '#00E676' }} />
          標準答案
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0 border-t-2 border-dashed" style={{ borderColor: '#FF3D7F' }} />
          模型預測
        </span>
      </div>
      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-[95vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img
              src={imageUrl}
              alt={question}
              className="block max-w-full max-h-[85vh] rounded-md shadow-2xl"
            />
            {imgSize && (
              <svg
                viewBox={`0 0 ${imgSize.w} ${imgSize.h}`}
                className="absolute inset-0 h-full w-full pointer-events-none"
              >
                {validEntries.map(([key, b]) => {
                  const gtX = b.gt_bbox[0] ?? 0, gtY = b.gt_bbox[1] ?? 0
                  const predX = b.pred_bbox[0] ?? 0, predY = b.pred_bbox[1] ?? 0
                  const chipW = Math.max(key.length * 7 + 12, 32)
                  const gtChipY = gtY >= 20 ? gtY - 18 : gtY + 4
                  const predChipY = predY >= 20 ? predY - 18 : predY + 4
                  return (
                    <g key={key}>
                      <rect
                        x={b.gt_bbox[0]} y={b.gt_bbox[1]}
                        width={b.gt_bbox[2] - b.gt_bbox[0]} height={b.gt_bbox[3] - b.gt_bbox[1]}
                        fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="5"
                      />
                      <rect
                        x={b.gt_bbox[0]} y={b.gt_bbox[1]}
                        width={b.gt_bbox[2] - b.gt_bbox[0]} height={b.gt_bbox[3] - b.gt_bbox[1]}
                        fill="none" stroke="#00E676" strokeWidth="2.5"
                      />
                      <rect x={gtX} y={gtChipY} width={chipW} height={15} rx={3} fill="rgba(0,0,0,0.55)" />
                      <rect x={gtX} y={gtChipY} width={chipW} height={15} rx={3} fill="#00E676" opacity="0.92" />
                      <text x={gtX + 5} y={gtChipY + 11} fontSize="10" fontWeight="700" fill="#06281a" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {key}
                      </text>
                      <rect
                        x={b.pred_bbox[0]} y={b.pred_bbox[1]}
                        width={b.pred_bbox[2] - b.pred_bbox[0]} height={b.pred_bbox[3] - b.pred_bbox[1]}
                        fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="5"
                      />
                      <rect
                        x={b.pred_bbox[0]} y={b.pred_bbox[1]}
                        width={b.pred_bbox[2] - b.pred_bbox[0]} height={b.pred_bbox[3] - b.pred_bbox[1]}
                        fill="none" stroke="#FF3D7F" strokeWidth="2.5" strokeDasharray="8 5"
                      />
                      <rect x={predX} y={predChipY} width={chipW} height={15} rx={3} fill="rgba(0,0,0,0.55)" />
                      <rect x={predX} y={predChipY} width={chipW} height={15} rx={3} fill="#FF3D7F" opacity="0.92" />
                      <text x={predX + 5} y={predChipY + 11} fontSize="10" fontWeight="700" fill="#fff" style={{ fontFamily: 'ui-monospace, monospace' }}>
                        {key}
                      </text>
                      {b.iou != null && (
                        <text
                          x={b.pred_bbox[2]}
                          y={b.pred_bbox[1] > 16 ? b.pred_bbox[1] - 4 : b.pred_bbox[1] + 15}
                          fontSize="13" fill="#FF3D7F" textAnchor="end" fontWeight="800"
                          style={{ fontFamily: 'monospace' }}
                          stroke="rgba(0,0,0,0.55)" strokeWidth="3" paintOrder="stroke"
                        >
                          {Math.round(b.iou * 100)}%
                        </text>
                      )}
                    </g>
                  )
                })}
                {coordLabel && (() => {
                  const text = coordLabel
                  const fontSize = 13
                  const padX = 10
                  const approxTw = text.length * 7.8
                  const bw = approxTw + padX * 2
                  const bh = 24
                  const bx = imgSize.w - bw - 8
                  const by = imgSize.h - bh - 8
                  return (
                    <g>
                      <rect x={bx} y={by} width={bw} height={bh} rx={6} fill="rgba(0,0,0,0.6)" />
                      <text
                        x={imgSize.w - 8 - padX}
                        y={by + bh / 2 + 1}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize={fontSize}
                        fontWeight="600"
                        fill="#fff"
                        style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' } as React.CSSProperties}
                      >
                        {text}
                      </text>
                    </g>
                  )
                })()}
              </svg>
            )}
            <button
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-lg"
              onClick={() => setLightboxOpen(false)}
              aria-label="關閉"
            >×</button>
          </div>
        </div>
      )}
    </div>
  )
}

function isAnswerCorrect(answer: string, groundTruth: string): boolean {
  if (!answer || !groundTruth) return false
  const a = typeof answer === 'string' ? answer : String(answer)
  const g = typeof groundTruth === 'string' ? groundTruth : String(groundTruth)
  return a === g
}

function isJsonString(text: string): boolean {
  if (!text) return false
  const t = text.trim()
  if (t.length > 1 && (t.startsWith('{') || t.startsWith('['))) {
    try { JSON.parse(t); return true } catch { /* not json */ }
  }
  return false
}

// ── Char-level diff for plain-text failures (TASK 1b) ──────────────────────
type DiffPart = { ch: string; type: 'equal' | 'add' | 'remove' }

function charDiff(expected: string, actual: string): DiffPart[] {
  const m = expected.length, n = actual.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = expected[i - 1] === actual[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
  const out: DiffPart[] = []
  let i = m, j = n
  while (i > 0 && j > 0) {
    if (expected[i - 1] === actual[j - 1]) { out.unshift({ ch: actual[j - 1], type: 'equal' }); i--; j-- }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { out.unshift({ ch: expected[i - 1], type: 'remove' }); i-- }
    else { out.unshift({ ch: actual[j - 1], type: 'add' }); j-- }
  }
  while (i > 0) { out.unshift({ ch: expected[i - 1], type: 'remove' }); i-- }
  while (j > 0) { out.unshift({ ch: actual[j - 1], type: 'add' }); j-- }
  return out
}

function InlineDiff({ expected, actual }: { expected: string; actual: string }) {
  const parts = charDiff(expected, actual)
  return (
    <div className="font-mono text-sm mt-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">模型回答</span>
        <span className="break-all leading-relaxed">
          {parts.filter(p => p.type !== 'remove').map((p, i) => (
            <span
              key={i}
              className={p.type === 'add'
                ? 'rounded bg-red-100/70 dark:bg-red-900/25 text-red-700 dark:text-red-300 px-0.5 border border-red-200 dark:border-red-700/60 underline underline-offset-2'
                : 'text-foreground'}
            >
              {p.ch}
            </span>
          ))}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">標準答案</span>
        <span className="break-all leading-relaxed">
          {parts.filter(p => p.type !== 'add').map((p, i) => (
            <span
              key={i}
              className={p.type === 'remove'
                ? 'rounded bg-emerald-100/70 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300 px-0.5 border border-emerald-200 dark:border-emerald-700/60 line-through'
                : 'text-foreground'}
            >
              {p.ch}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

interface JudgeEntry {
  winner: string | null
  outcome?: 'single_winner' | 'tie' | 'all_pass' | 'needs_review'
  winner_model_ids?: string[]
  reason: string | null
  scores?: { accuracy: number; completeness: number; relevance_clarity: number }
  average_score?: number
}

type CaseVerdict = 'winner' | 'pass' | 'fail' | 'tie' | 'needs_review' | null

// ── Collapsible judge reasoning block ─────────────────────────────────────
function CollapsibleReason({ reason }: { reason: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
        {open ? '收起評審理由' : '展開評審理由'}
      </button>
      {open && (
        <div className="mt-1.5 text-sm text-foreground leading-relaxed pl-3.5 border-l-2 border-border">
          {reason}
        </div>
      )}
    </div>
  )
}

// ── Per-model card (needs own useState for raw/resized toggle) ─────────────

type ModelItem = {
  label: string
  results: ProjectRun['results'] | undefined
  scores: Record<string, number | number[]> | undefined
  color: string
  error: string | undefined
}

interface PerModelCardProps {
  m: ModelItem
  idx: number
  groundTruth: string
  verdict: CaseVerdict
  isSingleModelMode: boolean
  question: string
  projectName: string
}

const PerModelCard = memo(function PerModelCard({
  m,
  idx,
  groundTruth,
  verdict,
  isSingleModelMode,
  question,
  projectName,
}: PerModelCardProps) {
  const [showRaw, setShowRaw] = useState(false)
  const [diffOpen, setDiffOpen] = useState(false)

  const rawAnswer = m.results?.answer?.[idx]
  const answer =
    rawAnswer == null ? 'N/A' : typeof rawAnswer === 'string' ? rawAnswer : JSON.stringify(rawAnswer)
  const resized = m.results?.resized_answer?.[idx]
  const resizeSize = m.results?.resize_size
  const hasResize = !!(resizeSize && resized)

  // Primary display: resized answer (already back in original coord space) if available
  const displayAnswer = hasResize ? resized! : answer
  const answerForDiff = displayAnswer

  // ── Per-sample score (Task 4) ───────────────────────────────────────────
  const hasIouDetail = (() => {
    const d = m.results?.per_sample_iou_detail?.[idx]
    return d != null && Object.keys(d).length > 0
  })()
  const perSampleScore: { value: number; label: string; outOf?: number } | null =
    hasIouDetail || isSingleModelMode
      ? null
      : (() => {
          const scores = m.scores ?? {}
          const psa = scores['per_sample_accuracy']
          if (Array.isArray(psa) && psa.length > idx && psa[idx] != null) {
            return { value: psa[idx] as number, label: '準確率' }
          }
          for (const key of Object.keys(scores)) {
            if (key.startsWith('per_sample_') && key.endsWith('_answer_correctness')) {
              const arr = scores[key]
              if (Array.isArray(arr) && arr.length > idx && arr[idx] != null) {
                return { value: arr[idx] as number, label: '答案正確性' }
              }
            }
          }
          const avgScore = scores['avg_score']
          if (typeof avgScore === 'number') return null // aggregate only, skip
          return null
        })()

  return (
    <div
      className={cn(
        'relative p-3 rounded-md transition-colors',
        m.error
          ? 'border border-destructive/30 bg-destructive/5'
          : verdict === 'winner'
            ? 'border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
            : verdict === 'fail'
              ? 'border border-border border-l-4 border-l-red-400 dark:border-l-red-500 bg-red-50/30 dark:bg-red-950/10'
              : verdict === 'needs_review'
                ? 'border border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10'
                : 'border border-border bg-card',
      )}
    >
      {/* Task 2: 🏆 WINNER badge */}
      {verdict === 'winner' && (
        <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm z-10 select-none">
          🏆 WINNER
        </span>
      )}
      {/* Task 7: needs_review badge */}
      {verdict === 'needs_review' && (
        <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm z-10 select-none">
          ⚠ 待審
        </span>
      )}

      {/* Model header */}
      <div className="flex items-center gap-2 mb-2">
        {m.error ? (
          <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" aria-label="評估失敗" />
        ) : verdict === 'winner' ? (
          <span className="text-sm leading-none flex-shrink-0" aria-label="Winner">🏆</span>
        ) : verdict === 'pass' || verdict === 'tie' ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-label="通過" />
        ) : verdict === 'fail' ? (
          <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" aria-label="未通過" />
        ) : verdict === 'needs_review' ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" aria-label="待審" />
        ) : null}
        <span className="text-xs font-bold font-mono text-foreground truncate">{m.label}</span>
        {/* Task 4: per-sample score */}
        {perSampleScore && (
          <span className={cn(
            'ml-auto text-xs font-mono font-semibold tabular-nums flex-shrink-0',
            perSampleScore.value >= 0.85 ? 'text-emerald-600 dark:text-emerald-400'
              : perSampleScore.value >= 0.5 ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400',
          )}>
            {fmtPct(perSampleScore.value)}
            <span className="font-normal text-muted-foreground ml-0.5 text-[10px]">{perSampleScore.label}</span>
          </span>
        )}
      </div>

      {m.error ? (
        <pre className="font-mono text-[11px] leading-relaxed text-destructive whitespace-pre-wrap break-all scrollbar-thin max-h-48 overflow-y-auto">
          {m.error}
        </pre>
      ) : (
        <div className="flex flex-col h-full">
          {/* Model answer */}
          <div className="mt-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary rounded px-1 inline-block">
                模型回答
              </span>
              {m.results?.coord_label && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent text-accent-foreground border border-border/60">
                  {m.results.coord_label}
                </span>
              )}
              {hasResize && (
                <button
                  type="button"
                  onClick={() => setShowRaw((v) => !v)}
                  className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  {showRaw ? '換算後' : '原始'}
                </button>
              )}
            </div>
            <AnswerRenderer content={displayAnswer} />
            {hasResize && showRaw && (
              <div className="mt-1.5 pt-1.5 border-t border-dashed border-border/50">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary rounded px-1 mb-1 inline-block">
                  原始輸出
                </span>
                <AnswerRenderer content={answer} />
              </div>
            )}
            {hasResize && !showRaw && (
              <div style={{ minHeight: 28 }}>
                <p className="text-[10px] italic text-muted-foreground mt-1 pt-1 border-t border-dashed border-border/30">
                  Resized {resizeSize![0]}×{resizeSize![1]}（已換算回原圖座標）
                </p>
              </div>
            )}
            {!hasResize && <div style={{ minHeight: 28 }} />}
          </div>

          {/* Task 3: Collapsible diff block — shown whenever GT available, not just on failure */}
          {groundTruth && groundTruth !== '—' && answer !== 'N/A' && (() => {
            if (hasIouDetail) return null
            const canShowJson = isJsonString(answerForDiff) && isJsonString(groundTruth)
            const canShowInline = !isJsonString(answerForDiff)
            if (!canShowJson && !canShowInline) return null
            return (
              <div className="mt-2 pt-1 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setDiffOpen(v => !v)}
                  className="flex items-center gap-1.5 mb-1 group w-full text-left"
                  aria-expanded={diffOpen}
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary rounded px-1 inline-block">
                    差異比對
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 italic hidden sm:inline">
                    字面比對，僅供參考
                  </span>
                  <ChevronDown className={cn(
                    'w-3 h-3 text-muted-foreground/60 ml-1 transition-transform flex-shrink-0',
                    diffOpen && 'rotate-180',
                  )} />
                </button>
                {diffOpen && (
                  canShowJson
                    ? <JsonDiff expected={groundTruth} actual={answerForDiff} changesOnly />
                    : <InlineDiff expected={groundTruth} actual={answerForDiff} />
                )}
              </div>
            )
          })()}

          {/* IoU box comparison for locate tasks */}
          {(() => {
            const iouDetail = m.results?.per_sample_iou_detail?.[idx]
            const hasContent = iouDetail && Object.keys(iouDetail).length > 0
            if (!hasContent) return null
            const coordLabel = m.results?.coord_label
            // Build image URL from stored image_path (full abs path → extract relative path after dataset/)
            const rawImgPath = m.results?.image_path?.[idx] ?? null
            const imageRelPath = rawImgPath
              ? rawImgPath.split('/dataset/').slice(-1)[0] ?? null
              : null
            const imageUrl = imageRelPath
              ? `/api/projects/${encodeURIComponent(projectName)}/images/${imageRelPath.split('/').map(encodeURIComponent).join('/')}`
              : null
            return (
              <div className="mt-2 pt-1 border-t border-border/50">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary rounded px-1 mb-1 inline-block">
                  框位比對
                </span>
                <BoxComparison
                  boxes={iouDetail as IouDetailRecord}
                  coordLabel={coordLabel}
                />
                {imageUrl && (
                  <BoxOverlay
                    imageUrl={imageUrl}
                    boxes={iouDetail as IouDetailRecord}
                    question={question}
                    coordLabel={coordLabel}
                  />
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
})

// ── DetailSection ──────────────────────────────────────────────────────────

interface DetailSectionProps {
  modelRuns: Array<{ modelId: string; outcome: ModelOutcome; colorIndex: number }>
  projectName: string
  llmJudgement?: JudgeEntry[]
  userPromptTemplate?: string | null
  filledUserPrompts?: string[]
}

export function DetailSection({
  modelRuns,
  projectName,
  llmJudgement,
  userPromptTemplate,
  filledUserPrompts,
}: DetailSectionProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'anyfail' | 'allfail'>('all')
  const [, startFilterTransition] = useTransition()

  // Use the first ok run's results as the canonical question/ground_truth source.
  const firstOkRun = modelRuns.find(
    (mr) => mr.outcome.projects[projectName]?.status === 'ok' && mr.outcome.projects[projectName]?.results?.question?.length,
  )
  const firstResults = firstOkRun?.outcome.projects[projectName]?.results
  if (!firstResults?.question?.length) return null

  const models = modelRuns
    .filter((mr) => {
      const status = mr.outcome.projects[projectName]?.status
      return status === 'ok' || status === 'error'
    })
    .map(({ modelId, outcome, colorIndex }) => {
      const run = outcome.projects[projectName]
      return {
        label: outcome.spec.display_name || outcome.spec.name || modelId,
        results: run?.results,
        scores: run?.scores,
        color: modelColor(modelId, colorIndex),
        error: run?.status === 'error' ? (run.error ?? '推理失敗') : undefined,
      }
    })

  // Rubric mode: single-model LLM judge with per-dimension scores (no winner)
  const isSingleModelMode = llmJudgement?.some(j => j?.scores != null && j?.winner === null) ?? false

  // Determine pass/fail for a model result at a given sample index.
  // Single source of truth — used by filter, per-row status, and diff rendering.
  function isPassed(m: typeof models[number], idx: number): boolean {
    const rawA = m.results?.answer?.[idx]
    const answer = rawA == null ? 'N/A' : typeof rawA === 'string' ? rawA : JSON.stringify(rawA)
    const rawGt = firstResults!.ground_truth?.[idx]
    const groundTruth = rawGt == null ? '' : typeof rawGt === 'string' ? rawGt : JSON.stringify(rawGt)
    // Prefer per_sample_accuracy (exact_match / iou scoring)
    const perSampleAccuracy = m.scores?.per_sample_accuracy
    if (Array.isArray(perSampleAccuracy)) {
      return (perSampleAccuracy[idx] ?? 0) > 0
    }
    // Check per-sample RAGAS answer_correctness (from OutputParser scoring)
    // These are floats 0..1; treat >= 0.5 as correct
    if (m.scores) {
      for (const key of Object.keys(m.scores)) {
        if (key.endsWith('_answer_correctness') && key.startsWith('per_sample_')) {
          const arr = m.scores[key]
          if (Array.isArray(arr)) return (arr[idx] ?? 0) >= 0.5
        }
      }
    }
    return isAnswerCorrect(answer, groundTruth)
  }

  // Task 1+2+7: verdict derived solely from judge outcome, never literal equality
  function getCaseVerdict(
    m: typeof models[number],
    caseIdx: number,
    judgeEntry: JudgeEntry | undefined,
    gt: string,
  ): CaseVerdict {
    if (m.error) return null

    // Task 7: judge returned unparseable / invalid result
    if (judgeEntry?.outcome === 'needs_review') return 'needs_review'

    // Task 2/3/4: tie declared by judge or injected by frontend
    if (judgeEntry?.outcome === 'tie' || judgeEntry?.outcome === 'all_pass') return 'pass'

    // Multi-model LLM judge with explicit winner
    if (judgeEntry?.outcome === 'single_winner' || judgeEntry?.winner != null) {
      const winnerIds = (judgeEntry?.winner_model_ids?.length ?? 0) > 0
        ? judgeEntry!.winner_model_ids!
        : judgeEntry?.winner ? [judgeEntry.winner] : []
      if (winnerIds.includes(m.label)) return 'winner'
      // Task 1: non-winners default to 'pass'; judge must explicitly flag fail via judgedFailModelIds
      return 'pass'
    }
    // Single-model rubric mode: use average score threshold
    if (judgeEntry?.scores != null) {
      const avg = judgeEntry.average_score ?? 0
      return avg >= 3.0 ? 'pass' : 'fail'
    }
    // Ground truth comparison only (no judge)
    if (gt) return isPassed(m, caseIdx) ? 'pass' : 'fail'
    // Open-ended task — no verdict
    return null
  }

  const totalRows = firstResults.question.length
  const anyFailCount = firstResults.question.filter((_, idx) =>
    models.some((m) => !isPassed(m, idx)),
  ).length
  const visibleIndices = useMemo(() => firstResults!.question
    .map((_, idx) => {
      const results = models.map((m) => isPassed(m, idx))
      const anyFail = results.some((r) => !r)
      const allFail = results.every((r) => !r)
      if (filterMode === 'anyfail') return { idx, hidden: !anyFail }
      if (filterMode === 'allfail') return { idx, hidden: !allFail }
      return { idx, hidden: false }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterMode, firstResults, models.length],
  )
  const hiddenCount = visibleIndices.filter((r) => r.hidden).length

  return (
    <div className="border-t border-border bg-slate-50/80 dark:bg-slate-900/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          評估詳情 — 共 {totalRows} 筆{filterMode !== 'all' && hiddenCount > 0 ? `（顯示 ${totalRows - hiddenCount} 筆）` : ''}
        </h3>
        {models.length > 1 && (() => {
          const FILTERS = [
            { key: 'all', label: '全部案例' },
            { key: 'anyfail', label: '有模型答錯' },
            { key: 'allfail', label: '全部答錯' },
          ] as const
          return (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{anyFailCount}/{totalRows} 題有模型答錯</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => startFilterTransition(() => setFilterMode(key))}
                    className={[
                      'text-xs font-mono px-2.5 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      filterMode === key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
      <div className="space-y-8 pt-2">
        {visibleIndices.map(({ idx, hidden }) => {
          if (hidden) return null
          const question = firstResults!.question[idx]!

          // Shared ground truth for this sample
          const rawGt = firstResults!.ground_truth?.[idx]
          const groundTruth =
            rawGt == null ? '' : typeof rawGt === 'string' ? rawGt : JSON.stringify(rawGt)

          // Determine if this case has an associated image (VLM task)
          // Use image_path from results (full absolute path) if present, else fall back to question heuristic
          const rawImgAbs = firstResults!.image_path?.[idx] ?? null
          const imageFilename = rawImgAbs ? (rawImgAbs.split('/').pop() ?? null) : null
          const isImageQuestion = imageFilename != null

          // Construct final user prompt content for display
          const userPromptContent =
            filledUserPrompts?.[idx] ??
            (isImageQuestion
              ? (userPromptTemplate ?? '(無文字指令)')
              : userPromptTemplate
                ? `${userPromptTemplate}\n${question}`
                : question)

          return (
            <div
              key={idx}
              className="relative bg-card rounded-md border border-slate-200 dark:border-border p-5 pt-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-slide-up"
              style={{ animationDelay: `${Math.min(idx * 18, 280)}ms` }}
            >
              {/* Anchor badge — floats above the card border */}
              <div className="absolute -top-3 left-4 flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-primary text-primary-foreground text-[11px] font-mono font-bold rounded-full shadow-sm tracking-wider">
                  CASE #{String(idx + 1).padStart(2, '0')}
                </span>
                {isImageQuestion && imageFilename && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60 shadow-sm">
                    {imageFilename}
                  </span>
                )}
                {/* Task 5: tie badge — shown when judge or frontend detects tie */}
                {(() => {
                  const entry = llmJudgement?.[idx]
                  const isFrontendTie = models.length > 1 && (() => {
                    const norm = (s: string) =>
                      s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?；。，]/g, '')
                    const answers = models
                      .map(mm => {
                        const raw = mm.results?.answer?.[idx]
                        return raw == null ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw)
                      })
                      .filter(a => a !== '' && a !== 'N/A')
                    return answers.length >= 2 && new Set(answers.map(norm)).size === 1
                  })()
                  if (isFrontendTie || entry?.outcome === 'tie' || entry?.outcome === 'all_pass') {
                    return (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-sm select-none">
                        🤝 平手
                      </span>
                    )
                  }
                  return null
                })()}
                {isSingleModelMode &&
                  llmJudgement?.[idx]?.average_score != null &&
                  (() => {
                    const avg = llmJudgement[idx]!.average_score!
                    const c = scoreColor(avg)
                    return (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[11px] font-mono font-medium tabular-nums shadow-sm border',
                          c.fg,
                          c.soft,
                        )}
                      >
                        {avg.toFixed(1)} / 5
                      </span>
                    )
                  })()}
              </div>

              {/* USER PROMPT — shared text instruction sent to the model */}
              <div className="mb-2">
                <PromptBlock
                  label="USER PROMPT"
                  subLabel="送給模型的題目指令"
                  content={userPromptContent}
                  variant="user"
                  defaultOpen={false}
                />
              </div>

              {/* Multi-column grid: GT leftmost sticky col + model cols (16.1) */}
              <div
                className="testcase-grid"
                style={{
                  gridTemplateColumns: groundTruth
                    ? `0.9fr repeat(${models.length}, minmax(0, 1fr))`
                    : `repeat(auto-fit, minmax(min(420px, 100%), 1fr))`,
                }}
              >
                {/* Ground Truth column — leftmost, sticky */}
                {groundTruth && (
                  <div className="testcase-grid__gt-col">
                    <div className="border border-emerald-200 dark:border-emerald-800 border-l-4 border-l-emerald-400 dark:border-l-emerald-500 rounded-r-md bg-emerald-50/50 dark:bg-emerald-950/20 p-3 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                          標準答案
                        </span>
                        <span className="text-[11px] text-muted-foreground">共用 ground truth</span>
                      </div>
                      <AnswerRenderer content={groundTruth} />
                    </div>
                  </div>
                )}

                {models.map((m) => {
                  const rawJudgeEntry = llmJudgement?.[idx] ?? undefined
                  // Task 4: frontend tie-detection fallback — if all model answers normalise to the same
                  // string, force outcome=all_pass regardless of what the judge returned
                  const isCaseFrontendTie = models.length > 1 && (() => {
                    const norm = (s: string) =>
                      s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?；。，]/g, '')
                    const answers = models
                      .map(mm => {
                        const raw = mm.results?.answer?.[idx]
                        return raw == null ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw)
                      })
                      .filter(a => a !== '' && a !== 'N/A')
                    if (answers.length < 2) return false
                    return new Set(answers.map(norm)).size === 1
                  })()
                  const judgeEntry: JudgeEntry | undefined = isCaseFrontendTie
                    ? { ...(rawJudgeEntry ?? { winner: null, reason: null }), outcome: 'all_pass', winner_model_ids: [] }
                    : rawJudgeEntry
                  const verdict = getCaseVerdict(m, idx, judgeEntry, groundTruth)
                  return (
                    <PerModelCard
                      key={m.label}
                      m={m}
                      idx={idx}
                      groundTruth={groundTruth}
                      verdict={verdict}
                      isSingleModelMode={isSingleModelMode}
                      question={question}
                      projectName={projectName}
                    />
                  )
                })}
              </div>

            {/* Task 2 + 5 + 7: Judge result callout — with tie and needs_review support */}
            {llmJudgement?.[idx] && (() => {
              const rawEntry = llmJudgement[idx]!
              // Apply frontend tie override here too so callout text is consistent
              const isFrontendTie = models.length > 1 && (() => {
                const norm = (s: string) =>
                  s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,!?；。，]/g, '')
                const answers = models
                  .map(mm => {
                    const raw = mm.results?.answer?.[idx]
                    return raw == null ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw)
                  })
                  .filter(a => a !== '' && a !== 'N/A')
                return answers.length >= 2 && new Set(answers.map(norm)).size === 1
              })()
              const entry: JudgeEntry = isFrontendTie
                ? { ...rawEntry, outcome: 'all_pass', winner_model_ids: [] }
                : rawEntry
              const isSingleModel = entry.winner === null && !!entry.scores
              const isTie = entry.outcome === 'tie' || entry.outcome === 'all_pass'
              const isNeedsReview = entry.outcome === 'needs_review'
              return (
                <div className={cn(
                  'mt-3 border rounded-md p-3 space-y-2',
                  isTie
                    ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800'
                    : isNeedsReview
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                      : entry.winner
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-card border-border',
                )}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">LLM 評估結果</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/60 font-mono text-muted-foreground">
                      評審方式：LLM Judge
                    </span>
                  </div>

                  {/* Task 7: needs_review state */}
                  {isNeedsReview && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                        評審結果無效，需人工複審
                      </span>
                    </div>
                  )}

                  {/* Task 5: tie state */}
                  {isTie && !isNeedsReview && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg leading-none" aria-hidden>🤝</span>
                      <span className="font-semibold text-sm text-sky-700 dark:text-sky-300">
                        {entry.outcome === 'all_pass'
                          ? '本題平手：所有模型答案一致且皆達標'
                          : '本題平手：所有模型品質相當'}
                      </span>
                    </div>
                  )}

                  {isSingleModel ? (
                    /* ── n=1 單模型：分數展示 ── */
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        {([
                          { key: 'accuracy' as const, label: '準確性' },
                          { key: 'completeness' as const, label: '完整性' },
                          { key: 'relevance_clarity' as const, label: '流暢度' },
                        ] as const).map(({ key, label }) => {
                          const score = entry.scores![key]
                          const pct = (score / 5) * 100
                          const color =
                            score >= 4.25 ? 'bg-emerald-500' :
                            score >= 2.0 ? 'bg-amber-500' : 'bg-red-500'
                          return (
                            <div key={key} className="flex flex-col gap-0.5 min-w-[80px]">
                              <span className="text-xs text-muted-foreground">{label}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-mono text-foreground w-4 text-right">{score}</span>
                              </div>
                            </div>
                          )
                        })}
                        {entry.average_score !== undefined && (
                          <div className="ml-auto flex items-baseline gap-1">
                            <span className="text-xs text-muted-foreground">平均分</span>
                            <span className="text-lg font-bold font-mono text-primary leading-none">
                              {fmtScore(entry.average_score)}
                            </span>
                            <span className="text-xs text-muted-foreground">/5</span>
                          </div>
                        )}
                      </div>
                      {entry.reason && (() => {
                        const c = scoreColor(entry.average_score ?? 3)
                        return (
                          <div className={cn('rounded-md border-l-4 p-3 mt-1', c.soft, c.border)}>
                            <span className={cn('text-xs font-medium', c.fg)}>AI 評語</span>
                            <p className="mt-1 text-sm leading-relaxed text-foreground">{entry.reason}</p>
                          </div>
                        )
                      })()}
                    </>
                  ) : !isTie && !isNeedsReview ? (
                    /* ── n>1 多模型：勝出者 callout ── */
                    <>
                      {entry.winner && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg leading-none" aria-hidden>🏆</span>
                          <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">
                            {entry.winner}
                          </span>
                          <span className="text-xs text-muted-foreground">勝出此題</span>
                        </div>
                      )}
                      {entry.reason && <CollapsibleReason reason={entry.reason} />}
                    </>
                  ) : (
                    /* tie or needs_review — reason still shown if present */
                    entry.reason && !isNeedsReview
                      ? <CollapsibleReason reason={entry.reason} />
                      : null
                  )}
                </div>
              )
            })()}
            </div>
          )
        })}
      </div>
    </div>
  )
}

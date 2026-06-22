import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import type { CaseResult } from '@/types/history'

interface IoUBarsProps {
  cases: CaseResult[]
  visibleModels: Set<string>
  threshold: number
  modelColors: Map<string, string>
}

function ImageHoverBadge({ images }: { images: string[] }) {
  const [showPreview, setShowPreview] = useState(false)
  const src = images[0]
  const filename = src?.split('/').pop() ?? ''
  if (!src) return null

  return (
    <span
      className="relative inline-flex items-center gap-1 cursor-pointer"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
    >
      <ImageIcon size={10} className="text-brand-primary" />
      <span className="truncate max-w-[200px] text-brand-primary hover:text-brand-primary/80 transition-colors text-[11px]">
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

/** Visual encoding:
 *  - bar width = IoU value (0..1)
 *  - green: matched (IoU >= threshold)
 *  - amber: 0.7×threshold <= IoU < threshold (marginal)
 *  - red:   IoU below 0.7×threshold (clearly failed)
 *  - parse error: hashed grey block
 */
function categoryColor(iou: number | null, threshold: number): string {
  if (iou === null) return 'bg-muted-foreground/30'
  if (iou >= threshold) return 'bg-emerald-500'
  if (iou >= threshold * 0.7) return 'bg-amber-500'
  return 'bg-red-500'
}

export function IoUBars({ cases, visibleModels, threshold, modelColors }: IoUBarsProps) {
  const visibleModelList = Array.from(visibleModels)
  if (visibleModelList.length === 0) {
    return <div className="text-xs text-muted-foreground">請至少勾選一個模型</div>
  }
  const marginalLow = threshold * 0.7
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-muted-foreground leading-relaxed">
        每條 bar = 該模型在這一題的 IoU（0–1，越長越準）；虛線 = 通過門檻（{threshold.toFixed(2)}）；上方卡片數字 = 各題 IoU 的平均（例：(0.82 + 0.91 + 0.65) / 3 = 0.793）。
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-emerald-500" />通過 (≥{threshold.toFixed(2)})
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-amber-500" />勉強 ({marginalLow.toFixed(2)}–{threshold.toFixed(2)})
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-red-500" />未過 (&lt;{marginalLow.toFixed(2)})
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-4 border-t border-dashed border-primary/60" />門檻 {threshold.toFixed(2)}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-muted-foreground/30" />無資料
        </span>
      </div>

      {cases.map((c) => (
        <div key={c.case_id} className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span className="text-foreground/70">{c.case_id}</span>
            {c.input.images.length > 0 && (
              <ImageHoverBadge images={c.input.images} />
            )}
          </div>
          {visibleModelList.map((mid) => {
            const out = c.model_outputs[mid]
            const iou = out?.score ?? null
            const widthPct = iou !== null ? Math.max(2, Math.round(iou * 100)) : 100
            const color = modelColors.get(mid) ?? '#94a3b8'
            return (
              <div key={mid} className="flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-3 rounded-sm shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[11px] font-mono w-28 truncate shrink-0" title={mid}>{mid}</span>
                <div className="relative flex-1 h-3 bg-muted/40 rounded overflow-hidden">
                  {/* Threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 border-l border-dashed border-primary/60"
                    style={{ left: `${threshold * 100}%` }}
                    title={`threshold ${threshold.toFixed(2)}`}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full ${categoryColor(iou, threshold)} ${iou === null ? 'bg-stripes' : ''}`}
                  />
                </div>
                <span className="text-[11px] font-mono w-12 text-right tabular-nums">
                  {iou !== null ? iou.toFixed(3) : '—'}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

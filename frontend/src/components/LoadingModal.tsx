import { useEffect, useState } from 'react'
import type { JobProgress, JobStage } from '@/types/judge'

// Spinner + stage-msg styles live in index.css

interface LoadingModalProps {
  open: boolean
  stage?: JobStage
  progress?: JobProgress | null
  currentModel?: string
  currentProject?: string
}

const STAGE_MESSAGES: Record<NonNullable<JobStage>, string[]> = {
  preflight: ['正在確認模型連線…', '確認服務可達性…'],
  inference: ['模型正在回答問題…', '等待模型推理完成…', '收集模型輸出中…'],
  scoring: ['正在跑 RAGAS 比對…', '計算語意相似度…', '評估答案一致性…'],
  project_done: ['專案評估完成！', '整理最終結果中…'],
}

const FALLBACK_MESSAGES = ['評估進行中…', '請稍候，系統正在處理…', '分析模型效能中…']

const STAGE_ICONS: Record<NonNullable<JobStage>, string> = {
  preflight: '🔗',
  inference: '🤖',
  scoring:   '📊',
  project_done: '✅',
}

export function LoadingModal({ open, stage, progress, currentModel, currentProject }: LoadingModalProps) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const messages = stage ? (STAGE_MESSAGES[stage] ?? FALLBACK_MESSAGES) : FALLBACK_MESSAGES
  const currentMsg = messages[msgIndex % messages.length]!

  // Cycle messages every 3 s
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => {
      setMsgIndex((i) => i + 1)
      setAnimKey((k) => k + 1)
    }, 3000)
    return () => clearInterval(id)
  }, [open])

  // Track elapsed seconds from when modal opens
  useEffect(() => {
    if (!open) { setElapsed(0); return }
    const start = Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [open])

  // Reset message index when stage changes so the first message shows immediately
  useEffect(() => {
    setMsgIndex(0)
    setAnimKey((k) => k + 1)
  }, [stage])

  if (!open) return null

  // Estimate time remaining
  const eta =
    progress && progress.total > 0 && progress.completed > 0 && elapsed > 0
      ? Math.max(0, Math.round((elapsed / progress.completed) * (progress.total - progress.completed)))
      : null

  function formatEta(s: number): string {
    if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`
    return `${s}s`
  }

  const stageLabel: Record<NonNullable<JobStage>, string> = {
    preflight: '連線確認',
    inference: '模型推理',
    scoring: 'RAGAS 評分',
    project_done: '完成',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="評估進行中"
      aria-live="polite"
      aria-describedby="loading-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-card border border-border rounded-md p-8 flex flex-col items-center gap-5 animate-scale-in w-[min(92vw,400px)] max-w-sm shadow-2xl ring-1 ring-border/50">
        {/* Circular progress with ripple */}
        <div aria-hidden="true" className="relative flex items-center justify-center">
          {progress && progress.total > 0 ? (
            (() => {
              const pct = Math.round((progress.completed / progress.total) * 100)
              const r = 42
              const circumference = 2 * Math.PI * r
              const offset = circumference - (pct / 100) * circumference
              return (
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Outer ripple — animate-ping */}
                  <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping [animation-duration:1.8s]" />
                  {/* Mid glow */}
                  <span className="absolute inset-2 rounded-full bg-primary/8 animate-pulse" />
                  <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r={r} fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="6" />
                    <circle
                      cx="48" cy="48" r={r} fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
                    />
                  </svg>
                  <span className="relative z-10 text-lg font-black font-mono text-primary">{pct}%</span>
                </div>
              )
            })()
          ) : (
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Ripple behind spinner */}
              <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping [animation-duration:1.8s]" />
              <div className="sp-container relative z-10">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <div className="text-center w-full">
          <h3 className="text-foreground font-semibold mb-1 tracking-tight">
            {stage === 'project_done' ? '🎉 評估完成！' : '評估進行中'}
          </h3>

          {/* Stage badge */}
          {stage && (
            <div className="flex flex-col items-center gap-1 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {stage !== 'project_done' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
                <span>{STAGE_ICONS[stage]}</span>
                {stageLabel[stage]}
              </span>
              {(currentProject || currentModel) && (
                <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[240px]">
                  {currentModel && <span className="text-foreground/80 font-semibold">{currentModel}</span>}
                  {currentModel && currentProject && <span> · </span>}
                  {currentProject}
                  {progress && progress.total > 0 && (
                    <span className="text-muted-foreground/70"> ({progress.completed}/{progress.total})</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Dynamic status message */}
          <p
            key={animKey}
            className="text-muted-foreground text-sm stage-msg"
            id="loading-modal-desc"
          >
            {currentMsg}
          </p>

          {/* Progress bar */}
          {progress && progress.total > 0 && (
            <div className="mt-4 w-full">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">進度</span>
                <span className="text-xs font-mono font-medium text-foreground tabular-nums">
                  {progress.completed} / {progress.total} 完成
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full progress-shimmer transition-[width] duration-700 ease-out"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
              {eta !== null && (
                <p className="text-xs text-muted-foreground font-mono mt-1 text-right tabular-nums">
                  預計剩餘 {formatEta(eta)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

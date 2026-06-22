import React, { useState } from 'react'
import { Clock, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react'
import { DeltaBadge } from './DeltaBadge'
import { DeleteConfirmModal } from './DeleteConfirmModal'

interface RunData {
  id: string
  timestamp: string
  avgScore: number
  prevAvgScore: number
  modelCount: number
  status: 'success' | 'failed' | 'running'
}

interface HistoryRunCardProps {
  run: RunData
  isSelected: boolean
  onSelect: () => void
  onDelete?: () => Promise<void>
  compact?: boolean
  isEditMode?: boolean
  isChecked?: boolean
  onToggle?: (id: string) => void
}

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const diffMs = now - then
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return '剛剛'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分鐘前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小時前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return new Date(iso).toLocaleDateString('zh-TW')
}

const STATUS_MAP = {
  success: { dot: 'bg-emerald-500', label: '完成', Icon: CheckCircle2 },
  failed: { dot: 'bg-rose-500', label: '失敗', Icon: XCircle },
  running: { dot: 'bg-amber-500 animate-pulse', label: '執行中', Icon: Loader2 },
} as const

export const HistoryRunCard: React.FC<HistoryRunCardProps> = ({ run, isSelected, onSelect, onDelete, compact = false, isEditMode = false, isChecked = false, onToggle }) => {
  const status = STATUS_MAP[run.status]
  const StatusIcon = status.Icon
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteConfirm() {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmOpen(true)
  }

  function handleCancelDelete() {
    setConfirmOpen(false)
  }

  if (compact) {
    return (
      <>
        {confirmOpen && (
          <DeleteConfirmModal
            onConfirm={() => void handleDeleteConfirm()}
            onCancel={handleCancelDelete}
            deleting={deleting}
          />
        )}
        <div className="relative flex items-center gap-1.5">
          {/* Checkbox — slide in when edit mode is active */}
          <div
            className={`overflow-hidden transition-all duration-200 flex items-center ${
              isEditMode ? 'w-5 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle?.(run.id)}
              onClick={e => e.stopPropagation()}
              className="w-4 h-4 rounded accent-red-500 cursor-pointer"
              aria-label={`選取 ${run.id}`}
            />
          </div>

          <button
            type="button"
            onClick={() => { if (isEditMode) { onToggle?.(run.id) } else { onSelect() } }}
            aria-pressed={isEditMode ? isChecked : isSelected}
            className={`group flex-1 text-left cursor-pointer rounded-md border transition-all duration-300 ease-out overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background border-l-4
              ${
                isEditMode && isChecked
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-400'
                  : isSelected && !isEditMode
                    ? 'bg-secondary border-primary/50 shadow-lg shadow-primary/5'
                    : 'bg-card border-transparent hover:border-primary/30 hover:bg-accent/50'
              }`}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[80px]">{run.id.slice(0, 8)}</span>
                <div className="flex items-center gap-1.5">
                  {!isEditMode && onDelete && (
                    <span
                      role="button"
                      tabIndex={0}
                      title="刪除此 run"
                      aria-label="刪除此 run"
                      onClick={handleDeleteClick}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDeleteClick(e as unknown as React.MouseEvent)}
                      className="p-0.5 rounded text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 size={11} />
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[11px]">
                    <StatusIcon size={11} className={run.status === 'success' ? 'text-emerald-500' : run.status === 'failed' ? 'text-rose-500' : 'text-amber-500 animate-spin'} aria-hidden="true" />
                    <span className={run.status === 'success' ? 'text-emerald-500' : run.status === 'failed' ? 'text-rose-500' : 'text-amber-500'}>
                      {run.modelCount}M
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                  <Clock size={10} aria-hidden="true" />
                  <span>{relativeTime(run.timestamp)}</span>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold font-mono leading-tight tabular-nums ${
                    isEditMode && isChecked ? 'text-red-500' : 'text-foreground'
                  }`}>
                    {(run.avgScore * 100).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            {isSelected && !isEditMode && <div className="h-1 brand-gradient" />}
          </button>
        </div>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`relative w-full text-left p-4 rounded-md border transition-all duration-300 cursor-pointer select-none overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isSelected
          ? 'bg-secondary border-primary/80 shadow-md shadow-primary/10 ring-1 ring-primary/30'
          : 'bg-card border-border hover:border-border/80 hover:bg-accent/50'
        }`}
    >
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 brand-gradient" />
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[11px] font-mono text-muted-foreground block mb-0.5">ID: {run.id.slice(0, 8)}</span>
          <h4 className="text-sm font-semibold text-foreground">{relativeTime(run.timestamp)}</h4>
        </div>
        <DeltaBadge currentScore={run.avgScore} previousScore={run.prevAvgScore} />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-2">
        <div className="flex items-center gap-1.5">
          <StatusIcon size={12} className={run.status === 'success' ? 'text-emerald-500' : run.status === 'failed' ? 'text-rose-500' : 'text-amber-500 animate-spin'} aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground">{run.modelCount} Models · {status.label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono text-foreground tabular-nums">
            {(run.avgScore * 100).toFixed(1)}
          </span>
        </div>
      </div>
    </button>
  )
}

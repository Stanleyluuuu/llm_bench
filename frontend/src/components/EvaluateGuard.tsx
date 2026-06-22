import { memo, useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { BenchModel } from '@/types/store'

// ---------------------------------------------------------------------------
// EvaluateGuard — AlertDialog when models are unverified/failed
// ---------------------------------------------------------------------------

interface EvaluateGuardProps {
  open: boolean
  unverifiedModels: BenchModel[]
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Shows a warning dialog when attempting to evaluate with unverified or
 * failed-connection models. User can proceed anyway or cancel.
 */
export const EvaluateGuard = memo(function EvaluateGuard({
  open,
  unverifiedModels,
  onConfirm,
  onCancel,
}: EvaluateGuardProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus trap: focus first button on open, trap Tab, Escape closes
  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])')
    focusable[0]?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onCancel(); return }
      if (e.key !== 'Tab' || !focusable.length) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  const failedModels = unverifiedModels.filter(m => m.connectionStatus === 'failed')
  const pendingModels = unverifiedModels.filter(m => m.connectionStatus === 'unverified' || m.connectionStatus === 'verifying')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guard-title"
      aria-describedby="guard-desc"
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      {/* Dialog */}
      <div ref={dialogRef} className="relative z-50 w-full max-w-md bg-card border border-border rounded-md shadow-xl p-6 space-y-4 animate-scale-in">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950/50">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 id="guard-title" className="text-base font-semibold text-foreground">
              部分模型尚未通過連線驗證
            </h3>
            <p id="guard-desc" className="text-sm text-muted-foreground mt-1">
              以下模型可能無法正常回應，是否仍要開始評估？
            </p>
          </div>
        </div>

        {/* Model list */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {failedModels.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-red-650 dark:text-red-400 uppercase">連線失敗</span>
              {failedModels.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-2 py-1 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-850">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-mono text-foreground">{m.display_name || m.name}</span>
                  {m.validate_error && (
                    <span className="text-[10px] text-red-500 ml-auto truncate max-w-32">{m.validate_error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {pendingModels.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase">未驗證</span>
              {pendingModels.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-mono text-foreground">{m.display_name || m.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            仍然開始
          </button>
        </div>
      </div>
    </div>
  )
})
